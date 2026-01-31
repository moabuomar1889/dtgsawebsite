"use client";

import { useState, useEffect } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '@/lib/actions';
import type { News } from '@/lib/supabase/types';

export default function AdminNewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => { loadNews(); }, []);

    const loadNews = async () => {
        setLoading(true);
        const data = await getNews();
        setNews(data);
        setLoading(false);
    };

    const resetForm = () => {
        setTitle(''); setDate(new Date().toISOString().split('T')[0]); setExcerpt(''); setIsPublished(false);
        setEditingId(null); setShowForm(false);
    };

    const handleEdit = (item: News) => {
        setTitle(item.title); setDate(item.date); setExcerpt(item.excerpt || ''); setIsPublished(item.is_published);
        setEditingId(item.id); setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { title, date, excerpt, image_url: null, is_published: isPublished };
        if (editingId) await updateNews(editingId, data);
        else await createNews(data);
        resetForm(); loadNews();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this news article?')) { await deleteNews(id); loadNews(); }
    };

    if (loading) return <div className="text-text-muted">Loading news...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-text">News</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90">+ Add Article</button>
            </div>

            {showForm && (
                <div className="bg-card-bg border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">{editingId ? 'Edit Article' : 'Add Article'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Title *</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Date</label>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="isPublished" className="text-sm text-text">Published</label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Excerpt</label>
                                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none" />
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
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Title</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Date</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Status</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map((item) => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text font-medium">{item.title}</td>
                                <td className="px-6 py-4 text-text-muted">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded ${item.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {item.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(item)} className="text-accent hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {news.length === 0 && <div className="text-center py-8 text-text-muted">No news articles yet.</div>}
            </div>
        </div>
    );
}
