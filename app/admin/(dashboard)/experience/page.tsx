"use client";

import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { getExperience, createExperience, updateExperience, deleteExperience } from '@/lib/actions';
import type { Experience } from '@/lib/supabase/types';
import AdminDataTable from '@/components/admin/AdminDataTable';

export default function AdminExperiencePage() {
    const [experience, setExperience] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
    const [endYear, setEndYear] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState(0);

    const loadExperience = async () => {
        setLoading(true);
        const data = await getExperience();
        setExperience(data);
        setLoading(false);
    };

    useEffect(() => {
        void loadExperience();
    }, []);

    const resetForm = () => {
        setTitle('');
        setCompany('');
        setStartYear(new Date().getFullYear());
        setEndYear(null);
        setDescription('');
        setSortOrder(experience.length);
        setEditingId(null);
        setShowForm(false);
        setFormError(null);
    };

    const handleEdit = (item: Experience) => {
        setTitle(item.title);
        setCompany(item.company);
        setStartYear(item.start_year);
        setEndYear(item.end_year);
        setDescription(item.description || '');
        setSortOrder(item.sort_order);
        setEditingId(item.id);
        setShowForm(true);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        if (endYear && endYear < startYear) {
            const message = 'End year cannot be earlier than start year';
            setSaving(false);
            setFormError(message);
            toast.error(message);
            return;
        }

        const payload = {
            title,
            company,
            start_year: startYear,
            end_year: endYear,
            description,
            sort_order: sortOrder,
        };

        const result = editingId
            ? await updateExperience(editingId, payload)
            : await createExperience(payload);

        setSaving(false);

        if (!result.success) {
            const message = result.error || 'Failed to save experience entry';
            setFormError(message);
            toast.error(message);
            return;
        }

        toast.success(editingId ? 'Experience updated' : 'Experience created');
        resetForm();
        await loadExperience();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this experience?')) return;

        const result = await deleteExperience(id);
        if (!result.success) {
            toast.error(result.error || 'Failed to delete experience entry');
            return;
        }

        toast.success('Experience deleted');
        await loadExperience();
    };

    const columns = useMemo<ColumnDef<Experience>[]>(
        () => [
            {
                accessorKey: 'sort_order',
                header: 'Order',
                cell: ({ row }) => <span className="text-text">{row.original.sort_order}</span>,
                size: 90,
            },
            {
                accessorKey: 'title',
                header: 'Title',
                cell: ({ row }) => <span className="font-semibold text-text">{row.original.title}</span>,
            },
            {
                accessorKey: 'company',
                header: 'Company',
                cell: ({ row }) => <span className="text-text-muted">{row.original.company || '-'}</span>,
            },
            {
                id: 'years',
                header: 'Years',
                sortingFn: (a, b) => a.original.start_year - b.original.start_year,
                cell: ({ row }) => (
                    <span className="text-text-muted">
                        {row.original.start_year} - {row.original.end_year || 'Present'}
                    </span>
                ),
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
        [experience]
    );

    if (loading) {
        return <div className="text-text-muted">Loading experience...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text">Experience</h1>
                    <p className="mt-1 text-sm text-text-muted">Manage the experience timeline and company history entries.</p>
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
                    Add Experience
                </button>
            </div>

            {showForm && (
                <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {editingId ? 'Experience Editor' : 'New Experience'}
                            </p>
                            <h2 className="text-xl font-bold text-text">{editingId ? title || 'Edit Experience' : 'Add Experience'}</h2>
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
                        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
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
                                <label className="mb-2 block text-sm font-medium text-text">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">Start Year</label>
                                <input
                                    type="number"
                                    value={startYear}
                                    onChange={(e) => setStartYear(Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">End Year</label>
                                <input
                                    type="number"
                                    value={endYear || ''}
                                    onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Present"
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
                                {saving ? 'Saving...' : editingId ? 'Update Experience' : 'Create Experience'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AdminDataTable
                data={experience}
                columns={columns}
                emptyMessage="No experience entries yet."
            />
        </div>
    );
}
