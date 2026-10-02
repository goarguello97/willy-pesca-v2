import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "productos";
export const MAXIMO_FOTOS = 8;

const LADO_MAXIMO = 1600;
const CALIDAD = 0.82;

type Comprimida = { blob: Blob; extension: "webp" | "jpg"; tipo: "image/webp" | "image/jpeg" };

const aBlob = (lienzo: HTMLCanvasElement, tipo: string) =>
  new Promise<Blob | null>((ok) => lienzo.toBlob(ok, tipo, CALIDAD));

/**
 * Achica la foto a 1600 px de lado como máximo y la recomprime en el navegador
 * (WebP, o JPEG donde el navegador no sabe generar WebP). Una foto de celular
 * de 4 MB queda en unos 150 a 300 KB.
 */
export async function comprimirImagen(archivo: File): Promise<Comprimida> {
  let imagen: ImageBitmap;
  try {
    imagen = await createImageBitmap(archivo);
  } catch {
    throw new Error(`No se pudo leer "${archivo.name}". Probá con una foto JPG o PNG.`);
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("El navegador no pudo procesar la foto.");
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();

  const webp = await aBlob(lienzo, "image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, extension: "webp", tipo: "image/webp" };
  const jpg = await aBlob(lienzo, "image/jpeg");
  if (!jpg) throw new Error(`No se pudo comprimir "${archivo.name}".`);
  return { blob: jpg, extension: "jpg", tipo: "image/jpeg" };
}

/** Sube la foto ya comprimida a productos/<idProducto>/<uuid>.<ext>. */
export async function subirImagen(
  sb: SupabaseClient,
  idProducto: string,
  archivo: File,
): Promise<{ url: string; ruta: string }> {
  const { blob, extension, tipo } = await comprimirImagen(archivo);
  const ruta = `${idProducto}/${crypto.randomUUID()}.${extension}`;
  const { error } = await sb.storage.from(BUCKET).upload(ruta, blob, {
    contentType: tipo,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`No se pudo subir "${archivo.name}": ${error.message}`);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(ruta);
  return { url: data.publicUrl, ruta };
}

/** Borra fotos del bucket; ignora las que vienen con el sitio (sin ruta). */
export async function borrarArchivos(sb: SupabaseClient, rutas: Array<string | null>) {
  const enStorage = rutas.filter((r): r is string => Boolean(r));
  if (!enStorage.length) return;
  const { error } = await sb.storage.from(BUCKET).remove(enStorage);
  if (error) throw new Error(`No se pudieron borrar fotos: ${error.message}`);
}
