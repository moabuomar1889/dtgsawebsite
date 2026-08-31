"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Copy, FolderOpen, ImageOff, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMediaAsset, listMediaAssets } from '@/lib/storage';
import { formatBytes } from '@/lib/clientImageOptimization';
import { normalizeAssetUrl } from '@/lib/asset-url';

interface MediaAsset {
    name: string;
    path: string;
    url: string;
    folder: string;
    size: number | null;
    mimeType: string | null;
    updatedAt: string | null;
    createdAt: string | null;
}

const MEDIA_FOLDERS = [
    'projects',
    'projects/gallery',
    'clients',
    'news',
    'services',
    'settings',
    'images',
];

export default function AdminMediaPage() {
    const [selectedFolder, setSelectedFolder] = useState(MEDIA_FOLDERS[0]);
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingPath, setDeletingPath] = useState<string | null>(null);

    const stats = useMemo(() => {
        const totalSize = assets.reduce((sum, asset) => sum + (asset.size || 0), 0);

        return {
            total: assets.length,
            totalSize,
        };
    }, [assets]);

    const loadAssets = async (folder = selectedFolder) => {
        setLoading(true);
        const result = await listMediaAssets(folder);

        if (!result.success) {
            toast.error(result.error || 'Failed to load media');
            setAssets([]);
        } else {
            setAssets(result.data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        const timer = window.setTimeout(() => void loadAssets(selectedFolder), 0);
        return () => window.clearTimeout(timer);
    }, [selectedFolder]);

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('URL copied');
        } catch {
            toast.error('Could not copy URL');
        }
    };

    const deleteAsset = async (asset: MediaAsset) => {
        if (!confirm(`Delete ${asset.name}?`)) return;

        setDeletingPath(asset.path);
        const result = await deleteMediaAsset(asset.path);
        setDeletingPath(null);

        if (!result.success) {
            toast.error(result.error || 'Failed to delete media');
            return;
        }

        toast.success('Media deleted');
        await loadAssets();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Storage</p>
                    <h1 className="text-3xl font-bold text-text">Media Library</h1>
                    <p className="mt-2 max-w-2xl text-sm text-text-muted">
                        Review uploaded images, copy public URLs, and remove unused assets from allowed website folders.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void loadAssets()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="rounded-lg border border-border bg-card-bg p-3">
                    <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Folders</p>
                    <div className="space-y-1">
                        {MEDIA_FOLDERS.map((folder) => (
                            <button
                                key={folder}
                                type="button"
                                onClick={() => setSelectedFolder(folder)}
                                className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors ${selectedFolder === folder
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-text-muted hover:bg-border/35 hover:text-text'
                                    }`}
                            >
                                <FolderOpen className="h-4 w-4" />
                                <span className="truncate">{folder}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-border bg-card-bg p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Files</p>
                            <p className="mt-2 text-2xl font-bold text-text">{stats.total}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card-bg p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Known Size</p>
                            <p className="mt-2 text-2xl font-bold text-text">{formatBytes(stats.totalSize)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card-bg p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Folder</p>
                            <p className="mt-2 truncate text-2xl font-bold text-text">{selectedFolder}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-card-bg text-sm text-text-muted">
                            Loading media...
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-border bg-card-bg text-center text-text-muted">
                            <ImageOff className="mb-3 h-8 w-8" />
                            <p className="text-sm">No files found in this folder.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {assets.map((asset) => (
                                <div key={asset.path} className="overflow-hidden rounded-lg border border-border bg-card-bg">
                                    <div className="relative aspect-video bg-bg">
                                        {asset.mimeType?.startsWith('image/') || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(asset.name) ? (
                                            <Image
                                                src={normalizeAssetUrl(asset.url) || asset.url}
                                                alt={asset.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                quality={45}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-text-muted">
                                                <ImageOff className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3 p-4">
                                        <div>
                                            <p className="truncate text-sm font-semibold text-text" title={asset.name}>{asset.name}</p>
                                            <p className="mt-1 truncate text-xs text-text-muted" title={asset.path}>{asset.path}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                                            <span className="rounded bg-bg px-2 py-1">{asset.size ? formatBytes(asset.size) : 'Unknown size'}</span>
                                            <span className="rounded bg-bg px-2 py-1">{asset.mimeType || 'Unknown type'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void copyUrl(asset.url)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Copy URL
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingPath === asset.path}
                                                onClick={() => void deleteAsset(asset)}
                                                className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label={`Delete ${asset.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
