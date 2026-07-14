"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { getServices, createService, updateService, deleteService } from '@/lib/actions';
import type { Service } from '@/lib/supabase/types';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { normalizeAssetUrl } from '@/lib/asset-url';

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);

    const loadServices = async () => {
        setLoading(true);
        const data = await getServices();
        setServices(data);
        setLoading(false);
    };

    useEffect(() => {
        void loadServices();
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIconUrl('');
        setSortOrder(services.length);
        setEditingId(null);
        setShowForm(false);
        setFormError(null);
    };

    const handleEdit = (item: Service) => {
        setTitle(item.title);
        setDescription(item.description || '');
        setIconUrl(item.icon_url || '');
        setSortOrder(item.sort_order);
        setEditingId(item.id);
        setShowForm(true);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        const payload = {
            title,
            description,
            icon_key: iconUrl ? 'custom' : 'default',
            icon_url: iconUrl || null,
            sort_order: sortOrder,
        };

        const result = editingId
            ? await updateService(editingId, payload)
            : await createService(payload);

        setSaving(false);

        if (!result.success) {
            const message = result.error || 'Failed to save service';
            setFormError(message);
            toast.error(message);
            return;
        }

        toast.success(editingId ? 'Service updated' : 'Service created');
        resetForm();
        await loadServices();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this service?')) return;

        const result = await deleteService(id);
        if (!result.success) {
            toast.error(result.error || 'Failed to delete service');
            return;
        }

        toast.success('Service deleted');
        await loadServices();
    };

    const columns = useMemo<ColumnDef<Service>[]>(
        () => [
            {
                accessorKey: 'sort_order',
                header: 'Order',
                cell: ({ row }) => <span className="text-text">{row.original.sort_order}</span>,
                size: 90,
            },
            {
                accessorKey: 'icon_url',
                header: 'Icon',
                enableSorting: false,
                cell: ({ row }) => (
                    row.original.icon_url ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-bg">
                            <Image
                                src={normalizeAssetUrl(row.original.icon_url) || row.original.icon_url}
                                alt={row.original.title}
                                fill
                                sizes="48px"
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg text-xs text-text-muted">
                            No icon
                        </div>
                    )
                ),
                size: 110,
            },
            {
                accessorKey: 'title',
                header: 'Title',
                cell: ({ row }) => <span className="font-semibold text-text">{row.original.title}</span>,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <span className="line-clamp-1 text-sm text-text-muted">
                        {row.original.description || '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
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
        [services]
    );

    if (loading) {
        return <div className="text-text-muted">Loading services...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text">Services</h1>
                    <p className="mt-1 text-sm text-text-muted">Manage the service cards shown on the public site.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Add Service
                </button>
            </div>

            {showForm && (
                <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {editingId ? 'Service Editor' : 'New Service'}
                            </p>
                            <h2 className="text-xl font-bold text-text">{editingId ? title || 'Edit Service' : 'Add Service'}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg hover:text-text"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {formError && (
                        <div className="mx-5 mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">Service Icon</label>
                                <ImageUpload
                                    currentUrl={iconUrl}
                                    onUpload={setIconUrl}
                                    folder="services"
                                    aspectRatio="1/1"
                                    label=""
                                    recommendedDimensions="512x512px"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
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
                                    <label className="mb-2 block text-sm font-medium text-text">Sort Order</label>
                                    <input
                                        type="number"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-text">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AdminDataTable
                data={services}
                columns={columns}
                emptyMessage="No services yet."
            />
        </div>
    );
}
