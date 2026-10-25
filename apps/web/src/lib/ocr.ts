import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  lowConfidence: boolean;
  language: string;
}

export interface OcrOptions {
  languages?: string; // e.g. 'eng' or 'eng+hin'
  confidenceThreshold?: number;
  onProgress?: (progress: number, status: string) => void;
  visionFallback?: (image: Blob | string) => Promise<string>;
}

/**
 * Preprocesses image canvas to boost OCR readability on packaging photos.
 */
export function preprocessImageForOcr(
  canvas: HTMLCanvasElement,
  contrastFactor = 1.2,
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Grayscale and contrast adjustment
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const contrasted = Math.min(255, Math.max(0, (gray - 128) * contrastFactor + 128));

    data[i] = contrasted;
    data[i + 1] = contrasted;
    data[i + 2] = contrasted;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Extracts packaging text in-browser using Tesseract.js with fallback support.
 */
export async function performOcr(
  image: Blob | File | string,
  options: OcrOptions = {},
): Promise<OcrResult> {
  const languages = options.languages ?? 'eng';
  const confidenceThreshold = options.confidenceThreshold ?? 60;

  try {
    options.onProgress?.(0.1, 'Initializing OCR worker...');
    const worker = await createWorker(languages);

    options.onProgress?.(0.4, 'Recognizing environmental claim text...');
    const ret = await worker.recognize(image);
    await worker.terminate();

    options.onProgress?.(1.0, 'OCR Complete');

    const cleanText = ret.data.text.replace(/\s+/g, ' ').trim();
    const confidence = ret.data.confidence;
    const lowConfidence = confidence < confidenceThreshold || cleanText.length < 3;

    // Trigger vision fallback if provided and confidence is low
    if (lowConfidence && options.visionFallback) {
      options.onProgress?.(0.8, 'Low OCR confidence. Engaging vision model fallback...');
      try {
        const fallbackText = await options.visionFallback(image);
        if (fallbackText.trim()) {
          return {
            text: fallbackText.trim(),
            confidence: 90,
            lowConfidence: false,
            language: languages,
          };
        }
      } catch {
        // Fallback failed, continue with local OCR output
      }
    }

    return {
      text: cleanText,
      confidence,
      lowConfidence,
      language: languages,
    };
  } catch (error) {
    if (options.visionFallback) {
      const fallbackText = await options.visionFallback(image);
      return {
        text: fallbackText.trim(),
        confidence: 85,
        lowConfidence: false,
        language: languages,
      };
    }
    throw error;
  }
}
