"use client";

import { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '@/lib/actions';
import type { Service } from '@/lib/supabase/types';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => { loadServices(); }, []);

    const loadServices = async () => {
        setLoading(true);
        const data = await getServices();
        setServices(data);
        setLoading(false);
    };

    const resetForm = () => {
        setTitle(''); setDescription(''); setIconUrl(''); setSortOrder(services.length);
        setEditingId(null); setShowForm(false);
    };

    const handleEdit = (item: Service) => {
        setTitle(item.title);
        setDescription(item.description || '');
        setIconUrl(item.icon_url || '');
        setSortOrder(item.sort_order);
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            title,
            description,
            icon_key: 'custom', // Using custom since we have image now
            icon_url: iconUrl || null,
            sort_order: sortOrder
        };
        if (editingId) await updateService(editingId, data);
        else await createService(data);
        resetForm(); loadServices();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this service?')) { await deleteService(id); loadServices(); }
    };

    if (loading) return <div className="text-text-muted">Loading services...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-text">Services</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90">+ Add Service</button>
            </div>

            {showForm && (
                <div className="bg-card-bg border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">{editingId ? 'Edit Service' : 'Add Service'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
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

                            {/* Icon Upload */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Service Icon</label>
                                <div className="w-[120px]">
                                    <ImageUpload
                                        currentUrl={iconUrl}
                                        onUpload={setIconUrl}
                                        folder="services"
                                        aspectRatio="1/1"
                                        label=""
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90">{editingId ? 'Update' : 'Create'}</button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 border border-border text-text rounded-lg hover:border-accent">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-bg border-b border-border">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Order</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Icon</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Title</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Description</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((item) => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text">{item.sort_order}</td>
                                <td className="px-6 py-4">
                                    {item.icon_url ? (
                                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-bg">
                                            <Image
                                                src={item.icon_url}
                                                alt={item.title}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-bg flex items-center justify-center text-text-muted text-xs">
                                            No icon
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-text font-medium">{item.title}</td>
                                <td className="px-6 py-4 text-text-muted text-sm line-clamp-1">{item.description || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(item)} className="text-accent hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {services.length === 0 && <div className="text-center py-8 text-text-muted">No services yet.</div>}
            </div>
        </div>
    );
}
