/**
 * Generates the displacement map that powers real refraction in `.glass`
 * panels. Each pixel encodes a displacement vector (R = x, G = y, 128 =
 * neutral): the center is untouched, and pixels near the edge pull the
 * backdrop inward — the lens-edge bending that makes iOS Liquid Glass read
 * as curved glass instead of frosted plastic.
 */
export function generateDisplacementMap(size = 256): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(size, size);
  const data = img.data;

  const smoothstep = (a: number, b: number, t: number) => {
    const x = Math.min(Math.max((t - a) / (b - a), 0), 1);
    return x * x * (3 - 2 * x);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / (size - 1)) * 2 - 1;
      const ny = (y / (size - 1)) * 2 - 1;
      // Superellipse distance approximates a rounded-rect lens profile
      const d = Math.pow(
        Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4),
        1 / 4,
      );
      const edge = smoothstep(0.55, 1.0, d);
      const dx = -nx * edge;
      const dy = -ny * edge;

      const i = (y * size + x) * 4;
      data[i] = Math.round(128 + dx * 110);
      data[i + 1] = Math.round(128 + dy * 110);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}
