"use client";

import { useState, useEffect, useMemo } from 'react';
import { getProjects, getClients, createProject, updateProject, deleteProject } from '@/lib/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import PhotoEditor from '@/components/admin/PhotoEditor';
import AdminDataTable from '@/components/admin/AdminDataTable';
import type { Project, Client } from '@/lib/types/content';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, GripVertical, Pencil, X, ChevronLeft, ChevronRight, Search, Star, Images, ImageOff, RotateCcw, Save, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import {
    formatBytes,
    MAX_UPLOAD_INPUT_SIZE,
    MAX_UPLOAD_OUTPUT_SIZE,
    optimizeImageFile,
} from '@/lib/clientImageOptimization';
import { normalizeAssetUrl, normalizeAssetUrls } from '@/lib/asset-url';
import { toast } from 'sonner';
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

const PROJECTS_PAGE_SIZE = 8;

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
            <div className="relative aspect-video bg-bg border border-border rounded-lg overflow-hidden">
                {url && url !== 'uploading' ? (
                    <>
                        <Image
                            src={normalizeAssetUrl(url) || url}
                            alt={`Gallery ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 180px"
                            quality={55}
                            className="object-cover cursor-pointer"
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
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [currentIndex, images.length, onClose, onNavigate]);

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
            <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={normalizeAssetUrl(images[currentIndex]) || images[currentIndex]}
                    alt={`Gallery image ${currentIndex + 1}`}
                    fill
                    sizes="90vw"
                    quality={80}
                    className="object-contain"
                />
            </div>

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
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'standard'>('all');
    const [mediaFilter, setMediaFilter] = useState<'all' | 'with-cover' | 'missing-cover' | 'with-gallery' | 'missing-gallery'>('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, featuredFilter, mediaFilter, clientFilter]);

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
        setImageUrl(normalizeAssetUrl(project.image_url) || '');
        setGalleryUrls(normalizeAssetUrls(project.gallery_urls));
        setClientId(project.client_id);
        setIsFeatured(project.is_featured);
        setSortOrder(project.sort_order);
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadProgress.uploading || galleryUrls.includes('uploading')) {
            toast.error('Please wait until all gallery images finish uploading.');
            return;
        }

        const safeGalleryUrls = galleryUrls.filter((url) => url && url !== 'uploading');

        const data = {
            title,
            description: description || undefined,
            year: year || undefined,
            site: site || undefined,
            duration: duration || undefined,
            client_id: clientId || null,
            image_url: imageUrl || null,
            gallery_urls: safeGalleryUrls,
            is_featured: isFeatured,
            sort_order: sortOrder
        };

        const result = editingId
            ? await updateProject(editingId, data)
            : await createProject(data);

        if (!result.success) {
            toast.error(result.error || 'Failed to save project');
            return;
        }

        toast.success(editingId ? 'Project updated' : 'Project created');

        if (editingId) {
            setGalleryUrls(safeGalleryUrls);
        } else {
            setGalleryUrls([]);
        }

        resetForm();
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            const result = await deleteProject(id);
            if (!result.success) {
                toast.error(result.error || 'Failed to delete project');
                return;
            }
            toast.success('Project deleted');
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

    const handlePhotoEditorSave = async (editedBlob: Blob) => {
        const { uploadImage } = await import('@/lib/storage');
        const formData = new FormData();
        formData.append('file', new File([editedBlob], 'edited-image.webp', { type: 'image/webp' }));
        formData.append('folder', editingImageType === 'cover' ? 'projects' : 'projects/gallery');

        const result = await uploadImage(formData);
        if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to save edited image');
        }

        if (editingImageType === 'cover') {
            setImageUrl(result.url);
        } else if (editingGalleryIndex >= 0) {
            updateGalleryImage(editingGalleryIndex, result.url);
        }
    };

    const closePhotoEditor = () => {
        setEditingImageUrl(null);
    };

    const uploadProjectImageFile = async (file: File, folder = 'projects/gallery') => {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }

        if (file.size > MAX_UPLOAD_INPUT_SIZE) {
            throw new Error(`Image must be less than ${formatBytes(MAX_UPLOAD_INPUT_SIZE)} before optimization`);
        }

        const optimized = await optimizeImageFile(file, folder);
        if (optimized.file.size > MAX_UPLOAD_OUTPUT_SIZE) {
            throw new Error(`Image is still ${formatBytes(optimized.file.size)} after optimization. Please choose a smaller image.`);
        }

        const { uploadImage } = await import('@/lib/storage');
        const formData = new FormData();
        formData.append('file', optimized.file);
        formData.append('folder', folder);

        const result = await uploadImage(formData);
        if (!result.success || !result.url) {
            throw new Error(result.error || 'Upload failed');
        }

        return result.url;
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
        try {
            const uploadedUrl = await uploadProjectImageFile(file);
            updateGalleryImage(index, uploadedUrl);
        } catch (error) {
            updateGalleryImage(index, '');
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        }
    };

    const projectStats = useMemo(() => {
        const totalGalleryImages = projects.reduce((sum, project) => sum + (project.gallery_urls?.length || 0), 0);
        const withCover = projects.filter(project => Boolean(project.image_url)).length;
        const featured = projects.filter(project => project.is_featured).length;

        return {
            total: projects.length,
            featured,
            withCover,
            missingCover: projects.length - withCover,
            totalGalleryImages,
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return projects.filter((project) => {
            const galleryCount = project.gallery_urls?.length || 0;
            const clientName = project.client?.name || '';
            const matchesSearch = !normalizedSearch
                || project.title.toLowerCase().includes(normalizedSearch)
                || (project.year || '').toLowerCase().includes(normalizedSearch)
                || (project.site || '').toLowerCase().includes(normalizedSearch)
                || clientName.toLowerCase().includes(normalizedSearch);

            const matchesFeatured = featuredFilter === 'all'
                || (featuredFilter === 'featured' && project.is_featured)
                || (featuredFilter === 'standard' && !project.is_featured);

            const matchesMedia = mediaFilter === 'all'
                || (mediaFilter === 'with-cover' && Boolean(project.image_url))
                || (mediaFilter === 'missing-cover' && !project.image_url)
                || (mediaFilter === 'with-gallery' && galleryCount > 0)
                || (mediaFilter === 'missing-gallery' && galleryCount === 0);

            const matchesClient = clientFilter === 'all' || project.client_id === clientFilter;

            return matchesSearch && matchesFeatured && matchesMedia && matchesClient;
        });
    }, [clientFilter, featuredFilter, mediaFilter, projects, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PAGE_SIZE));
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * PROJECTS_PAGE_SIZE,
        currentPage * PROJECTS_PAGE_SIZE
    );
    const hasActiveFilters = Boolean(searchQuery || featuredFilter !== 'all' || mediaFilter !== 'all' || clientFilter !== 'all');

    useEffect(() => {
        setCurrentPage((page) => Math.min(Math.max(page, 1), totalPages));
    }, [totalPages]);

    const clearFilters = () => {
        setSearchQuery('');
        setFeaturedFilter('all');
        setMediaFilter('all');
        setClientFilter('all');
    };

    const projectColumns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Project',
                cell: ({ row }) => {
                    const project = row.original;
                    const clientName = project.client?.name;

                    return (
                        <div className="flex items-center gap-4">
                            {project.image_url ? (
                                <div className="relative h-16 w-24 overflow-hidden rounded-md">
                                    <Image
                                        src={normalizeAssetUrl(project.image_url) || project.image_url}
                                        alt={project.title}
                                        fill
                                        sizes="96px"
                                        quality={55}
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-16 w-24 items-center justify-center rounded-md border border-border bg-bg text-text-muted">
                                    <ImageOff className="h-5 w-5" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="max-w-[340px] truncate text-sm font-semibold text-text">{project.title}</p>
                                    {project.is_featured && (
                                        <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                                    <span>{clientName || 'No client'}</span>
                                    <span>{project.site || 'No site'}</span>
                                    <span>{project.duration || 'No duration'}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'year',
                header: 'Year',
                cell: ({ row }) => <span className="text-sm text-text-muted">{row.original.year || '-'}</span>,
                size: 110,
            },
            {
                id: 'media',
                header: 'Media',
                sortingFn: (a, b) => (a.original.gallery_urls?.length || 0) - (b.original.gallery_urls?.length || 0),
                cell: ({ row }) => {
                    const project = row.original;
                    const galleryCount = project.gallery_urls?.length || 0;

                    return (
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${project.image_url ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {project.image_url ? 'Cover ready' : 'No cover'}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${galleryCount > 0 ? 'bg-accent/15 text-accent' : 'bg-border text-text-muted'}`}>
                                {galleryCount > 0 ? `${galleryCount} images` : 'No gallery'}
                            </span>
                        </div>
                    );
                },
                size: 220,
            },
            {
                accessorKey: 'is_featured',
                header: 'Status',
                cell: ({ row }) => (
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.is_featured ? 'bg-accent/15 text-accent' : 'bg-border text-text-muted'}`}>
                        {row.original.is_featured ? 'Homepage' : 'Standard'}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: 'sort_order',
                header: 'Order',
                cell: ({ row }) => <span className="text-sm text-text-muted">{row.original.sort_order}</span>,
                size: 100,
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
        [paginatedProjects]
    );

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <p className="text-sm text-text-muted">Loading projects...</p>
                </div>
            </div>
        );
    }

    const validGalleryUrls = normalizeAssetUrls(galleryUrls.filter(url => url && url !== 'uploading'));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Portfolio CMS</p>
                        <h1 className="text-3xl font-bold text-text">Projects</h1>
                        <p className="mt-2 max-w-2xl text-sm text-text-muted">
                            Project records, media readiness, and homepage visibility in one working view.
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Project
                    </button>
                </div>

                <div className="grid overflow-hidden rounded-lg border border-border bg-card-bg md:grid-cols-5">
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Total</p>
                        <p className="mt-2 text-2xl font-semibold text-text">{projectStats.total}</p>
                    </div>
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Featured</p>
                        <p className="mt-2 text-2xl font-semibold text-accent">{projectStats.featured}</p>
                    </div>
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">With Cover</p>
                        <p className="mt-2 text-2xl font-semibold text-text">{projectStats.withCover}</p>
                    </div>
                    <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Missing Cover</p>
                        <p className={`mt-2 text-2xl font-semibold ${projectStats.missingCover > 0 ? 'text-red-300' : 'text-text'}`}>
                            {projectStats.missingCover}
                        </p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Gallery Images</p>
                        <p className="mt-2 text-2xl font-semibold text-text">{projectStats.totalGalleryImages}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card-bg p-4">
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_190px_220px_auto]">
                        <label className="relative block">
                            <span className="sr-only">Search projects</span>
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search title, year, site, client..."
                                className="h-11 w-full rounded-lg border border-border bg-bg pl-10 pr-4 text-sm text-text outline-none transition-colors focus:border-accent"
                            />
                        </label>

                        <select
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value as typeof featuredFilter)}
                            className="h-11 rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none transition-colors focus:border-accent"
                            aria-label="Filter by featured state"
                        >
                            <option value="all">All visibility</option>
                            <option value="featured">Featured only</option>
                            <option value="standard">Not featured</option>
                        </select>

                        <select
                            value={mediaFilter}
                            onChange={(e) => setMediaFilter(e.target.value as typeof mediaFilter)}
                            className="h-11 rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none transition-colors focus:border-accent"
                            aria-label="Filter by media state"
                        >
                            <option value="all">All media</option>
                            <option value="with-cover">Has cover</option>
                            <option value="missing-cover">Missing cover</option>
                            <option value="with-gallery">Has gallery</option>
                            <option value="missing-gallery">Missing gallery</option>
                        </select>

                        <select
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="h-11 rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none transition-colors focus:border-accent"
                            aria-label="Filter by client"
                        >
                            <option value="all">All clients</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                    <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {editingId ? 'Project Editor' : 'New Project'}
                            </p>
                            <h2 className="text-xl font-bold text-text">{editingId ? title || 'Edit Project' : 'Add Project'}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 font-medium ${imageUrl ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {imageUrl ? 'Cover ready' : 'No cover'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                                <Images className="h-3.5 w-3.5 text-accent" />
                                {galleryUrls.length}/15
                            </span>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
                            >
                                <X className="h-4 w-4" />
                                Close
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 gap-6 p-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                            {/* Project Cover Image */}
                            <div className="rounded-lg border border-border bg-bg/45 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-text">Cover Image</label>
                                        <p className="mt-1 text-xs text-text-muted">1200x800px</p>
                                    </div>
                                    {imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() => openPhotoEditor(imageUrl, 'cover')}
                                            className="inline-flex items-center gap-2 rounded-lg border border-accent px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <ImageUpload
                                    currentUrl={imageUrl}
                                    onUpload={setImageUrl}
                                    folder="projects"
                                    label=""
                                    aspectRatio="4/3"
                                    minWidth={1200}
                                    minHeight={800}
                                    recommendedDimensions="1200x800px"
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
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-text">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Short portfolio description..."
                                        className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Year</label>
                                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Site / Location</label>
                                    <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Riyadh" className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Duration</label>
                                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="18 months" className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Client</label>
                                    <select value={clientId || ''} onChange={(e) => setClientId(e.target.value || null)} className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none">
                                        <option value="">Select client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text">Sort Order</label>
                                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none" />
                                </div>
                                <label className="flex min-h-[48px] items-center gap-3 rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text">
                                    <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-accent" />
                                    Featured on homepage
                                </label>
                            </div>
                        </div>

                        {/* Gallery Images Section */}
                        <div className="border-t border-border px-5 py-5">
                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <label className="text-sm font-semibold text-text">Gallery Images</label>
                                    <p className="mt-1 text-xs text-text-muted">{galleryUrls.length}/15 uploaded</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Bulk Upload Button */}
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-accent px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg">
                                        <UploadCloud className="h-4 w-4" />
                                        Bulk Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;

                                                const maxSlots = 15 - galleryUrls.length;
                                                const filesToUpload = files.slice(0, maxSlots);
                                                let failedUploads = 0;
                                                let lastError = '';

                                                setUploadProgress({ current: 0, total: filesToUpload.length, uploading: true });

                                                for (let i = 0; i < filesToUpload.length; i++) {
                                                    const file = filesToUpload[i];
                                                    setUploadProgress(prev => ({ ...prev, current: i + 1 }));

                                                    try {
                                                        const uploadedUrl = await uploadProjectImageFile(file);
                                                        setGalleryUrls(prev => [...prev, uploadedUrl]);
                                                    } catch (error) {
                                                        failedUploads += 1;
                                                        lastError = error instanceof Error ? error.message : 'Upload failed';
                                                    }
                                                }

                                                setUploadProgress({ current: 0, total: 0, uploading: false });
                                                if (failedUploads > 0) {
                                                    toast.error(`${failedUploads} image(s) failed. ${lastError}`);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                    </label>

                                    {galleryUrls.length < 15 && (
                                        <button
                                            type="button"
                                            onClick={() => addGalleryImage('')}
                                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Slot
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploadProgress.uploading && (
                                <div className="mb-4">
                                    <div className="mb-1 flex justify-between text-xs text-text-muted">
                                        <span>Uploading images...</span>
                                        <span>{uploadProgress.current} / {uploadProgress.total}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-border">
                                        <div
                                            className="h-full bg-accent"
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {galleryUrls.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border bg-bg/50 px-6 py-10 text-center">
                                    <Images className="mx-auto mb-3 h-8 w-8 text-text-muted" />
                                    <p className="text-sm font-medium text-text">No gallery images</p>
                                    <p className="mt-1 text-sm text-text-muted">Add project images when they are ready.</p>
                                </div>
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
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
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

                        <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                            <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent">
                                Cancel
                            </button>
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90">
                                <Save className="h-4 w-4" />
                                {editingId ? 'Update Project' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-border bg-card-bg">
                <div className="flex flex-col gap-2 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-text">Project list</h2>
                        <p className="text-sm text-text-muted">
                            Showing {filteredProjects.length === 0 ? 0 : (currentPage - 1) * PROJECTS_PAGE_SIZE + 1}
                            -{Math.min(currentPage * PROJECTS_PAGE_SIZE, filteredProjects.length)} of {filteredProjects.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                            <Star className="h-3.5 w-3.5 text-accent" />
                            {projectStats.featured} featured
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                            <Images className="h-3.5 w-3.5 text-accent" />
                            {projectStats.totalGalleryImages} gallery images
                        </span>
                    </div>
                </div>

                {filteredProjects.length > 0 && (
                    <AdminDataTable
                        data={paginatedProjects}
                        columns={projectColumns}
                        embedded
                        emptyMessage="No projects match this view."
                    />
                )}

                {filteredProjects.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center border-t border-border px-6 py-12 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg text-text-muted">
                            <Search className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-text">No projects match this view</h3>
                        <p className="mt-2 max-w-md text-sm text-text-muted">
                            Clear the filters or add a new project to build the portfolio.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {filteredProjects.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-text-muted">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Photo Editor Modal */}
            {editingImageUrl && (
                <PhotoEditor
                    imageUrl={editingImageUrl}
                    originalUrl={editingImageUrl}
                    onSave={handlePhotoEditorSave}
                    onCancel={closePhotoEditor}
                    maxExportDimension={1600}
                    exportQuality={0.82}
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
