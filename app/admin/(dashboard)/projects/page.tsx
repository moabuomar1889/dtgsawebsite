"use client";

import { useState, useEffect } from 'react';
import { getProjects, getClients, createProject, updateProject, deleteProject } from '@/lib/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import PhotoEditor from '@/components/admin/PhotoEditor';
import type { Project, Client } from '@/lib/supabase/types';
import { Plus, Trash2, GripVertical, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Gallery Item Component
interface SortableGalleryItemProps {
    id: string;
    url: string;
    index: number;
    onRemove: () => void;
    onEdit: () => void;
    onPreview: () => void;
    onUpload: (file: File) => void;
}

function SortableGalleryItem({ id, url, index, onRemove, onEdit, onPreview, onUpload }: SortableGalleryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className="aspect-video bg-bg border border-border rounded-lg overflow-hidden">
                {url && url !== 'uploading' ? (
                    <>
                        <img
                            src={url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={onPreview}
                        />
                        {/* Drag handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="absolute top-1 left-1 p-1 bg-bg/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                        >
                            <GripVertical className="w-4 h-4 text-text-muted" />
                        </div>
                    </>
                ) : url === 'uploading' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-xs text-text-muted">Uploading...</span>
                    </div>
                ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-border/20">
                        <Plus className="w-6 h-6 text-text-muted mb-1" />
                        <span className="text-xs text-text-muted">Upload</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUpload(file);
                            }}
                        />
                    </label>
                )}
            </div>
            {/* Action buttons */}
            {url && url !== 'uploading' && (
                <>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Edit image"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Remove image"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </>
            )}
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-bg/80 text-xs text-text-muted rounded">
                #{index + 1}
            </span>
        </div>
    );
}

// Lightbox Component
interface LightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [currentIndex]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Navigation arrows */}
            {currentIndex > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
                    className="absolute left-4 p-2 text-white/70 hover:text-white"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
            )}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
                    className="absolute right-4 p-2 text-white/70 hover:text-white"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            )}

            {/* Image */}
            <img
                src={images[currentIndex]}
                alt={`Gallery image ${currentIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [year, setYear] = useState('');
    const [site, setSite] = useState('');
    const [duration, setDuration] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [clientId, setClientId] = useState<string | null>(null);
    const [isFeatured, setIsFeatured] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; uploading: boolean }>({
        current: 0,
        total: 0,
        uploading: false
    });

    // Photo editor state
    const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
    const [editingImageType, setEditingImageType] = useState<'cover' | 'gallery'>('cover');
    const [editingGalleryIndex, setEditingGalleryIndex] = useState<number>(-1);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [projectsData, clientsData] = await Promise.all([getProjects(), getClients()]);
        setProjects(projectsData);
        setClients(clientsData);
        setLoading(false);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setYear('');
        setSite('');
        setDuration('');
        setImageUrl('');
        setGalleryUrls([]);
        setClientId(null);
        setIsFeatured(false);
        setSortOrder(projects.length);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (project: Project) => {
        setTitle(project.title);
        setDescription(project.description || '');
        setYear(project.year || '');
        setSite(project.site || '');
        setDuration(project.duration || '');
        setImageUrl(project.image_url || '');
        setGalleryUrls(project.gallery_urls || []);
        setClientId(project.client_id);
        setIsFeatured(project.is_featured);
        setSortOrder(project.sort_order);
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            title,
            description: description || undefined,
            year: year || undefined,
            site: site || undefined,
            duration: duration || undefined,
            client_id: clientId || null,
            image_url: imageUrl || null,
            gallery_urls: galleryUrls,
            is_featured: isFeatured,
            sort_order: sortOrder
        };

        if (editingId) {
            await updateProject(editingId, data);
        } else {
            await createProject(data);
        }

        resetForm();
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(id);
            loadData();
        }
    };

    // Gallery management functions
    const addGalleryImage = (url: string) => {
        if (galleryUrls.length < 15) {
            setGalleryUrls([...galleryUrls, url]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
    };

    const updateGalleryImage = (index: number, url: string) => {
        const updated = [...galleryUrls];
        updated[index] = url;
        setGalleryUrls(updated);
    };

    // Handle drag end for reordering
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = galleryUrls.findIndex((_, i) => `gallery-${i}` === active.id);
            const newIndex = galleryUrls.findIndex((_, i) => `gallery-${i}` === over.id);
            setGalleryUrls(arrayMove(galleryUrls, oldIndex, newIndex));
        }
    };

    // Photo editor handlers
    const openPhotoEditor = (url: string, type: 'cover' | 'gallery', galleryIndex: number = -1) => {
        setEditingImageUrl(url);
        setEditingImageType(type);
        setEditingGalleryIndex(galleryIndex);
    };

    const handlePhotoEditorSave = async (editedBlob: Blob, originalUrl: string) => {
        const { uploadImage } = await import('@/lib/storage');
        const formData = new FormData();
        formData.append('file', new File([editedBlob], 'edited-image.webp', { type: 'image/webp' }));
        formData.append('folder', editingImageType === 'cover' ? 'projects' : 'projects/gallery');

        const result = await uploadImage(formData);
        if (result.success && result.url) {
            if (editingImageType === 'cover') {
                setImageUrl(result.url);
            } else if (editingGalleryIndex >= 0) {
                updateGalleryImage(editingGalleryIndex, result.url);
            }
        }

        setEditingImageUrl(null);
    };

    const closePhotoEditor = () => {
        setEditingImageUrl(null);
    };

    // Lightbox handlers
    const openLightbox = (index: number) => {
        const validUrls = galleryUrls.filter(url => url && url !== 'uploading');
        const realIndex = validUrls.indexOf(galleryUrls[index]);
        if (realIndex >= 0) {
            setLightboxIndex(realIndex);
            setLightboxOpen(true);
        }
    };

    // Handle single image upload for gallery slot
    const handleGallerySlotUpload = async (index: number, file: File) => {
        updateGalleryImage(index, 'uploading');
        const { uploadImage } = await import('@/lib/storage');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'projects/gallery');
        const result = await uploadImage(formData);
        if (result.success && result.url) {
            updateGalleryImage(index, result.url);
        } else {
            updateGalleryImage(index, '');
        }
    };

    if (loading) {
        return <div className="text-text-muted">Loading projects...</div>;
    }

    const validGalleryUrls = galleryUrls.filter(url => url && url !== 'uploading');

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-text">Projects</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90">
                    + Add Project
                </button>
            </div>

            {showForm && (
                <div className="bg-card-bg border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Project Cover Image */}
                            <div className="md:row-span-2">
                                <ImageUpload
                                    currentUrl={imageUrl}
                                    onUpload={setImageUrl}
                                    folder="projects"
                                    label="Cover Image"
                                    aspectRatio="4/3"
                                    minWidth={1200}
                                    minHeight={800}
                                    recommendedDimensions="1200×800px"
                                />
                                {imageUrl && (
                                    <button
                                        type="button"
                                        onClick={() => openPhotoEditor(imageUrl, 'cover')}
                                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-accent border border-accent rounded-lg hover:bg-accent hover:text-white"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Cover Photo
                                    </button>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Title *</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Project description shown in gallery footer..."
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Year</label>
                                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Site/Location</label>
                                <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Riyadh" className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Duration</label>
                                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="18 months" className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Client</label>
                                <select value={clientId || ''} onChange={(e) => setClientId(e.target.value || null)} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent">
                                    <option value="">Select client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Sort Order</label>
                                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent" />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="isFeatured" className="text-sm text-text">Featured on homepage</label>
                            </div>
                        </div>

                        {/* Gallery Images Section */}
                        <div className="border-t border-border pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-text">
                                    Gallery Images ({galleryUrls.length}/15) - <span className="text-text-muted">Drag to reorder, click to preview</span>
                                </label>
                                <div className="flex gap-2">
                                    {/* Bulk Upload Button */}
                                    <label className="flex items-center gap-1 px-3 py-1 text-sm text-accent border border-accent rounded hover:bg-accent hover:text-bg cursor-pointer">
                                        <Plus className="w-4 h-4" />
                                        Bulk Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;

                                                const { uploadImage } = await import('@/lib/storage');
                                                const maxSlots = 15 - galleryUrls.length;
                                                const filesToUpload = files.slice(0, maxSlots);

                                                setUploadProgress({ current: 0, total: filesToUpload.length, uploading: true });

                                                for (let i = 0; i < filesToUpload.length; i++) {
                                                    const file = filesToUpload[i];
                                                    setUploadProgress(prev => ({ ...prev, current: i + 1 }));

                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('folder', 'projects/gallery');

                                                    const result = await uploadImage(formData);
                                                    if (result.success && result.url) {
                                                        setGalleryUrls(prev => [...prev, result.url!]);
                                                    }
                                                }

                                                setUploadProgress({ current: 0, total: 0, uploading: false });
                                                e.target.value = '';
                                            }}
                                        />
                                    </label>

                                    {galleryUrls.length < 15 && (
                                        <button
                                            type="button"
                                            onClick={() => addGalleryImage('')}
                                            className="flex items-center gap-1 px-3 py-1 text-sm text-text-muted border border-border rounded hover:border-accent hover:text-accent"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Slot
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploadProgress.uploading && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-text-muted mb-1">
                                        <span>Uploading images...</span>
                                        <span>{uploadProgress.current} / {uploadProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent"
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {galleryUrls.length === 0 ? (
                                <p className="text-text-muted text-sm py-4">
                                    No gallery images yet. Use "Bulk Upload" to add multiple images at once.
                                </p>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={galleryUrls.map((_, i) => `gallery-${i}`)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {galleryUrls.map((url, index) => (
                                                <SortableGalleryItem
                                                    key={`gallery-${index}`}
                                                    id={`gallery-${index}`}
                                                    url={url}
                                                    index={index}
                                                    onRemove={() => removeGalleryImage(index)}
                                                    onEdit={() => openPhotoEditor(url, 'gallery', index)}
                                                    onPreview={() => openLightbox(index)}
                                                    onUpload={(file) => handleGallerySlotUpload(index, file)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
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
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Image</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Title</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Year</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Gallery</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Featured</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                                <td className="px-6 py-4 text-text">{project.sort_order}</td>
                                <td className="px-6 py-4">
                                    {project.image_url ? (
                                        <img src={project.image_url} alt={project.title} className="w-16 h-12 object-cover rounded" />
                                    ) : (
                                        <div className="w-16 h-12 bg-border rounded flex items-center justify-center text-text-muted text-xs">
                                            No image
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-text font-medium">{project.title}</td>
                                <td className="px-6 py-4 text-text-muted">{project.year || '-'}</td>
                                <td className="px-6 py-4 text-text-muted">
                                    {(project.gallery_urls?.length || 0) > 0 ? (
                                        <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">
                                            {project.gallery_urls?.length} images
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    {project.is_featured && <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">Featured</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg"
                                            title="Edit project"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                            title="Delete project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {projects.length === 0 && <div className="text-center py-8 text-text-muted">No projects yet.</div>}
            </div>

            {/* Photo Editor Modal */}
            {editingImageUrl && (
                <PhotoEditor
                    imageUrl={editingImageUrl}
                    originalUrl={editingImageUrl}
                    onSave={handlePhotoEditorSave}
                    onCancel={closePhotoEditor}
                />
            )}

            {/* Lightbox */}
            {lightboxOpen && validGalleryUrls.length > 0 && (
                <Lightbox
                    images={validGalleryUrls}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </div>
    );
}
