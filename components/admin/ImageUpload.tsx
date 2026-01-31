"use client";

import { useState, useRef } from 'react';
import { uploadImage } from '@/lib/storage';

interface ImageUploadProps {
    currentUrl?: string | null;
    onUpload: (url: string) => void;
    folder?: string;
    label?: string;
    aspectRatio?: string; // e.g., "16/9", "1/1", "4/3"
    // Dimension validation props
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    recommendedDimensions?: string; // e.g., "400×400px"
    compact?: boolean; // Smaller version for gallery items
}

// Helper function to validate image dimensions
const validateImageDimensions = (
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
): Promise<{ valid: boolean; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            if (minWidth && width < minWidth) {
                resolve({
                    valid: false,
                    width,
                    height,
                    error: `Image width must be at least ${minWidth}px (uploaded: ${width}px)`
                });
                return;
            }

            if (minHeight && height < minHeight) {
                resolve({
                    valid: false,
                    width,
                    height,
                    error: `Image height must be at least ${minHeight}px (uploaded: ${height}px)`
                });
                return;
            }

            if (maxWidth && width > maxWidth) {
                resolve({
                    valid: false,
                    width,
                    height,
                    error: `Image width must not exceed ${maxWidth}px (uploaded: ${width}px)`
                });
                return;
            }

            if (maxHeight && height > maxHeight) {
                resolve({
                    valid: false,
                    width,
                    height,
                    error: `Image height must not exceed ${maxHeight}px (uploaded: ${height}px)`
                });
                return;
            }

            resolve({ valid: true, width, height });
        };

        img.onerror = () => {
            resolve({ valid: false, width: 0, height: 0, error: 'Failed to load image for validation' });
        };

        img.src = URL.createObjectURL(file);
    });
};

export default function ImageUpload({
    currentUrl,
    onUpload,
    folder = 'images',
    label = 'Image',
    aspectRatio = '16/9',
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    recommendedDimensions,
    compact = false,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        // Validate dimensions if constraints are set
        if (minWidth || minHeight || maxWidth || maxHeight) {
            const validation = await validateImageDimensions(file, minWidth, minHeight, maxWidth, maxHeight);
            if (!validation.valid) {
                setError(validation.error || 'Image dimensions are invalid');
                // Reset file input
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
                return;
            }
        }

        setError(null);
        setUploading(true);

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const result = await uploadImage(formData);

        if (result.success && result.url) {
            onUpload(result.url);
            setPreview(result.url);
        } else {
            setError(result.error || 'Upload failed');
            setPreview(currentUrl || null);
        }

        setUploading(false);
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    // Build dimension requirements text
    const getDimensionText = () => {
        if (recommendedDimensions) {
            return recommendedDimensions;
        }
        if (minWidth && minHeight) {
            return `Min: ${minWidth}×${minHeight}px`;
        }
        return null;
    };

    const dimensionText = getDimensionText();

    return (
        <div className={compact ? "" : "space-y-2"}>
            {!compact && label && (
                <label className="block text-sm font-medium text-text">{label}</label>
            )}

            <div
                className={`relative border-2 border-dashed border-border rounded-lg overflow-hidden hover:border-accent transition-colors cursor-pointer ${compact ? 'w-full h-full' : ''}`}
                style={compact ? undefined : { aspectRatio }}
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                                className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} bg-accent text-white rounded-lg`}
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} bg-red-500 text-white rounded-lg`}
                            >
                                Remove
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                        {uploading ? (
                            <div className={`animate-pulse ${compact ? 'text-xs' : ''}`}>Uploading...</div>
                        ) : (
                            <>
                                <svg className={`${compact ? 'w-6 h-6' : 'w-12 h-12'} mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {!compact && <span className="text-sm">Click to upload</span>}
                                {!compact && <span className="text-xs mt-1">Max 5MB</span>}
                                {!compact && dimensionText && (
                                    <span className="text-xs mt-1 text-accent">{dimensionText}</span>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Show dimension requirements below upload area */}
            {dimensionText && !error && (
                <p className="text-xs text-text-muted">Recommended: {dimensionText}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
