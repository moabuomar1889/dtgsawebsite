"use client";

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, SlidersHorizontal, UploadCloud, X } from 'lucide-react';
import { FilePond } from 'react-filepond';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';
import PhotoEditor from './PhotoEditor';
import { normalizeAssetUrl } from '@/lib/asset-url';
import {
    formatBytes,
    MAX_UPLOAD_INPUT_SIZE,
    MAX_UPLOAD_OUTPUT_SIZE,
    optimizeImageFile,
} from '@/lib/clientImageOptimization';

interface ImageUploadProps {
    currentUrl?: string | null;
    onUpload: (url: string) => void;
    folder?: string;
    label?: string;
    aspectRatio?: string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    recommendedDimensions?: string;
    compact?: boolean;
}

const validateImageDimensions = (
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
): Promise<{ valid: boolean; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        const finish = (result: { valid: boolean; width: number; height: number; error?: string }) => {
            URL.revokeObjectURL(objectUrl);
            resolve(result);
        };

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            if (minWidth && width < minWidth) {
                finish({
                    valid: false,
                    width,
                    height,
                    error: `Image width must be at least ${minWidth}px (uploaded: ${width}px)`,
                });
                return;
            }

            if (minHeight && height < minHeight) {
                finish({
                    valid: false,
                    width,
                    height,
                    error: `Image height must be at least ${minHeight}px (uploaded: ${height}px)`,
                });
                return;
            }

            if (maxWidth && width > maxWidth) {
                finish({
                    valid: false,
                    width,
                    height,
                    error: `Image width must not exceed ${maxWidth}px (uploaded: ${width}px)`,
                });
                return;
            }

            if (maxHeight && height > maxHeight) {
                finish({
                    valid: false,
                    width,
                    height,
                    error: `Image height must not exceed ${maxHeight}px (uploaded: ${height}px)`,
                });
                return;
            }

            finish({ valid: true, width, height });
        };

        img.onerror = () => {
            finish({ valid: false, width: 0, height: 0, error: 'Failed to load image for validation' });
        };

        img.src = objectUrl;
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
    const [preview, setPreview] = useState<string | null>(normalizeAssetUrl(currentUrl));
    const [error, setError] = useState<string | null>(null);
    const [optimizationInfo, setOptimizationInfo] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pondRef = useRef<{ removeFiles: () => void } | null>(null);

    useEffect(() => {
        setPreview(normalizeAssetUrl(currentUrl));
    }, [currentUrl]);

    const processImageFile = async (file: File) => {
        setError(null);
        setOptimizationInfo(null);

        if (!file.type.startsWith('image/')) {
            const message = 'Please select an image file';
            setError(message);
            toast.error(message);
            return;
        }

        if (file.size > MAX_UPLOAD_INPUT_SIZE) {
            const message = `Image must be less than ${formatBytes(MAX_UPLOAD_INPUT_SIZE)} before optimization`;
            setError(message);
            toast.error(message);
            return;
        }

        if (minWidth || minHeight || maxWidth || maxHeight) {
            const validation = await validateImageDimensions(file, minWidth, minHeight, maxWidth, maxHeight);
            if (!validation.valid) {
                const message = validation.error || 'Image dimensions are invalid';
                setError(message);
                toast.error(message);
                return;
            }
        }

        setUploading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const optimized = await optimizeImageFile(file, folder);

            if (optimized.file.size > MAX_UPLOAD_OUTPUT_SIZE) {
                throw new Error(`Image is still ${formatBytes(optimized.file.size)} after optimization. Please choose a smaller image.`);
            }

            if (optimized.optimized) {
                setOptimizationInfo(`Optimized ${formatBytes(optimized.originalSize)} to ${formatBytes(optimized.optimizedSize)}`);
            }

            const formData = new FormData();
            formData.append('file', optimized.file);
            formData.append('folder', folder);

            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onUpload(result.url);
                setPreview(result.url);
                toast.success('Image uploaded');
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (uploadError) {
            const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
            setError(message);
            toast.error(message);
            setPreview(normalizeAssetUrl(currentUrl));
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await processImageFile(file);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            await processImageFile(file);
        }
    };

    const handlePondAddFile = async (
        fileError: unknown,
        fileItem: { file: File | Blob; filename?: string }
    ) => {
        if (fileError) {
            setError('Could not add this image');
            toast.error('Could not add this image');
            return;
        }

        const file = fileItem.file instanceof File
            ? fileItem.file
            : new File([fileItem.file], fileItem.filename || 'image-upload', { type: fileItem.file.type });

        await processImageFile(file);
        pondRef.current?.removeFiles();
    };

    const handleRemove = () => {
        setPreview(null);
        setOptimizationInfo(null);
        onUpload('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleEditedImageSave = async (editedBlob: Blob) => {
        const formData = new FormData();
        formData.append('file', new File([editedBlob], `edited-image-${Date.now()}.webp`, { type: 'image/webp' }));
        formData.append('folder', folder);

        const result = await uploadImage(formData);
        if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to save edited image');
        }

        onUpload(result.url);
        setPreview(result.url);
        setOptimizationInfo('Edited image saved');
        toast.success('Edited image saved');
    };

    const getDimensionText = () => {
        if (recommendedDimensions) {
            return recommendedDimensions;
        }
        if (minWidth && minHeight) {
            return `Min: ${minWidth}x${minHeight}px`;
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
                className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${preview ? 'cursor-pointer' : ''} ${dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'} ${compact ? 'w-full h-full' : ''}`}
                style={compact ? undefined : { aspectRatio }}
                onClick={() => {
                    if (preview) {
                        inputRef.current?.click();
                    }
                }}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {preview ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setEditingImageUrl(preview);
                                }}
                                className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} inline-flex items-center gap-2 rounded-lg bg-bg/90 font-medium text-text`}
                            >
                                <SlidersHorizontal className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    inputRef.current?.click();
                                }}
                                className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} inline-flex items-center gap-2 rounded-lg bg-accent font-medium text-bg`}
                            >
                                <ImagePlus className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemove();
                                }}
                                className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} inline-flex items-center gap-2 rounded-lg bg-red-500 font-medium text-white`}
                            >
                                <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                                Remove
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                        {uploading ? (
                            <div className={`animate-pulse ${compact ? 'text-xs' : ''}`}>Uploading...</div>
                        ) : (
                            <div className="w-full px-4">
                                <div className="mb-3 flex flex-col items-center text-center">
                                    <UploadCloud className={`${compact ? 'mb-2 h-6 w-6' : 'mb-2 h-10 w-10'}`} />
                                    {!compact && <span className="text-sm">Upload or drop image</span>}
                                    {!compact && <span className="text-xs mt-1">Max {formatBytes(MAX_UPLOAD_INPUT_SIZE)}, optimized before upload</span>}
                                    {!compact && dimensionText && (
                                        <span className="text-xs mt-1 text-accent">{dimensionText}</span>
                                    )}
                                </div>
                                <FilePond
                                    ref={pondRef as never}
                                    allowMultiple={false}
                                    maxFiles={1}
                                    allowProcess={false}
                                    disabled={uploading}
                                    labelIdle={compact ? 'Drop image' : 'Drop image or <span class="filepond--label-action">browse</span>'}
                                    onaddfile={handlePondAddFile}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {optimizationInfo && !error && (
                <p className="text-xs text-green-400">{optimizationInfo}</p>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

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

            {editingImageUrl && (
                <PhotoEditor
                    imageUrl={editingImageUrl}
                    onSave={handleEditedImageSave}
                    onCancel={() => setEditingImageUrl(null)}
                    maxExportDimension={folder.toLowerCase().includes('settings') ? 1920 : folder.toLowerCase().includes('clients') ? 900 : 1600}
                    exportQuality={folder.toLowerCase().includes('clients') ? 0.86 : 0.82}
                />
            )}
        </div>
    );
}
