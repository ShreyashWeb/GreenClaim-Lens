export interface ProductData {
  barcode: string;
  name?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  packagingClaims: string[];
  certifications: string[];
  found: boolean;
}

// Built-in offline fallback database for common Indian FMCG / packaging claims
const OFFLINE_PRODUCT_CATALOG: Record<string, Omit<ProductData, 'barcode' | 'found'>> = {
  '8901030382345': {
    name: 'Eco-Care Bamboo Toothbrush',
    brand: 'NatureFresh India',
    category: 'Oral Care',
    packagingClaims: ['100% biodegradable handle', 'plastic-free packaging'],
    certifications: ['FSC Certified Bamboo'],
  },
  '8901058852394': {
    name: 'Herbal Infusion Cleanser',
    brand: 'GreenEarth Wellness',
    category: 'Cosmetics',
    packagingClaims: ['100% natural ingredients', 'zero chemical additives'],
    certifications: [],
  },
  '8902519001234': {
    name: 'Recycled Paper Note Pad',
    brand: 'Kagaz Eco',
    category: 'Stationery',
    packagingClaims: ['Made from 100% post-consumer recycled paper'],
    certifications: ['ISO 14021 Recycled Content'],
  },
};

/**
 * Detects barcodes from an image source using browser native BarcodeDetector if available.
 */
export async function detectBarcodeFromImage(
  imageSource: ImageBitmapSource,
): Promise<string | null> {
  // Check if native BarcodeDetector is supported
  if (typeof window !== 'undefined') {
    try {
      const win = window as unknown as {
        BarcodeDetector?: new (opts?: { formats: string[] }) => {
          detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
        };
      };
      if (win.BarcodeDetector) {
        const detector = new win.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });
        const barcodes = await detector.detect(imageSource);
        if (barcodes.length > 0 && barcodes[0]?.rawValue) {
          return barcodes[0].rawValue;
        }
      }
    } catch (err) {
      console.warn('BarcodeDetector invocation failed:', err);
    }
  }

  return null;
}

/**
 * Looks up product information and environmental claims from Open Food Facts with offline fallback.
 */
export async function lookupProductByBarcode(barcode: string): Promise<ProductData> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    throw new Error('Barcode cannot be empty');
  }

  // 1. Check local catalog first
  const offlineMatch = OFFLINE_PRODUCT_CATALOG[cleanBarcode];
  if (offlineMatch) {
    return {
      barcode: cleanBarcode,
      name: offlineMatch.name,
      brand: offlineMatch.brand,
      category: offlineMatch.category,
      packagingClaims: [...offlineMatch.packagingClaims],
      certifications: [...offlineMatch.certifications],
      found: true,
    };
  }

  // 2. Query public Open Food Facts API with 4s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GreenClaimLens/1.0 (https://github.com/ShreyashWeb/GreenClaim-Lens)',
        },
      },
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as {
        status?: number;
        product?: {
          product_name?: string;
          brands?: string;
          categories?: string;
          labels_tags?: string[];
          packaging_text?: string;
        };
      };

      if (data.status === 1 && data.product) {
        const p = data.product;
        const claims: string[] = [];
        if (p.packaging_text) claims.push(p.packaging_text);
        if (p.labels_tags) {
          claims.push(...p.labels_tags.map((l) => l.replace(/^en:/, '').replace(/-/g, ' ')));
        }

        return {
          barcode: cleanBarcode,
          name: p.product_name,
          brand: p.brands,
          category: p.categories,
          packagingClaims: claims,
          certifications: (p.labels_tags ?? []).filter(
            (l) => l.includes('certif') || l.includes('bio'),
          ),
          found: true,
        };
      }
    }
  } catch {
    // Network failure or timeout: graceful fallback
  }

  return {
    barcode: cleanBarcode,
    packagingClaims: [],
    certifications: [],
    found: false,
  };
}
