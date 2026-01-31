"use client";

import { useState, useEffect, useRef } from 'react';

interface LivePreviewPanelProps {
    previewCanvas: HTMLCanvasElement | null;
    isProcessing?: boolean;
}

type PreviewTab = 'card' | 'modal';

/**
 * Live Preview Panel - Shows exactly how the image will appear to visitors
 * - Homepage Card Preview: matches h-48/h-56, object-cover
 * - Modal Gallery Preview: matches max-w-5xl, max-h-70vh, object-contain
 */
export default function LivePreviewPanel({
    previewCanvas,
    isProcessing = false
}: LivePreviewPanelProps) {
    const [activeTab, setActiveTab] = useState<PreviewTab>('card');
    const cardPreviewRef = useRef<HTMLDivElement>(null);
    const modalPreviewRef = useRef<HTMLDivElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Convert canvas to data URL for preview
    useEffect(() => {
        if (previewCanvas) {
            // Use a smaller size for preview to avoid lag
            const previewSize = 800;
            const scale = Math.min(previewSize / previewCanvas.width, previewSize / previewCanvas.height, 1);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = previewCanvas.width * scale;
            tempCanvas.height = previewCanvas.height * scale;
            const ctx = tempCanvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(previewCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

            setPreviewUrl(tempCanvas.toDataURL('image/jpeg', 0.85));
        }
    }, [previewCanvas]);

    const tabs: { id: PreviewTab; label: string; description: string }[] = [
        {
            id: 'card',
            label: 'Homepage Card',
            description: 'How it appears on the Projects grid'
        },
        {
            id: 'modal',
            label: 'Modal Gallery',
            description: 'How it appears in the full gallery view'
        },
    ];

    return (
        <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-accent border-b-2 border-accent bg-bg/50'
                                : 'text-text-muted hover:text-text'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-bg/50 flex items-center justify-center z-10">
                    <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                </div>
            )}

            {/* Preview Content */}
            <div className="p-4">
                <p className="text-xs text-text-muted mb-3">
                    {tabs.find(t => t.id === activeTab)?.description}
                </p>

                {/* Homepage Card Preview */}
                {activeTab === 'card' && (
                    <div className="space-y-4">
                        {/* Desktop Preview (h-56) */}
                        <div>
                            <span className="text-xs text-text-muted mb-2 block">Desktop (224px height)</span>
                            <div
                                ref={cardPreviewRef}
                                className="relative bg-bg rounded overflow-hidden group"
                                style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    height: '224px' // md:h-56 = 14rem = 224px
                                }}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Card Preview"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        {/* Gradient overlay like real card */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-60" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                                        No preview
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Preview (h-48) */}
                        <div>
                            <span className="text-xs text-text-muted mb-2 block">Mobile (192px height)</span>
                            <div
                                className="relative bg-bg rounded overflow-hidden group"
                                style={{
                                    width: '100%',
                                    maxWidth: '180px',
                                    height: '192px' // h-48 = 12rem = 192px
                                }}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Card Preview Mobile"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-60" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                                        No preview
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cropping Warning */}
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-400">
                                <strong>Note:</strong> Homepage cards use <code className="bg-bg px-1 rounded">object-cover</code> which may crop parts of the image. Make sure important content is centered.
                            </p>
                        </div>
                    </div>
                )}

                {/* Modal Gallery Preview */}
                {activeTab === 'modal' && (
                    <div className="space-y-4">
                        {/* Modal Preview Container */}
                        <div
                            ref={modalPreviewRef}
                            className="relative bg-bg rounded-lg overflow-hidden"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                aspectRatio: '16/10' // Simulate modal proportions
                            }}
                        >
                            {/* Blurred Background (like real modal) */}
                            {previewUrl && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                                    style={{ backgroundImage: `url(${previewUrl})` }}
                                />
                            )}

                            {/* Main Image (object-contain) */}
                            <div className="relative w-full h-full flex items-center justify-center p-2">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Modal Preview"
                                        className="max-w-full max-h-full object-contain z-10"
                                    />
                                ) : (
                                    <div className="text-text-muted text-sm">
                                        No preview
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs text-green-400">
                                <strong>Note:</strong> Modal gallery uses <code className="bg-bg px-1 rounded">object-contain</code> so the full image is always visible with a blurred backdrop.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
