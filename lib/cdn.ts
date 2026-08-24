// lib/cdn.ts

/**
 * Pide una versión optimizada de una imagen de Cloudinary.
 *
 * El backend sube el original sin transformar (`cloudinary.service.ts`), así que
 * hoy se descarga a tamaño completo para mostrarse en 40px. Insertando
 * `f_auto,q_auto,w_N` en la URL, Cloudinary devuelve WebP o AVIF según el
 * navegador y al ancho que se pide. Medido sobre imágenes reales: los símbolos
 * pasan de 30–117 KB a 1–5 KB, los banners bajan entre 50% y 70%.
 *
 * `width` es en píxeles reales, no CSS: pasá el doble del tamaño de pantalla
 * para que se vea nítido en dispositivos retina.
 *
 * Devuelve la URL intacta si no es de Cloudinary — emojis, data URIs de los QR,
 * subidas locales en desarrollo. Nunca rompe una imagen que ya funciona.
 */
export function cdn(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return undefined;
  const i = url.indexOf("/upload/");
  if (i === -1) return url;
  return `${url.slice(0, i + 8)}f_auto,q_auto,w_${width}/${url.slice(i + 8)}`;
}
