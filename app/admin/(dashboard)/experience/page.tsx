"use client";

import { useState, useEffect } from 'react';
import { getExperience, createExperience, updateExperience, deleteExperience } from '@/lib/actions';
import type { Experience } from '@/lib/supabase/types';

export default function AdminExperiencePage() {
    const [experience, setExperience] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
    const [endYear, setEndYear] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => { loadExperience(); }, []);

    const loadExperience = async () => {
        setLoading(true);
        const data = await getExperience();
        setExperience(data);
        setLoading(false);
    };

    const resetForm = () => {
        setTitle(''); setCompany(''); setStartYear(new Date().getFullYear()); setEndYear(null); setDescription(''); setSortOrder(experience.length);
        setEditingId(null); setShowForm(false);
    };

    const handleEdit = (item: Experience) => {
        setTitle(item.title); setCompany(item.company); setStartYear(item.start_year); setEndYear(item.end_year); setDescription(item.description || ''); setSortOrder(item.sort_order);
        setEditingId(item.id); setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { title, company, start_year: startYear, end_year: endYear, description, sort_order: sortOrder };
        if (editingId) await updateExperience(editingId, data);
        else await createExperience(data);
        resetForm(); loadExperience();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this experience?')) { await deleteExperience(id); loadExperience(); }
    };

    if (loading) return <div className="text-text-muted">Loading experience...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-text">Experience</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90">+ Add Experience</button>
            </div>

            {showForm && (
                <div className="bg-card-bg border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">{editingId ? 'Edit Experience' : 'Add Experience'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Title *</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Company</label>
                                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Start Year</label>
                                <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">End Year (blank = present)</label>
                                <input type="number" value={endYear || ''} onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Sort Order</label>
                                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none" />
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
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Title</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Company</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Years</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {experience.map((item) => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text">{item.sort_order}</td>
                                <td className="px-6 py-4 text-text font-medium">{item.title}</td>
                                <td className="px-6 py-4 text-text-muted">{item.company}</td>
                                <td className="px-6 py-4 text-text-muted">{item.start_year} - {item.end_year || 'Present'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(item)} className="text-accent hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {experience.length === 0 && <div className="text-center py-8 text-text-muted">No experience entries yet.</div>}
            </div>
        </div>
    );
}
