"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImageOff, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { getNews, createNews, updateNews, deleteNews } from '@/lib/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import { normalizeAssetUrl } from '@/lib/asset-url';
import type { News } from '@/lib/supabase/types';
import { toast } from 'sonner';
import AdminDataTable from '@/components/admin/AdminDataTable';

export default function AdminNewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    const stats = useMemo(() => {
        const published = news.filter((item) => item.is_published).length;
        const withImage = news.filter((item) => Boolean(item.image_url)).length;

        return {
            total: news.length,
            published,
            drafts: news.length - published,
            withImage,
        };
    }, [news]);

    const loadNews = async () => {
        setLoading(true);
        const data = await getNews();
        setNews(data);
        setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        void getNews().then((data) => {
            if (!isMounted) return;
            setNews(data);
            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const resetForm = (clearMessage = true) => {
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setExcerpt('');
        setImageUrl('');
        setIsPublished(false);
        setEditingId(null);
        setShowForm(false);
        if (clearMessage) {
            setMessage(null);
        }
    };

    const handleEdit = (item: News) => {
        setTitle(item.title);
        setDate(item.date);
        setExcerpt(item.excerpt || '');
        setImageUrl(item.image_url || '');
        setIsPublished(item.is_published);
        setEditingId(item.id);
        setShowForm(true);
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const payload = {
            title,
            date,
            excerpt,
            image_url: imageUrl || null,
            is_published: isPublished,
        };

        const result = editingId
            ? await updateNews(editingId, payload)
            : await createNews(payload);

        setSaving(false);

        if (!result.success) {
            const errorMessage = result.error || 'Failed to save article';
            setMessage({ type: 'error', text: errorMessage });
            toast.error(errorMessage);
            return;
        }

        const successMessage = editingId ? 'Article updated' : 'Article created';
        resetForm(false);
        setMessage({ type: 'success', text: successMessage });
        toast.success(successMessage);
        await loadNews();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this news article?')) return;

        const result = await deleteNews(id);
        if (!result.success) {
            const errorMessage = result.error || 'Failed to delete article';
            setMessage({ type: 'error', text: errorMessage });
            toast.error(errorMessage);
            return;
        }

        setMessage({ type: 'success', text: 'Article deleted' });
        toast.success('Article deleted');
        await loadNews();
    };

    const columns = useMemo<ColumnDef<News>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Article',
                cell: ({ row }) => (
                    <div className="flex items-center gap-4">
                        {row.original.image_url ? (
                            <Image
                                src={normalizeAssetUrl(row.original.image_url) || row.original.image_url}
                                alt={row.original.title}
                                width={96}
                                height={64}
                                sizes="96px"
                                quality={55}
                                className="h-16 w-24 rounded-md object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-md border border-border bg-bg text-text-muted">
                                <ImageOff className="h-5 w-5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="max-w-[460px] truncate text-sm font-semibold text-text">{row.original.title}</p>
                            <p className="mt-1 line-clamp-1 max-w-[560px] text-xs text-text-muted">
                                {row.original.excerpt || 'No excerpt'}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'date',
                header: 'Date',
                cell: ({ row }) => <span className="text-sm text-text-muted">{row.original.date}</span>,
                size: 140,
            },
            {
                accessorKey: 'is_published',
                header: 'Status',
                cell: ({ row }) => (
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.is_published ? 'bg-green-500/10 text-green-300' : 'bg-yellow-500/10 text-yellow-300'}`}>
                        {row.original.is_published ? 'Published' : 'Draft'}
                    </span>
                ),
                size: 120,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => handleEdit(row.original)}
                            className="rounded-md p-2 text-text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                            aria-label={`Edit ${row.original.title}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(row.original.id)}
                            className="rounded-md p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete ${row.original.title}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
                size: 120,
            },
        ],
        [news]
    );

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <p className="text-sm text-text-muted">Loading news...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Content Desk</p>
                        <h1 className="text-3xl font-bold text-text">News</h1>
                        <p className="mt-2 max-w-2xl text-sm text-text-muted">
                            Publish company updates with controlled thumbnails for the public news section.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Article
                    </button>
                </div>

                <div className="grid overflow-hidden rounded-lg border border-border bg-card-bg md:grid-cols-4">
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Total</p>
                        <p className="mt-2 text-2xl font-semibold text-text">{stats.total}</p>
                    </div>
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Published</p>
                        <p className="mt-2 text-2xl font-semibold text-green-300">{stats.published}</p>
                    </div>
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Drafts</p>
                        <p className="mt-2 text-2xl font-semibold text-yellow-300">{stats.drafts}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">With Image</p>
                        <p className="mt-2 text-2xl font-semibold text-text">{stats.withImage}</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                    <div className="flex flex-col gap-4 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {editingId ? 'Article Editor' : 'New Article'}
                            </p>
                            <h2 className="text-xl font-bold text-text">{editingId ? title || 'Edit Article' : 'Add Article'}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => resetForm()}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
                        >
                            <X className="h-4 w-4" />
                            Close
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 p-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                            <div className="rounded-lg border border-border bg-bg/45 p-4">
                                <div className="mb-3">
                                    <label className="block text-sm font-semibold text-text">News Image</label>
                                    <p className="mt-1 text-xs text-text-muted">Used on the public news card.</p>
                                </div>
                                <ImageUpload
                                    currentUrl={imageUrl}
                                    onUpload={setImageUrl}
                                    folder="news"
                                    label=""
                                    aspectRatio="16/10"
                                    recommendedDimensions="1200x750px"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-text">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                                <label className="flex min-h-[48px] items-center gap-3 rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text">
                                    <input
                                        type="checkbox"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                        className="h-4 w-4 accent-accent"
                                    />
                                    Published
                                </label>
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-text">Excerpt</label>
                                    <textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => resetForm()} className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : editingId ? 'Update Article' : 'Create Article'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="text-base font-semibold text-text">Article list</h2>
                    <p className="text-sm text-text-muted">{news.length} articles</p>
                </div>

                <AdminDataTable
                    data={news}
                    columns={columns}
                    emptyMessage="No news articles yet."
                />
            </div>
        </div>
    );
}
