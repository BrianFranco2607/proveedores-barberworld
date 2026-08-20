import { createClient } from '@supabase/supabase-js';

const { ALEGRA_EMAIL, ALEGRA_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!ALEGRA_EMAIL || !ALEGRA_TOKEN || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno. Revisa .env.local');
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const ALEGRA_BASE = 'https://api.alegra.com/api/v1';
const AUTH = 'Basic ' + Buffer.from(`${ALEGRA_EMAIL}:${ALEGRA_TOKEN}`).toString('base64');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const limpiarNombre = (n) => (n || '').replace(/^\s*\d+[.)-]\s*/, '').trim();

async function conReintento(fn, etiqueta, intentos = 4) {
  for (let i = 1; i <= intentos; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === intentos) throw e;
      console.warn(`${etiqueta}: intento ${i} falló (${e.message}), reintentando...`);
      await sleep(2000 * i);
    }
  }
}

// Carga el estado actual de la base para saber qué imagen ya tiene cada producto
async function cargarMapa() {
  const mapa = new Map();
  let from = 0;
  const size = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from('productos')
      .select('alegra_item_id, alegra_image_id, imagen_url')
      .not('alegra_item_id', 'is', null)
      .range(from, from + size - 1);
    if (error) throw new Error(error.message);
    if (!data.length) break;
    for (const r of data) mapa.set(r.alegra_item_id, r);
    if (data.length < size) break;
    from += size;
  }
  return mapa;
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

async function reHospedar(item) {
  const imgs = item.images || [];
  const img = imgs.find((i) => i.favorite) || imgs[0];
  if (!img?.url) return null;
  return conReintento(async () => {
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
}

async function main() {
  const runStart = new Date().toISOString();
  console.log('Cargando estado actual de la base...');
  const mapa = await cargarMapa();

  let start = 0, total = null, vistos = 0, imgNuevas = 0;
  do {
    const { data, total: t } = await traerPagina(start);
    if (t != null) total = t;
    if (!data.length) break;

    const filas = [];
    for (const item of data) {
      const idStr = String(item.id);
      const existente = mapa.get(idStr);
      const imgs = item.images || [];
      const img = imgs.find((i) => i.favorite) || imgs[0];
      const imgId = img ? String(img.id) : null;

      let imagen_url = existente?.imagen_url ?? null;
      let alegra_image_id = existente?.alegra_image_id ?? null;

      // Solo re-baja la imagen si cambió o si nunca se guardó su id
      if (imgId && imgId !== (existente?.alegra_image_id ?? null)) {
        try {
          imagen_url = await reHospedar(item);
          alegra_image_id = imgId;
          imgNuevas++;
        } catch { /* deja la imagen anterior si falla */ }
      } else if (!imgId) {
        imagen_url = null;
        alegra_image_id = null;
      }

      const stock = Math.max(0, Math.trunc(item.inventory?.availableQuantity ?? 0));
      filas.push({
        alegra_item_id: idStr,
        nombre: limpiarNombre(item.name),
        categoria: item.itemCategory?.name ?? null,
        imagen_url,
        alegra_image_id,
        stock,
        stock_updated_at: new Date().toISOString(),
        activo: stock > 0,
      });
      vistos++;
    }

    const { error } = await supabase.from('productos').upsert(filas, { onConflict: 'alegra_item_id' });
    if (error) console.error(`Upsert página ${start}: ${error.message}`);

    start += 30;
    console.log(`Sincronizados: ${start > total ? total : start}/${total ?? '?'}`);
    await sleep(200);
  } while (total == null || start < total);

  // Apaga lo que ya no vino de Alegra (desactivado o eliminado alla)
  const { error: errOff } = await supabase
    .from('productos')
    .update({ activo: false })
    .lt('stock_updated_at', runStart)
    .not('alegra_item_id', 'is', null);
  if (errOff) console.error(`Apagar salientes: ${errOff.message}`);

  console.log(`\nSync listo. ${vistos} productos activos revisados, ${imgNuevas} imagenes actualizadas.`);
}

main().catch((e) => { console.error('Error fatal:', e.message); process.exit(1); });