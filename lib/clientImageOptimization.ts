"use client";

const MB = 1024 * 1024;

export const MAX_UPLOAD_INPUT_SIZE = 12 * MB;
export const MAX_UPLOAD_OUTPUT_SIZE = 5 * MB;

type OptimizationProfile = {
    maxDimension: number;
    quality: number;
};

export type OptimizedImageResult = {
    file: File;
    originalSize: number;
    optimizedSize: number;
    optimized: boolean;
    width?: number;
    height?: number;
};

export function formatBytes(bytes: number): string {
    if (bytes < MB) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / MB).toFixed(1)} MB`;
}

function getOptimizationProfile(folder: string): OptimizationProfile {
    const normalizedFolder = folder.toLowerCase();

    if (normalizedFolder.includes("settings")) {
        return { maxDimension: 1920, quality: 0.82 };
    }

    if (normalizedFolder.includes("clients")) {
        return { maxDimension: 900, quality: 0.86 };
    }

    return { maxDimension: 1600, quality: 0.82 };
}

function getSafeBaseName(fileName: string): string {
    const withoutExtension = fileName.replace(/\.[^.]+$/, "");
    const safeName = withoutExtension
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return safeName || "image";
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        image.src = objectUrl;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error("Failed to optimize image"));
            },
            type,
            quality
        );
    });
}

export async function optimizeImageFile(file: File, folder: string): Promise<OptimizedImageResult> {
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
        return {
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            optimized: false,
        };
    }

    const profile = getOptimizationProfile(folder);
    const image = await loadImageElement(file);
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const largestSide = Math.max(sourceWidth, sourceHeight);
    const scale = Math.min(1, profile.maxDimension / largestSide);
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Failed to prepare image optimization");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, "image/webp", profile.quality);
    const optimizedFile = new File([blob], `${getSafeBaseName(file.name)}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
    });

    if (optimizedFile.size >= file.size && file.size <= MAX_UPLOAD_OUTPUT_SIZE) {
        return {
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            optimized: false,
            width: sourceWidth,
            height: sourceHeight,
        };
    }

    return {
        file: optimizedFile,
        originalSize: file.size,
        optimizedSize: optimizedFile.size,
        optimized: true,
        width: targetWidth,
        height: targetHeight,
    };
}
