"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, ImageIcon, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { getClients, addClient, updateClient, deleteClient } from '@/lib/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import PhotoEditor from '@/components/admin/PhotoEditor';
import { uploadImage } from '@/lib/storage';
import { normalizeAssetUrl } from '@/lib/asset-url';
import type { Client } from '@/lib/supabase/types';
import AdminDataTable from '@/components/admin/AdminDataTable';

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [editingLogoUrl, setEditingLogoUrl] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const loadClients = async () => {
        setLoading(true);
        const data = await getClients();
        setClients(data);
        setLoading(false);
    };

    useEffect(() => {
        void loadClients();
    }, []);

    const resetForm = () => {
        setName('');
        setWebsiteUrl('');
        setLogoUrl('');
        setSortOrder(clients.length);
        setIsActive(true);
        setEditingId(null);
        setShowForm(false);
        setFormError(null);
    };

    const handleEdit = (client: Client) => {
        setName(client.name);
        setWebsiteUrl(client.website_url || '');
        setLogoUrl(client.logo_url_bw || '');
        setSortOrder(client.sort_order);
        setIsActive(client.is_active);
        setEditingId(client.id);
        setShowForm(true);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSaving(true);

        const payload = {
            name,
            website_url: websiteUrl || null,
            logo_url_bw: logoUrl || null,
            sort_order: sortOrder,
            is_active: isActive,
        };

        const result = editingId
            ? await updateClient(editingId, payload)
            : await addClient(payload);

        setSaving(false);

        if (!result.success) {
            const message = result.error || 'Failed to save client';
            setFormError(message);
            toast.error(message);
            return;
        }

        toast.success(editingId ? 'Client updated' : 'Client created');
        resetForm();
        await loadClients();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        const result = await deleteClient(id);
        if (!result.success) {
            toast.error(result.error || 'Failed to delete client');
            return;
        }

        toast.success('Client deleted');
        await loadClients();
    };

    const openLogoEditor = (client: Client) => {
        if (!client.logo_url_bw) return;

        setEditingLogoUrl(client.logo_url_bw);
        setEditingClientId(client.id);
    };

    const handleEditorSave = async (editedBlob: Blob) => {
        if (!editingClientId) {
            throw new Error('No client selected for editing');
        }

        const formData = new FormData();
        formData.append('file', new File([editedBlob], `client-logo-${Date.now()}.webp`, { type: 'image/webp' }));
        formData.append('folder', 'clients');

        const uploadResult = await uploadImage(formData);
        if (!uploadResult.success || !uploadResult.url) {
            throw new Error(uploadResult.error || 'Upload failed');
        }

        const updateResult = await updateClient(editingClientId, {
            logo_url_bw: uploadResult.url,
        });

        if (!updateResult.success) {
            throw new Error(updateResult.error || 'Failed to update client logo');
        }

        await loadClients();
    };

    const closeLogoEditor = () => {
        setEditingLogoUrl(null);
        setEditingClientId(null);
    };

    const columns = useMemo<ColumnDef<Client>[]>(
        () => [
            {
                accessorKey: 'sort_order',
                header: 'Order',
                cell: ({ row }) => <span className="text-text">{row.original.sort_order}</span>,
                size: 90,
            },
            {
                accessorKey: 'logo_url_bw',
                header: 'Logo',
                enableSorting: false,
                cell: ({ row }) => (
                    row.original.logo_url_bw ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                            <Image
                                src={normalizeAssetUrl(row.original.logo_url_bw) || row.original.logo_url_bw}
                                alt={row.original.name}
                                width={44}
                                height={44}
                                sizes="44px"
                                quality={60}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg text-xs text-text-muted">
                            No logo
                        </div>
                    )
                ),
                size: 110,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => <span className="font-semibold text-text">{row.original.name}</span>,
            },
            {
                accessorKey: 'website_url',
                header: 'Website',
                cell: ({ row }) => (
                    row.original.website_url ? (
                        <a
                            href={row.original.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-[260px] items-center gap-2 truncate text-sm text-accent hover:underline"
                        >
                            <span className="truncate">{row.original.website_url}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                    ) : (
                        <span className="text-text-muted">-</span>
                    )
                ),
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => (
                    <span className={`rounded px-2 py-1 text-xs ${row.original.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </span>
                ),
                size: 110,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
                        {row.original.logo_url_bw && (
                            <button
                                type="button"
                                onClick={() => openLogoEditor(row.original)}
                                className="rounded-md p-2 text-text-muted transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                                aria-label={`Edit logo for ${row.original.name}`}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => handleEdit(row.original)}
                            className="rounded-md p-2 text-text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                            aria-label={`Edit ${row.original.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(row.original.id)}
                            className="rounded-md p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete ${row.original.name}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
                size: 150,
            },
        ],
        [clients]
    );

    if (loading) {
        return <div className="text-text-muted">Loading clients...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text">Clients</h1>
                    <p className="mt-1 text-sm text-text-muted">Manage client logos, links, ordering, and visibility.</p>
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
                    Add Client
                </button>
            </div>

            {showForm && (
                <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {editingId ? 'Client Editor' : 'New Client'}
                            </p>
                            <h2 className="text-xl font-bold text-text">{editingId ? name || 'Edit Client' : 'Add Client'}</h2>
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
                        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">Client Logo</label>
                                <ImageUpload
                                    currentUrl={logoUrl}
                                    onUpload={setLogoUrl}
                                    folder="clients"
                                    label=""
                                    aspectRatio="1/1"
                                    recommendedDimensions="Transparent logo preferred"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Website URL</label>
                                    <input
                                        type="url"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        placeholder="https://example.com"
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
                                <label className="flex min-h-[48px] items-center gap-3 rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="h-4 w-4 accent-accent"
                                    />
                                    Active
                                </label>
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
                                {saving ? 'Saving...' : editingId ? 'Update Client' : 'Create Client'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AdminDataTable
                data={clients}
                columns={columns}
                emptyMessage="No clients yet. Add your first client."
            />

            {editingLogoUrl && (
                <PhotoEditor
                    imageUrl={editingLogoUrl}
                    onSave={handleEditorSave}
                    onCancel={closeLogoEditor}
                    maxExportDimension={900}
                    exportQuality={0.86}
                />
            )}
        </div>
    );
}
