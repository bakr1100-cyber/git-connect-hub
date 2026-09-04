/**
 * Browser-side photo helpers used around the AI portrait retouching:
 * auto exposure correction before the request and a sharpening pass after it.
 */

const MAX_EDGE = 1600;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function toCanvas(img: HTMLImageElement) {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/** Rough blur estimate (variance of a Laplacian) — lower means blurrier. */
function blurScore(data: Uint8ClampedArray, width: number, height: number): number {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  const lum = (i: number) => 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      const value =
        4 * lum(i) -
        lum(i - 4) -
        lum(i + 4) -
        lum(i - width * 4) -
        lum(i + width * 4);
      sum += value;
      sumSq += value * value;
      count += 1;
    }
  }
  if (!count) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

export interface PhotoAnalysis {
  /** Average brightness, 0–255. */
  brightness: number;
  /** True when the photo is clearly underexposed. */
  dark: boolean;
  /** True when the photo looks soft/out of focus. */
  blurry: boolean;
}

/**
 * Stretches the histogram, lifts shadows on dark photos and returns both the
 * corrected image and what was wrong with the original.
 */
export async function autoCorrect(
  dataUrl: string
): Promise<{ image: string; analysis: PhotoAnalysis }> {
  const fallback: PhotoAnalysis = { brightness: 128, dark: false, blurry: false };
  try {
    const img = await loadImage(dataUrl);
    const target = toCanvas(img);
    if (!target) return { image: dataUrl, analysis: fallback };
    const { canvas, ctx } = target;
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    // Histogram of luminance for percentile-based black/white points.
    const histogram = new Array<number>(256).fill(0);
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      const l = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
      histogram[l] = (histogram[l] ?? 0) + 1;
      total += l;
    }
    const pixels = data.length / 4;
    const brightness = total / pixels;

    const percentile = (p: number) => {
      let seen = 0;
      const limit = pixels * p;
      for (let v = 0; v < 256; v += 1) {
        seen += histogram[v] ?? 0;
        if (seen >= limit) return v;
      }
      return 255;
    };
    const low = percentile(0.005);
    const high = percentile(0.995);
    const range = Math.max(16, high - low);
    // Gamma < 1 brightens; the darker the photo, the stronger the lift.
    const gamma = brightness < 90 ? Math.max(0.5, brightness / 128) : 1;

    const lut = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v += 1) {
      const stretched = Math.min(1, Math.max(0, (v - low) / range));
      lut[v] = Math.round(Math.pow(stretched, gamma) * 255);
    }
    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]!]!;
      data[i + 1] = lut[data[i + 1]!]!;
      data[i + 2] = lut[data[i + 2]!]!;
    }

    const analysis: PhotoAnalysis = {
      brightness,
      dark: brightness < 90,
      blurry: blurScore(data, canvas.width, canvas.height) < 120,
    };

    ctx.putImageData(frame, 0, 0);
    return { image: canvas.toDataURL("image/png"), analysis };
  } catch {
    return { image: dataUrl, analysis: fallback };
  }
}

/** Unsharp-mask style sharpening; `amount` 0–1. */
export async function sharpen(dataUrl: string, amount = 0.6): Promise<string> {
  try {
    const img = await loadImage(dataUrl);
    const target = toCanvas(img);
    if (!target) return dataUrl;
    const { canvas, ctx } = target;
    const { width, height } = canvas;
    const frame = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(frame.data);
    const out = frame.data;

    // 3x3 sharpen kernel, blended with the original by `amount`.
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c += 1) {
          let acc = 0;
          let k = 0;
          for (let ky = -1; ky <= 1; ky += 1) {
            for (let kx = -1; kx <= 1; kx += 1) {
              acc += src[((y + ky) * width + (x + kx)) * 4 + c]! * kernel[k]!;
              k += 1;
            }
          }
          const base = src[i + c]!;
          out[i + c] = Math.max(0, Math.min(255, base + (acc - base) * amount));
        }
      }
    }
    ctx.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return dataUrl;
  }
}
