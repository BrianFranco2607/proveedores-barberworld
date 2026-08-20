import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const { ALEGRA_EMAIL, ALEGRA_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!ALEGRA_EMAIL || !ALEGRA_TOKEN || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno. Revisa .env.local');
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const ALEGRA_BASE = 'https://api.alegra.com/api/v1';
const AUTH = 'Basic ' + Buffer.from(`${ALEGRA_EMAIL}:${ALEGRA_TOKEN}`).toString('base64');
const CHECKPOINT = 'scripts/.import-checkpoint';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const limpiarNombre = (n) => (n || '').replace(/^\s*\d+[.)-]\s*/, '').trim();

async function conReintento(fn, etiqueta, intentos = 4) {
  for (let i = 1; i <= intentos; i++) {
    try {
      return await fn();
    } catch (e) {
      const esUltimo = i === intentos;
      console.warn(`${etiqueta}: intento ${i}/${intentos} falló (${e.message})${esUltimo ? '' : ', reintentando...'}`);
      if (esUltimo) throw e;
      await sleep(2000 * i);
    }
  }
}

async function traerPagina(start) {
  return conReintento(async () => {
    const url = `${ALEGRA_BASE}/items?start=${start}&limit=30&status=active&fields=inventory,images&metadata=true`;
    const res = await fetch(url, { headers: { Authorization: AUTH, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Alegra ${res.status}: ${await res.text()}`);
    const json = await res.json();
    return Array.isArray(json)
      ? { data: json, total: null }
      : { data: json.data || [], total: json?.metadata?.total ?? null };
  }, `Página start=${start}`);
}

async function subirImagen(item) {
  const imgs = item.images || [];
  const img = imgs.find((i) => i.favorite) || imgs[0];
  if (!img?.url) return null;
  try {
    return await conReintento(async () => {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const tipo = res.headers.get('content-type') || 'image/jpeg';
      const ext = tipo.includes('png') ? 'png' : tipo.includes('webp') ? 'webp' : 'jpg';
      const ruta = `${item.id}.${ext}`;
      const { error } = await supabase.storage.from('productos').upload(ruta, buf, { contentType: tipo, upsert: true });
      if (error) throw new Error(error.message);
      return supabase.storage.from('productos').getPublicUrl(ruta).data.publicUrl;
    }, `Imagen ${item.id}`, 3);
  } catch {
    console.warn(`Imagen ${item.id}: se omite tras varios intentos`);
    return null;
  }
}

async function main() {
  let start = existsSync(CHECKPOINT) ? parseInt(readFileSync(CHECKPOINT, 'utf8'), 10) || 0 : 0;
  if (start > 0) console.log(`Reanudando desde start=${start}`);

  let total = null, procesados = 0, conImagen = 0;
  do {
    const { data, total: t } = await traerPagina(start);
    if (t != null) total = t;
    if (!data.length) break;

    for (const item of data) {
      const imagen_url = await subirImagen(item);
      if (imagen_url) conImagen++;
      const stock = Math.max(0, Math.trunc(item.inventory?.availableQuantity ?? 0));
      const fila = {
        alegra_item_id: String(item.id),
        nombre: limpiarNombre(item.name),
        categoria: item.itemCategory?.name ?? null,
        imagen_url,
        stock,
        stock_updated_at: new Date().toISOString(),
        activo: stock > 0,
        precio: 0,
      };
      const { error } = await supabase.from('productos').upsert(fila, { onConflict: 'alegra_item_id' });
      if (error) console.error(`DB ${item.id}: ${error.message}`);
      else procesados++;
    }

    start += 30;
    writeFileSync(CHECKPOINT, String(start));
    console.log(`Progreso: ${start > total ? total : start}/${total ?? '?'}`);
    await sleep(250);
  } while (total == null || start < total);

  writeFileSync(CHECKPOINT, '0');
  console.log(`\nListo. ${procesados} productos procesados en esta corrida, ${conImagen} con imagen.`);
}

main().catch((e) => { console.error('Error fatal:', e.message); process.exit(1); });