"use client";

import { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '@/lib/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import PhotoEditor from '@/components/admin/PhotoEditor';
import { uploadImage } from '@/lib/storage';
import type { Client } from '@/lib/supabase/types';

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Photo Editor state
    const [editingLogoUrl, setEditingLogoUrl] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        const data = await getClients();
        console.log('Loaded clients:', data);
        setClients(data);
        setLoading(false);
    };

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

        console.log('Submitting client:', { name, websiteUrl, logoUrl, sortOrder, isActive });

        try {
            if (editingId) {
                const result = await updateClient(editingId, {
                    name,
                    website_url: websiteUrl || null,
                    logo_url_bw: logoUrl || null,
                    sort_order: sortOrder,
                    is_active: isActive
                });
                console.log('Update result:', result);
                if (!result.success) {
                    setFormError(result.error || 'Failed to update client');
                    setSaving(false);
                    return;
                }
            } else {
                const result = await addClient({
                    name,
                    website_url: websiteUrl || null,
                    logo_url_bw: logoUrl || null,
                    sort_order: sortOrder,
                    is_active: isActive
                });
                console.log('Add result:', result);
                if (!result.success) {
                    setFormError(result.error || 'Failed to add client');
                    setSaving(false);
                    return;
                }
            }

            resetForm();
            await loadClients();
        } catch (err) {
            console.error('Submit error:', err);
            setFormError(err instanceof Error ? err.message : 'An error occurred');
        }

        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client?')) {
            await deleteClient(id);
            loadClients();
        }
    };

    // Open photo editor for a client logo
    const openLogoEditor = (client: Client) => {
        if (client.logo_url_bw) {
            setEditingLogoUrl(client.logo_url_bw);
            setEditingClientId(client.id);
        }
    };

    // Handle save from photo editor
    const handleEditorSave = async (editedBlob: Blob, originalUrl: string) => {
        if (!editingClientId) return;

        try {
            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', editedBlob, `client-logo-${Date.now()}.jpg`);
            formData.append('folder', 'clients');

            // Upload the edited image
            const result = await uploadImage(formData);

            if (!result.success || !result.url) {
                throw new Error(result.error || 'Upload failed');
            }

            // Update the client
            await updateClient(editingClientId, {
                logo_url_bw: result.url
            });

            // Refresh clients list
            await loadClients();

            // Close editor
            setEditingLogoUrl(null);
            setEditingClientId(null);
        } catch (error) {
            console.error('Error saving edited logo:', error);
            alert('Failed to save edited logo');
        }
    };

    if (loading) {
        return <div className="text-text-muted">Loading clients...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-text">Clients</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    + Add Client
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card-bg border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">
                        {editingId ? 'Edit Client' : 'Add New Client'}
                    </h2>

                    {formError && (
                        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                            Error: {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logo Upload */}
                            <div className="md:row-span-2">
                                <ImageUpload
                                    currentUrl={logoUrl}
                                    onUpload={setLogoUrl}
                                    folder="clients"
                                    label="Client Logo"
                                    aspectRatio="1/1"
                                    recommendedDimensions="Any size"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Website URL</label>
                                <input
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Sort Order</label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm text-text">Active</label>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 border border-border text-text rounded-lg hover:border-accent">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-bg border-b border-border">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Order</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Logo</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Name</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Website</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Status</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text">{client.sort_order}</td>
                                <td className="px-6 py-4">
                                    {client.logo_url_bw ? (
                                        <img src={client.logo_url_bw} alt={client.name} className="w-10 h-10 object-contain bg-white rounded" />
                                    ) : (
                                        <div className="w-10 h-10 bg-border rounded flex items-center justify-center text-text-muted text-xs">
                                            No logo
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-text font-medium">{client.name}</td>
                                <td className="px-6 py-4 text-text-muted text-sm">
                                    {client.website_url ? (
                                        <a href={client.website_url} target="_blank" rel="noopener" className="text-accent hover:underline">
                                            {client.website_url}
                                        </a>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded ${client.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {client.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {client.logo_url_bw && (
                                        <button
                                            onClick={() => openLogoEditor(client)}
                                            className="text-blue-400 hover:underline mr-4"
                                        >
                                            Edit Logo
                                        </button>
                                    )}
                                    <button onClick={() => handleEdit(client)} className="text-accent hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(client.id)} className="text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {clients.length === 0 && (
                    <div className="text-center py-8 text-text-muted">No clients yet. Add your first client!</div>
                )}
            </div>

            {/* Photo Editor Modal */}
            {editingLogoUrl && (
                <PhotoEditor
                    imageUrl={editingLogoUrl}
                    onSave={handleEditorSave}
                    onCancel={() => {
                        setEditingLogoUrl(null);
                        setEditingClientId(null);
                    }}
                />
            )}
        </div>
    );
}
