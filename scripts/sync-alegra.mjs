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

// ---------------------------------------------------------------------------
// Normalización de categorías: nombre de Alegra -> nombre canónico del catálogo
// ---------------------------------------------------------------------------
const MAPA_CATEGORIAS = {
  'peluqueras | clippers': 'Peluqueras',
  'afeitadoras | shaver': 'Afeitadoras',
  'afeitadora': 'Afeitadoras',
  'patilleras | trimmers': 'Patilleras',
  'voluminizantes | polvos texturizantes': 'Voluminizantes',
  'masajeador eletrobell': 'Masajeadores y spa de pies',
};

function normalizarCategoria(nombre) {
  if (!nombre) return null;
  const limpio = String(nombre).trim();
  const clave = limpio.toLowerCase();
  return MAPA_CATEGORIAS[clave] || limpio;
}

// ---------------------------------------------------------------------------
// Inferencia de categoría SOLO como respaldo (cuando Alegra no trae ninguna)
// Orden importa: lo más específico primero.
// ---------------------------------------------------------------------------
const INFERENCIA_CATEGORIA = [
  ['Peluqueras', /\b(peluquer|clipper|m[aá]quina de corte)\b/i],
  ['Patilleras', /\b(patillera|trimmer)\b/i],
  ['Afeitadoras', /\b(afeitadora|shaver|foil)\b/i],
  ['Trimmers de Nariz', /\b(nariz|nose)\b/i],
  ['Planchas', /\bplancha\b/i],
  ['Secadores y cepillo secador', /\b(secador|blower)\b/i],
  ['Rizadoras, pinzas y conos', /\b(rizadora|ondulador|cono)\b/i],
  ['Tijeras', /\btijera/i],
  ['Barberas y Minoras', /\b(barbera|minora|navaja)\b/i],
  ['Cabezotes', /\bcabezote\b/i],
  ['Guias de Corte', /\b(gu[ií]a de corte|peine guia)\b/i],
  ['Ceras', /\bcera\b/i],
  ['Geles, balsamos y cremas de peinar', /\b(gel|b[aá]lsamo|pomada)\b/i],
  ['Lacas', /\blaca\b/i],
  ['Shampoos y Acondicionadores', /\b(shampoo|champ[uú]|acondicionador)\b/i],
  ['Keratinas, serums y tratamientos capilares', /\b(keratina|queratina|serum|s[eé]rum)\b/i],
  ['Pigmentos, fibras, tintes y aerografos', /\b(pigmento|fibra|tinte|aer[oó]grafo)\b/i],
  ['After Shave', /\bafter\s*shave\b/i],
  ['Shaving Gel', /\bshaving\b/i],
  ['Talcos', /\btalco\b/i],
  ['Cremas, exfoliantes y vaselinas', /\b(exfoliante|vaselina)\b/i],
  ['Mascarillas, velos y tratamientos faciales', /\b(mascarilla|velo facial)\b/i],
  ['Barba', /\bbarba\b/i],
  ['Tatuajes', /\btatuaje\b/i],
  ['Capas', /\bcapa\b/i],
  ['Cuelleros, toallas y paños', /\b(cuellero|toalla|pa[ñn]o)\b/i],
  ['Atomizadores, pulverizadores y sprays', /\b(atomizador|pulverizador|nano\s*spray|spray)\b/i],
  ['Brochas, talqueras y sacudidores', /\b(brocha|talquera|sacudidor)\b/i],
  ['Peinillas', /\b(peinilla|peine)\b/i],
  ['Cepillos', /\bcepillo\b/i],
  ['Tapetes, bases y puesto de trabajo', /\b(tapete|base|organizador)\b/i],
  ['Caimanes, pinzas y sujetadores', /\b(caim[aá]n|sujetador|clip)\b/i],
  ['Maletas, gorras y accesorios', /\b(maleta|gorra|mochila)\b/i],
  ['Repuestos', /\brepuesto\b/i],
  ['Lubricantes, Aceites y Mantenimiento', /\b(lubricante|aceite|oil)\b/i],
  ['Minoxidil', /\bminoxidil\b/i],
  ['Combos', /\b(combo|kit)\b/i],
];

function inferirCategoria(nombre) {
  const n = nombre || '';
  for (const [cat, re] of INFERENCIA_CATEGORIA) {
    if (re.test(n)) return cat;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Inferencia de marca por el nombre del producto
// ---------------------------------------------------------------------------
const MARCAS = [
  ['StyleCraft', /\bstyle\s*craft\b/i],
  ['Old School', /\bold\s*school\b/i],
  ['Very Secret', /\bvery\s*secret\b/i],
  ['Level3', /\blevel\s*3\b/i],
  ['WMark', /\bw\s*-?\s*mark\b/i],
  ['Babyliss', /\bbaby\s*liss\b/i],
  ['Wahl', /\bwahl\b/i],
  ['Andis', /\bandis\b/i],
  ['VGR', /\bvgr\b/i],
  ['Reuzel', /\breuzel\b/i],
  ['JRL', /\bjrl\b/i],
  ['Turbox', /\bturbox\b/i],
  ['Kemei', /\bkemei\b/i],
  ['Electrobell', /\belectrobell\b/i],
  ['Street', /\bstreet\b/i],
];

function inferirMarca(nombre) {
  const n = nombre || '';
  for (const [marca, re] of MARCAS) {
    if (re.test(n)) return marca;
  }
  return null;
}

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

  let start = 0, total = null, vistos = 0, imgNuevas = 0, conMarca = 0, inferidas = 0;
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

      const nombre = limpiarNombre(item.name);
      const catAlegra = normalizarCategoria(item.itemCategory?.name);
      const categoria = catAlegra || inferirCategoria(nombre);
      if (!catAlegra && categoria) inferidas++;
      const marca = inferirMarca(nombre);
      if (marca) conMarca++;

      const stock = Math.max(0, Math.trunc(item.inventory?.availableQuantity ?? 0));
      filas.push({
        alegra_item_id: idStr,
        nombre,
        categoria,
        marca,
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

  const { error: errOff } = await supabase
    .from('productos')
    .update({ activo: false })
    .lt('stock_updated_at', runStart)
    .not('alegra_item_id', 'is', null);
  if (errOff) console.error(`Apagar salientes: ${errOff.message}`);

  console.log(`\nSync listo. ${vistos} productos revisados, ${imgNuevas} imagenes actualizadas, ${conMarca} con marca, ${inferidas} categorias inferidas por texto.`);
}

main().catch((e) => { console.error('Error fatal:', e.message); process.exit(1); });
