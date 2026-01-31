"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, RotateCcw, FlipHorizontal, FlipVertical, RotateCw, ZoomIn, ZoomOut, Check, Undo2, Move } from 'lucide-react';
import LivePreviewPanel from './LivePreviewPanel';
import { PRESETS, PRESET_CATEGORIES, Preset, PresetCategory, getPresetsByCategory } from './PhotoEditorPresets';
import {
    ImageAdjustments,
    CropSettings,
    DEFAULT_ADJUSTMENTS,
    DEFAULT_CROP,
    applyAdjustments,
    applySharpen,
    applyCropTransform,
    exportToBlob,
    blendWithPreset,
    loadImageToCanvas,
    getAspectRatioValue,
} from '@/lib/imageProcessing';

interface PhotoEditorProps {
    imageUrl: string;
    originalUrl?: string;
    onSave: (editedBlob: Blob, originalUrl: string) => Promise<void>;
    onCancel: () => void;
}

type EditorTab = 'crop' | 'adjust' | 'presets';

const ASPECT_RATIOS = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '3:4', value: '3:4' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
];

interface CropBox {
    x: number;      // Left position (0-100%)
    y: number;      // Top position (0-100%)
    width: number;  // Width (0-100%)
    height: number; // Height (0-100%)
}

// ==================== SIMPLE SLIDER COMPONENT ====================
// Defined OUTSIDE PhotoEditor to prevent recreation on every render
// This is critical for smooth slider dragging!
const SimpleSlider = ({
    label,
    value,
    onChange,
    min = -100,
    max = 100,
    step = 1
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
}) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-text-muted">{label}</span>
            <span className="text-text font-mono w-10 text-right">{value.toFixed(step < 1 ? 1 : 0)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="slider-smooth w-full h-2 bg-border rounded-full cursor-pointer"
        />
    </div>
);

export default function PhotoEditor({ imageUrl, originalUrl, onSave, onCancel }: PhotoEditorProps) {
    // Canvas refs
    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const cropContainerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>(0);
    const pendingUpdateRef = useRef<boolean>(false);
    const dragFromControlsRef = useRef<boolean>(false); // Flag to track if drag started from controls

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<EditorTab>('adjust');
    const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
    const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);
    const [selectedRatio, setSelectedRatio] = useState<string>('free');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [presetIntensity, setPresetIntensity] = useState(100);
    const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('Vivid');
    const [previewReady, setPreviewReady] = useState<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState(1);

    // Ready state tracking for proper initialization
    const [originalReady, setOriginalReady] = useState(false);
    const [canvasReady, setCanvasReady] = useState(false);

    // Crop box state (percentages 0-100)
    const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropBoxStart, setCropBoxStart] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });

    // Image dimensions
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    // Callback ref for preview canvas - sets canvasReady when mounted
    const setPreviewCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
        previewCanvasRef.current = node;
        if (node) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[PhotoEditor] Preview canvas mounted, setting canvasReady=true');
            }
            setCanvasReady(true);
        }
    }, []);

    // Load image on mount
    useEffect(() => {
        const loadImage = async () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('[PhotoEditor] loadImageToCanvas starting for:', imageUrl);
            }
            try {
                const canvas = await loadImageToCanvas(imageUrl);
                originalCanvasRef.current = canvas;
                setImageDimensions({ width: canvas.width, height: canvas.height });
                if (process.env.NODE_ENV === 'development') {
                    console.log('[PhotoEditor] loadImageToCanvas SUCCESS - dimensions:', canvas.width, 'x', canvas.height);
                }
                setOriginalReady(true);
                setIsLoading(false);
            } catch (error) {
                console.error('[PhotoEditor] loadImageToCanvas FAILED:', error);
                setIsLoading(false);
            }
        };
        loadImage();
    }, [imageUrl]);


    // Throttled preview update using requestAnimationFrame
    // Use ref to store the latest update function to avoid stale closures
    const updatePreviewRef = useRef<() => void>(() => { });

    const updatePreviewInternal = useCallback(() => {
        // Guard: BOTH refs must exist
        if (!originalCanvasRef.current || !previewCanvasRef.current) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[PhotoEditor] updatePreviewInternal SKIPPED - refs not ready',
                    'originalCanvasRef:', !!originalCanvasRef.current,
                    'previewCanvasRef:', !!previewCanvasRef.current);
            }
            return;
        }

        const original = originalCanvasRef.current;
        const preview = previewCanvasRef.current;
        const ctx = preview.getContext('2d')!;

        // Set preview size (scaled for performance)
        const maxPreviewSize = 1200;
        const scale = Math.min(maxPreviewSize / original.width, maxPreviewSize / original.height, 1);
        preview.width = original.width * scale;
        preview.height = original.height * scale;

        if (process.env.NODE_ENV === 'development') {
            console.log('[PhotoEditor] updatePreviewInternal RUNNING - preview canvas size:', preview.width, 'x', preview.height);
        }

        // Draw original
        ctx.drawImage(original, 0, 0, preview.width, preview.height);

        // Calculate effective adjustments with preset
        let effectiveAdjustments = adjustments;
        if (selectedPreset) {
            const preset = PRESETS.find(p => p.id === selectedPreset);
            if (preset) {
                effectiveAdjustments = blendWithPreset(DEFAULT_ADJUSTMENTS, preset.adjustments, presetIntensity);
                for (const key of Object.keys(adjustments) as (keyof ImageAdjustments)[]) {
                    if (adjustments[key] !== DEFAULT_ADJUSTMENTS[key]) {
                        effectiveAdjustments[key] = adjustments[key];
                    }
                }
            }
        }

        let imageData = ctx.getImageData(0, 0, preview.width, preview.height);
        imageData = applyAdjustments(imageData, effectiveAdjustments);

        if (effectiveAdjustments.sharpen > 0) {
            imageData = applySharpen(ctx, imageData, effectiveAdjustments.sharpen);
        }

        ctx.putImageData(imageData, 0, 0);
        setPreviewReady(preview);
    }, [adjustments, selectedPreset, presetIntensity]);

    // Keep ref updated with latest function
    useEffect(() => {
        updatePreviewRef.current = updatePreviewInternal;
    }, [updatePreviewInternal]);

    const schedulePreviewUpdate = useCallback(() => {
        if (pendingUpdateRef.current) return;
        pendingUpdateRef.current = true;

        animationFrameRef.current = requestAnimationFrame(() => {
            updatePreviewRef.current(); // Always use latest version
            pendingUpdateRef.current = false;
        });
    }, []);

    // CRITICAL: Initial preview trigger - runs ONLY when BOTH originalReady AND canvasReady are true
    useEffect(() => {
        if (originalReady && canvasReady) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[PhotoEditor] BOTH ready - scheduling initial preview update');
            }
            schedulePreviewUpdate();
        }
    }, [originalReady, canvasReady, schedulePreviewUpdate]);

    // Schedule update when adjustments change (only if already ready)
    useEffect(() => {
        if (originalReady && canvasReady) {
            schedulePreviewUpdate();
        }
    }, [adjustments, selectedPreset, presetIntensity, originalReady, canvasReady, schedulePreviewUpdate]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Handle adjustment change with smooth updates
    const handleAdjustment = useCallback((key: keyof ImageAdjustments, value: number) => {
        setAdjustments(prev => ({ ...prev, [key]: value }));
    }, []);

    // Handle aspect ratio change - update crop box
    const handleAspectRatioChange = useCallback((ratio: string) => {
        setSelectedRatio(ratio);

        if (ratio === 'free') return;

        const ratioValue = getAspectRatioValue(ratio);
        if (!ratioValue || !imageDimensions.width || !imageDimensions.height) return;

        const imageAspect = imageDimensions.width / imageDimensions.height;

        // Calculate new crop box that fits the aspect ratio
        let newWidth: number, newHeight: number;

        if (ratioValue > imageAspect) {
            // Ratio is wider than image - fit to width
            newWidth = 80;
            newHeight = (newWidth / ratioValue) * imageAspect;
            if (newHeight > 80) {
                newHeight = 80;
                newWidth = newHeight * ratioValue / imageAspect;
            }
        } else {
            // Ratio is taller than image - fit to height
            newHeight = 80;
            newWidth = (newHeight * ratioValue) / imageAspect;
            if (newWidth > 80) {
                newWidth = 80;
                newHeight = newWidth * imageAspect / ratioValue;
            }
        }

        // Center the crop box
        setCropBox({
            x: (100 - newWidth) / 2,
            y: (100 - newHeight) / 2,
            width: newWidth,
            height: newHeight,
        });
    }, [imageDimensions]);

    // Handle rotation
    const handleRotate = (degrees: number) => {
        setCrop(prev => ({ ...prev, rotation: (prev.rotation + degrees) % 360 }));
    };

    // Handle flip
    const handleFlipH = () => {
        setCrop(prev => ({ ...prev, flipHorizontal: !prev.flipHorizontal }));
    };

    const handleFlipV = () => {
        setCrop(prev => ({ ...prev, flipVertical: !prev.flipVertical }));
    };

    // Handle preset selection
    const handlePresetSelect = (presetId: string) => {
        if (selectedPreset === presetId) {
            setSelectedPreset(null);
        } else {
            setSelectedPreset(presetId);
            setPresetIntensity(100);
        }
    };

    // Reset all
    const handleReset = () => {
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setCrop(DEFAULT_CROP);
        setSelectedPreset(null);
        setPresetIntensity(100);
        setZoom(1);
        setCropBox({ x: 10, y: 10, width: 80, height: 80 });
        setSelectedRatio('free');
    };

    // ==================== CROP INTERACTION ====================

    const getMousePosition = (e: React.MouseEvent | MouseEvent) => {
        if (!cropContainerRef.current) return { x: 0, y: 0 };
        const rect = cropContainerRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        };
    };

    const handleCropMouseDown = (e: React.MouseEvent) => {
        // Skip if interacting with controls (sliders, buttons, etc.)
        if ((e.target as HTMLElement).closest('[data-editor-controls="true"]')) return;
        // Only allow drag from within crop area
        if (!(e.target as HTMLElement).closest('[data-crop-area="true"]')) return;

        const pos = getMousePosition(e);
        setDragStart(pos);
        setCropBoxStart({ ...cropBox });
        setIsDragging(true);
    };

    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        // Skip if interacting with controls (sliders, buttons, etc.)
        if ((e.target as HTMLElement).closest('[data-editor-controls="true"]')) return;

        e.stopPropagation();
        const pos = getMousePosition(e);
        setDragStart(pos);
        setCropBoxStart({ ...cropBox });
        setIsResizing(handle);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // If drag started from controls, never process crop move
            if (dragFromControlsRef.current) return;

            // Skip if interacting with controls (sliders, buttons, etc.)
            const target = e.target as HTMLElement;
            if (target?.closest?.('[data-editor-controls="true"]')) return;
            if (target?.tagName === 'INPUT' || target?.tagName === 'BUTTON' || target?.tagName === 'SELECT') return;

            if (!isDragging && !isResizing) return;

            const pos = getMousePosition(e);
            const dx = pos.x - dragStart.x;
            const dy = pos.y - dragStart.y;

            if (isDragging) {
                // Move crop box
                let newX = cropBoxStart.x + dx;
                let newY = cropBoxStart.y + dy;

                // Constrain to bounds
                newX = Math.max(0, Math.min(100 - cropBoxStart.width, newX));
                newY = Math.max(0, Math.min(100 - cropBoxStart.height, newY));

                setCropBox(prev => ({ ...prev, x: newX, y: newY }));
            } else if (isResizing) {
                // Resize crop box
                let newBox = { ...cropBoxStart };
                const ratioValue = selectedRatio !== 'free' ? getAspectRatioValue(selectedRatio) : null;
                const imageAspect = imageDimensions.width / imageDimensions.height;

                switch (isResizing) {
                    case 'se': // Bottom-right
                        newBox.width = Math.max(10, Math.min(100 - cropBoxStart.x, cropBoxStart.width + dx));
                        if (ratioValue) {
                            newBox.height = (newBox.width / ratioValue) * imageAspect;
                        } else {
                            newBox.height = Math.max(10, Math.min(100 - cropBoxStart.y, cropBoxStart.height + dy));
                        }
                        break;
                    case 'sw': // Bottom-left
                        const newWidthSW = Math.max(10, cropBoxStart.width - dx);
                        newBox.x = cropBoxStart.x + cropBoxStart.width - newWidthSW;
                        newBox.width = newWidthSW;
                        if (ratioValue) {
                            newBox.height = (newBox.width / ratioValue) * imageAspect;
                        } else {
                            newBox.height = Math.max(10, Math.min(100 - cropBoxStart.y, cropBoxStart.height + dy));
                        }
                        break;
                    case 'ne': // Top-right
                        newBox.width = Math.max(10, Math.min(100 - cropBoxStart.x, cropBoxStart.width + dx));
                        if (ratioValue) {
                            const newHeight = (newBox.width / ratioValue) * imageAspect;
                            newBox.y = cropBoxStart.y + cropBoxStart.height - newHeight;
                            newBox.height = newHeight;
                        } else {
                            const newHeightNE = Math.max(10, cropBoxStart.height - dy);
                            newBox.y = cropBoxStart.y + cropBoxStart.height - newHeightNE;
                            newBox.height = newHeightNE;
                        }
                        break;
                    case 'nw': // Top-left
                        const newWidthNW = Math.max(10, cropBoxStart.width - dx);
                        newBox.x = cropBoxStart.x + cropBoxStart.width - newWidthNW;
                        newBox.width = newWidthNW;
                        if (ratioValue) {
                            const newHeight = (newBox.width / ratioValue) * imageAspect;
                            newBox.y = cropBoxStart.y + cropBoxStart.height - newHeight;
                            newBox.height = newHeight;
                        } else {
                            const newHeightNW = Math.max(10, cropBoxStart.height - dy);
                            newBox.y = cropBoxStart.y + cropBoxStart.height - newHeightNW;
                            newBox.height = newHeightNW;
                        }
                        break;
                }

                // Constrain to bounds
                newBox.x = Math.max(0, newBox.x);
                newBox.y = Math.max(0, newBox.y);
                if (newBox.x + newBox.width > 100) newBox.width = 100 - newBox.x;
                if (newBox.y + newBox.height > 100) newBox.height = 100 - newBox.y;

                setCropBox(newBox);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(null);
            dragFromControlsRef.current = false; // Always reset controls flag
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, cropBoxStart, selectedRatio, imageDimensions]);

    // ==================== SAVE ====================

    const handleSave = async () => {
        if (!originalCanvasRef.current) return;

        setIsSaving(true);
        try {
            const original = originalCanvasRef.current;
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = original.width;
            outputCanvas.height = original.height;
            const ctx = outputCanvas.getContext('2d')!;
            ctx.drawImage(original, 0, 0);

            // Apply adjustments at full resolution
            let imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);

            let effectiveAdjustments = adjustments;
            if (selectedPreset) {
                const preset = PRESETS.find(p => p.id === selectedPreset);
                if (preset) {
                    effectiveAdjustments = blendWithPreset(DEFAULT_ADJUSTMENTS, preset.adjustments, presetIntensity);
                    for (const key of Object.keys(adjustments) as (keyof ImageAdjustments)[]) {
                        if (adjustments[key] !== DEFAULT_ADJUSTMENTS[key]) {
                            effectiveAdjustments[key] = adjustments[key];
                        }
                    }
                }
            }

            imageData = applyAdjustments(imageData, effectiveAdjustments);
            if (effectiveAdjustments.sharpen > 0) {
                imageData = applySharpen(ctx, imageData, effectiveAdjustments.sharpen);
            }
            ctx.putImageData(imageData, 0, 0);

            // Apply crop transform with cropBox values
            const cropSettings: CropSettings = {
                x: cropBox.x,
                y: cropBox.y,
                width: cropBox.width,
                height: cropBox.height,
                rotation: crop.rotation,
                flipHorizontal: crop.flipHorizontal,
                flipVertical: crop.flipVertical,
            };

            // Calculate output dimensions based on crop
            const cropWidth = (cropBox.width / 100) * original.width;
            const cropHeight = (cropBox.height / 100) * original.height;

            const finalCanvas = applyCropTransform(outputCanvas, cropSettings, cropWidth, cropHeight);

            // Export
            const blob = await exportToBlob(finalCanvas, 1920, 0.92);
            await onSave(blob, originalUrl || imageUrl);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // SimpleSlider is now defined outside the component to prevent recreation on every render

    // ==================== RENDER ====================

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-bg flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-bg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card-bg shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-bg rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold">Edit Photo</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
                    >
                        <Undo2 className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Save
                    </button>
                </div>
            </div>

            {/* Main Canvas Area - Takes most of the space */}
            <div className="flex-1 flex items-center justify-center p-4 bg-bg overflow-hidden min-h-0">
                <div
                    ref={cropContainerRef}
                    data-crop-area="true"
                    className="relative max-w-full max-h-full"
                    style={{
                        width: 'auto',
                        height: 'auto',
                    }}
                >
                    {/* Canvas with transforms */}
                    <canvas
                        ref={setPreviewCanvasRef}
                        className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                        style={{
                            transform: `scale(${zoom}) rotate(${crop.rotation}deg) scaleX(${crop.flipHorizontal ? -1 : 1}) scaleY(${crop.flipVertical ? -1 : 1})`,
                        }}
                    />

                    {/* Crop Overlay - Only show in crop tab */}
                    {activeTab === 'crop' && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Darkened areas outside crop */}
                            <div className="absolute inset-0 bg-black/50" style={{
                                clipPath: `polygon(
                                    0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                                    ${cropBox.x}% ${cropBox.y}%,
                                    ${cropBox.x}% ${cropBox.y + cropBox.height}%,
                                    ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%,
                                    ${cropBox.x + cropBox.width}% ${cropBox.y}%,
                                    ${cropBox.x}% ${cropBox.y}%
                                )`
                            }} />

                            {/* Crop Box */}
                            <div
                                className="absolute border-2 border-white pointer-events-auto cursor-move"
                                style={{
                                    left: `${cropBox.x}%`,
                                    top: `${cropBox.y}%`,
                                    width: `${cropBox.width}%`,
                                    height: `${cropBox.height}%`,
                                }}
                                onMouseDown={handleCropMouseDown}
                            >
                                {/* Grid lines */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="border border-white/30" />
                                    ))}
                                </div>

                                {/* Resize handles */}
                                {['nw', 'ne', 'sw', 'se'].map((handle) => (
                                    <div
                                        key={handle}
                                        className={`absolute w-4 h-4 bg-white rounded-full shadow-md cursor-${handle}-resize`}
                                        style={{
                                            left: handle.includes('w') ? '-8px' : 'auto',
                                            right: handle.includes('e') ? '-8px' : 'auto',
                                            top: handle.includes('n') ? '-8px' : 'auto',
                                            bottom: handle.includes('s') ? '-8px' : 'auto',
                                        }}
                                        onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Panel - Controls (SAFE INTERACTION ZONE for sliders) */}
            <div
                data-editor-controls="true"
                className="shrink-0 border-t border-border bg-card-bg max-h-[45vh] flex flex-col"
                style={{ touchAction: 'auto', pointerEvents: 'auto' }}
                onPointerDownCapture={(e) => {
                    dragFromControlsRef.current = true;
                    e.stopPropagation();
                }}
                onMouseDownCapture={(e) => {
                    dragFromControlsRef.current = true;
                    e.stopPropagation();
                }}
                onTouchStartCapture={(e) => {
                    dragFromControlsRef.current = true;
                    e.stopPropagation();
                }}
            >
                {/* Tab Headers */}
                <div className="flex border-b border-border shrink-0">
                    {(['crop', 'adjust', 'presets'] as EditorTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-accent border-b-2 border-accent bg-bg/30'
                                : 'text-text-muted hover:text-text'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Crop Tab */}
                    {activeTab === 'crop' && (
                        <div className="flex flex-wrap gap-6">
                            {/* Aspect Ratio */}
                            <div className="min-w-[200px]">
                                <label className="text-sm font-medium text-text mb-2 block">Aspect Ratio</label>
                                <div className="flex flex-wrap gap-2">
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <button
                                            key={ratio.value}
                                            onClick={() => handleAspectRatioChange(ratio.value)}
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedRatio === ratio.value
                                                ? 'border-accent bg-accent/10 text-accent'
                                                : 'border-border text-text-muted hover:border-text-muted'
                                                }`}
                                        >
                                            {ratio.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rotation */}
                            <div className="min-w-[200px]">
                                <label className="text-sm font-medium text-text mb-2 block">Rotate</label>
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => handleRotate(-90)}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:border-accent transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="text-sm">-90°</span>
                                    </button>
                                    <button
                                        onClick={() => handleRotate(90)}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:border-accent transition-colors"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                        <span className="text-sm">+90°</span>
                                    </button>
                                </div>
                                <div className="w-48">
                                    <SimpleSlider
                                        label="Fine Rotate"
                                        value={crop.rotation}
                                        onChange={(v) => setCrop(prev => ({ ...prev, rotation: v }))}
                                        min={-45}
                                        max={45}
                                        step={0.5}
                                    />
                                </div>
                            </div>

                            {/* Flip */}
                            <div className="min-w-[200px]">
                                <label className="text-sm font-medium text-text mb-2 block">Flip</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFlipH}
                                        className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg transition-colors ${crop.flipHorizontal ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent'
                                            }`}
                                    >
                                        <FlipHorizontal className="w-4 h-4" />
                                        <span className="text-sm">H</span>
                                    </button>
                                    <button
                                        onClick={handleFlipV}
                                        className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg transition-colors ${crop.flipVertical ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent'
                                            }`}
                                    >
                                        <FlipVertical className="w-4 h-4" />
                                        <span className="text-sm">V</span>
                                    </button>
                                </div>
                            </div>

                            {/* Zoom */}
                            <div className="min-w-[200px]">
                                <label className="text-sm font-medium text-text mb-2 block">Zoom</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                        className="p-1.5 border border-border rounded-lg hover:border-accent transition-colors"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="range"
                                        min={0.5}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="w-24 h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                                    />
                                    <button
                                        onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                                        className="p-1.5 border border-border rounded-lg hover:border-accent transition-colors"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-text-muted w-10">{Math.round(zoom * 100)}%</span>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="min-w-[300px]">
                                <label className="text-sm font-medium text-text mb-2 block">Live Preview</label>
                                <LivePreviewPanel previewCanvas={previewReady} />
                            </div>
                        </div>
                    )}

                    {/* Adjust Tab */}
                    {activeTab === 'adjust' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-4">
                            {/* Basic */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Basic</h3>
                                <SimpleSlider label="Brightness" value={adjustments.brightness} onChange={(v) => handleAdjustment('brightness', v)} />
                                <SimpleSlider label="Contrast" value={adjustments.contrast} onChange={(v) => handleAdjustment('contrast', v)} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">&nbsp;</h3>
                                <SimpleSlider label="Saturation" value={adjustments.saturation} onChange={(v) => handleAdjustment('saturation', v)} />
                                <SimpleSlider label="Vibrance" value={adjustments.vibrance} onChange={(v) => handleAdjustment('vibrance', v)} />
                            </div>

                            {/* Tonal */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Tonal</h3>
                                <SimpleSlider label="Exposure" value={adjustments.exposure} onChange={(v) => handleAdjustment('exposure', v)} />
                                <SimpleSlider label="Highlights" value={adjustments.highlights} onChange={(v) => handleAdjustment('highlights', v)} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">&nbsp;</h3>
                                <SimpleSlider label="Shadows" value={adjustments.shadows} onChange={(v) => handleAdjustment('shadows', v)} />
                                <SimpleSlider label="Gamma" value={adjustments.gamma} onChange={(v) => handleAdjustment('gamma', v)} min={0.2} max={5} step={0.1} />
                            </div>

                            {/* Color */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Color</h3>
                                <SimpleSlider label="Temperature" value={adjustments.temperature} onChange={(v) => handleAdjustment('temperature', v)} />
                                <SimpleSlider label="Tint" value={adjustments.tint} onChange={(v) => handleAdjustment('tint', v)} />
                            </div>

                            {/* Detail & RGB */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Detail</h3>
                                <SimpleSlider label="Sharpen" value={adjustments.sharpen} onChange={(v) => handleAdjustment('sharpen', v)} min={0} max={100} />
                                <SimpleSlider label="Clarity" value={adjustments.clarity} onChange={(v) => handleAdjustment('clarity', v)} />
                            </div>
                        </div>
                    )}

                    {/* Presets Tab */}
                    {activeTab === 'presets' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedCategory === category
                                                ? 'bg-accent text-white'
                                                : 'bg-bg text-text-muted hover:text-text'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                {/* Preset Intensity */}
                                {selectedPreset && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-bg rounded-lg">
                                        <span className="text-xs text-text-muted">Intensity</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={presetIntensity}
                                            onChange={(e) => setPresetIntensity(parseInt(e.target.value))}
                                            className="w-24 h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                                        />
                                        <span className="text-xs text-text w-8">{presetIntensity}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Preset Grid */}
                            <div className="flex flex-wrap gap-3">
                                {getPresetsByCategory(selectedCategory).map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset.id)}
                                        className={`w-20 p-2 text-center rounded-lg border transition-colors ${selectedPreset === preset.id
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border hover:border-accent/50'
                                            }`}
                                    >
                                        <div
                                            className="w-full aspect-square rounded mb-1.5"
                                            style={{ background: getPresetPreviewColor(preset) }}
                                        />
                                        <span className="text-xs font-medium">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper to generate preview color for preset
function getPresetPreviewColor(preset: Preset): string {
    const adj = preset.adjustments;
    const temp = (adj.temperature || 0);
    const sat = (adj.saturation || 0);

    if (sat === -100) return 'linear-gradient(135deg, #888 0%, #444 100%)';
    if (temp > 20) return 'linear-gradient(135deg, #f5a623 0%, #d35400 100%)';
    if (temp < -20) return 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)';
    if (sat > 30) return 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)';
    return 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)';
}
