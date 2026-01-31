/**
 * Image Processing Utilities for Photo Editor
 * Client-side canvas-based image manipulation
 */

export interface ImageAdjustments {
    // Basic
    brightness: number;      // -100 to 100
    contrast: number;        // -100 to 100
    saturation: number;      // -100 to 100
    vibrance: number;        // -100 to 100
    // Tonal
    highlights: number;      // -100 to 100
    shadows: number;         // -100 to 100
    exposure: number;        // -100 to 100
    gamma: number;           // 0.2 to 5 (1 = normal)
    // Color
    temperature: number;     // -100 to 100 (warm/cool)
    tint: number;            // -100 to 100 (green/magenta)
    // Detail
    sharpen: number;         // 0 to 100
    clarity: number;         // -100 to 100
    // RGB
    redChannel: number;      // -100 to 100
    greenChannel: number;    // -100 to 100
    blueChannel: number;     // -100 to 100
}

export interface CropSettings {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;        // degrees
    flipHorizontal: boolean;
    flipVertical: boolean;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    highlights: 0,
    shadows: 0,
    exposure: 0,
    gamma: 1,
    temperature: 0,
    tint: 0,
    sharpen: 0,
    clarity: 0,
    redChannel: 0,
    greenChannel: 0,
    blueChannel: 0,
};

export const DEFAULT_CROP: CropSettings = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
};

/**
 * Apply all adjustments to image data
 */
export function applyAdjustments(
    imageData: ImageData,
    adjustments: ImageAdjustments
): ImageData {
    const data = imageData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply RGB channel adjustments
        r = clamp(r + adjustments.redChannel * 2.55);
        g = clamp(g + adjustments.greenChannel * 2.55);
        b = clamp(b + adjustments.blueChannel * 2.55);

        // Apply exposure
        const exposureFactor = Math.pow(2, adjustments.exposure / 100);
        r = clamp(r * exposureFactor);
        g = clamp(g * exposureFactor);
        b = clamp(b * exposureFactor);

        // Apply gamma
        const gammaCorrection = 1 / adjustments.gamma;
        r = clamp(255 * Math.pow(r / 255, gammaCorrection));
        g = clamp(255 * Math.pow(g / 255, gammaCorrection));
        b = clamp(255 * Math.pow(b / 255, gammaCorrection));

        // Apply brightness
        const brightnessFactor = adjustments.brightness * 2.55;
        r = clamp(r + brightnessFactor);
        g = clamp(g + brightnessFactor);
        b = clamp(b + brightnessFactor);

        // Apply contrast
        const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
        r = clamp(contrastFactor * (r - 128) + 128);
        g = clamp(contrastFactor * (g - 128) + 128);
        b = clamp(contrastFactor * (b - 128) + 128);

        // Apply temperature (warm/cool)
        if (adjustments.temperature !== 0) {
            const tempFactor = adjustments.temperature / 100;
            r = clamp(r + tempFactor * 30);
            b = clamp(b - tempFactor * 30);
        }

        // Apply tint (green/magenta)
        if (adjustments.tint !== 0) {
            const tintFactor = adjustments.tint / 100;
            g = clamp(g + tintFactor * 30);
        }

        // Apply saturation
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const satFactor = 1 + adjustments.saturation / 100;
        r = clamp(gray + satFactor * (r - gray));
        g = clamp(gray + satFactor * (g - gray));
        b = clamp(gray + satFactor * (b - gray));

        // Apply vibrance (smarter saturation that protects skin tones)
        if (adjustments.vibrance !== 0) {
            const maxColor = Math.max(r, g, b);
            const minColor = Math.min(r, g, b);
            const saturationLevel = (maxColor - minColor) / 255;
            const vibFactor = (1 - saturationLevel) * (adjustments.vibrance / 100);
            r = clamp(gray + (1 + vibFactor) * (r - gray));
            g = clamp(gray + (1 + vibFactor) * (g - gray));
            b = clamp(gray + (1 + vibFactor) * (b - gray));
        }

        // Apply highlights
        if (adjustments.highlights !== 0) {
            const highlightThreshold = 200;
            const highlightFactor = adjustments.highlights / 100;
            if (r > highlightThreshold) r = clamp(r + (r - highlightThreshold) * highlightFactor * 0.5);
            if (g > highlightThreshold) g = clamp(g + (g - highlightThreshold) * highlightFactor * 0.5);
            if (b > highlightThreshold) b = clamp(b + (b - highlightThreshold) * highlightFactor * 0.5);
        }

        // Apply shadows
        if (adjustments.shadows !== 0) {
            const shadowThreshold = 55;
            const shadowFactor = adjustments.shadows / 100;
            if (r < shadowThreshold) r = clamp(r + (shadowThreshold - r) * shadowFactor * 0.5);
            if (g < shadowThreshold) g = clamp(g + (shadowThreshold - g) * shadowFactor * 0.5);
            if (b < shadowThreshold) b = clamp(b + (shadowThreshold - b) * shadowFactor * 0.5);
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    // Apply clarity (local contrast) - simplified version
    if (adjustments.clarity !== 0) {
        applyClarity(imageData, adjustments.clarity);
    }

    return imageData;
}

/**
 * Apply clarity (local contrast enhancement)
 */
function applyClarity(imageData: ImageData, clarity: number): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const factor = clarity / 200;

    // Create a copy for unsharp mask
    const original = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            // Simple 3x3 unsharp mask for clarity
            for (let c = 0; c < 3; c++) {
                const center = original[idx + c];
                const neighbors =
                    original[((y - 1) * width + x) * 4 + c] +
                    original[((y + 1) * width + x) * 4 + c] +
                    original[(y * width + x - 1) * 4 + c] +
                    original[(y * width + x + 1) * 4 + c];

                const blur = neighbors / 4;
                const detail = center - blur;
                data[idx + c] = clamp(center + detail * factor);
            }
        }
    }
}

/**
 * Apply sharpening to canvas
 */
export function applySharpen(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    amount: number
): ImageData {
    if (amount <= 0) return imageData;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const factor = amount / 100;

    const original = new Uint8ClampedArray(data);

    // Sharpen kernel
    const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let ki = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += original[pixelIdx] * kernel[ki];
                        ki++;
                    }
                }
                // Blend with original based on amount
                data[idx + c] = clamp(original[idx + c] * (1 - factor) + sum * factor);
            }
        }
    }

    return imageData;
}

/**
 * Apply crop, rotation, and flip to canvas
 */
export function applyCropTransform(
    sourceCanvas: HTMLCanvasElement,
    crop: CropSettings,
    targetWidth: number,
    targetHeight: number
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Calculate crop area in pixels
    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;
    const cropX = (crop.x / 100) * sourceWidth;
    const cropY = (crop.y / 100) * sourceHeight;
    const cropW = (crop.width / 100) * sourceWidth;
    const cropH = (crop.height / 100) * sourceHeight;

    ctx.save();

    // Move to center
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation
    ctx.rotate((crop.rotation * Math.PI) / 180);

    // Apply flip
    const scaleX = crop.flipHorizontal ? -1 : 1;
    const scaleY = crop.flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // Draw the image
    ctx.drawImage(
        sourceCanvas,
        cropX, cropY, cropW, cropH,
        -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight
    );

    ctx.restore();

    return canvas;
}

/**
 * Export canvas to blob with quality settings
 */
export async function exportToBlob(
    canvas: HTMLCanvasElement,
    maxDimension: number = 1920,
    quality: number = 0.92,
    format: 'image/webp' | 'image/jpeg' = 'image/webp'
): Promise<Blob> {
    // Calculate output dimensions
    const { width, height } = canvas;
    let outputWidth = width;
    let outputHeight = height;

    if (width > height && width > maxDimension) {
        outputWidth = maxDimension;
        outputHeight = Math.round((height / width) * maxDimension);
    } else if (height >= width && height > maxDimension) {
        outputHeight = maxDimension;
        outputWidth = Math.round((width / height) * maxDimension);
    }

    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const ctx = outputCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, outputWidth, outputHeight);

    return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    // Fallback to JPEG if WebP fails
                    outputCanvas.toBlob(
                        (jpegBlob) => {
                            if (jpegBlob) resolve(jpegBlob);
                            else reject(new Error('Failed to export image'));
                        },
                        'image/jpeg',
                        quality
                    );
                }
            },
            format,
            quality
        );
    });
}

/**
 * Blend adjustments with a preset at a given intensity
 */
export function blendWithPreset(
    currentAdjustments: ImageAdjustments,
    presetAdjustments: Partial<ImageAdjustments>,
    intensity: number // 0-100
): ImageAdjustments {
    const factor = intensity / 100;
    const result = { ...currentAdjustments };

    for (const key of Object.keys(presetAdjustments) as (keyof ImageAdjustments)[]) {
        const presetValue = presetAdjustments[key];
        if (presetValue !== undefined) {
            const defaultValue = DEFAULT_ADJUSTMENTS[key];
            result[key] = defaultValue + (presetValue - defaultValue) * factor;
        }
    }

    return result;
}

/**
 * Load image from URL to canvas - uses fetch to avoid CORS issues
 */
export function loadImageToCanvas(url: string): Promise<HTMLCanvasElement> {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch the image as blob to avoid CORS issues
            const response = await fetch(url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load image'));
            };
            img.src = objectUrl;
        } catch (error) {
            // Fallback to direct loading if fetch fails
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = reject;
            img.src = url;
        }
    });
}

/**
 * Utility: clamp value to 0-255
 */
function clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Get aspect ratio value from preset name
 */
export function getAspectRatioValue(ratio: string): number | null {
    const ratios: Record<string, number> = {
        'free': 0,
        '1:1': 1,
        '4:3': 4 / 3,
        '3:4': 3 / 4,
        '16:9': 16 / 9,
        '9:16': 9 / 16,
    };
    return ratios[ratio] ?? null;
}
