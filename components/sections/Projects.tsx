"use client";

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    description?: string;
    year?: string;
    site?: string;
    duration?: string;
    image_url?: string;
    gallery_urls?: string[];
    is_featured?: boolean;
    client?: {
        name?: string;
    };
}

// Project Modal Gallery Component
function ProjectModal({
    project,
    onClose
}: {
    project: Project;
    onClose: () => void;
}) {
    // Combine cover image with gallery, dedupe
    const allImages = (() => {
        const cover = project.image_url;
        const gallery = project.gallery_urls || [];
        if (!cover) return gallery.length > 0 ? gallery : [];
        // Dedupe: if cover is already in gallery, don't add again
        const uniqueGallery = gallery.filter(url => url !== cover);
        return [cover, ...uniqueGallery];
    })();

    const [currentIndex, setCurrentIndex] = useState(0);

    // Close on escape key and lock scroll
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose, currentIndex]);

    const goToNext = () => {
        if (allImages.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % allImages.length);
        }
    };

    const goToPrev = () => {
        if (allImages.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        }
    };

    const currentImage = allImages[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/95 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-5xl bg-card-bg rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-bg/80 rounded-full text-text-muted hover:text-text transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Main Image Area */}
                <div
                    className="relative h-[60vh] md:h-[70vh] bg-bg/50"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {currentImage ? (
                        <>
                            {/* Blurred Backdrop Layer */}
                            <div className="absolute inset-0 overflow-hidden">
                                <Image
                                    src={currentImage}
                                    alt=""
                                    fill
                                    className="object-cover blur-2xl opacity-30 scale-110"
                                    sizes="100vw"
                                    priority={false}
                                    draggable={false}
                                />
                            </div>

                            {/* Main Sharp Image */}
                            <Image
                                src={currentImage}
                                alt={project.title}
                                fill
                                className="object-contain z-10"
                                sizes="(max-width: 768px) 100vw, 80vw"
                                priority
                                draggable={false}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-border/20 flex items-center justify-center">
                            <span className="text-text-muted">No image</span>
                        </div>
                    )}

                    {/* Logo Watermark */}
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-none select-none z-20 text-gray-600 opacity-60">
                        <div className="text-lg md:text-2xl font-extrabold tracking-wider leading-tight">
                            DURRAT<span className="text-gray-500">.</span>
                        </div>
                        <div className="text-[8px] md:text-xs tracking-[0.25em] uppercase">
                            CONSTRUCTION
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-bg/80 rounded-full text-text-muted hover:text-text transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-bg/80 rounded-full text-text-muted hover:text-text transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {allImages.length > 1 && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-bg/80 rounded-full text-sm text-text-muted">
                            {currentIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails Row */}
                {allImages.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto bg-bg/50">
                        {allImages.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all ${index === currentIndex
                                    ? 'ring-2 ring-accent opacity-100'
                                    : 'opacity-50 hover:opacity-75'
                                    }`}
                            >
                                <Image
                                    src={url}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Project Info */}
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">{project.title}</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                        {project.year && (
                            <div>
                                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Year</span>
                                <span className="text-text font-medium">{project.year}</span>
                            </div>
                        )}
                        {project.site && (
                            <div>
                                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Site</span>
                                <span className="text-text font-medium">{project.site}</span>
                            </div>
                        )}
                        {project.duration && (
                            <div>
                                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Duration</span>
                                <span className="text-text font-medium">{project.duration}</span>
                            </div>
                        )}
                        {project.client?.name && (
                            <div>
                                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Client</span>
                                <span className="text-text font-medium">{project.client.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Project Description */}
                    {project.description && (
                        <div className="border-t border-border pt-4">
                            <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">Description</span>
                            <p className="text-text-muted leading-relaxed">{project.description}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Masonry Project Card Component
function MasonryProjectCard({
    project,
    index,
    onClick
}: {
    project: Project;
    index: number;
    onClick: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={onClick}
        >
            {/* Image Container - Fixed height for uniform grid */}
            <div className="relative h-[300px] overflow-hidden mb-4">
                {project.image_url ? (
                    <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-border/20 flex items-center justify-center">
                        <span className="text-text-muted">No image</span>
                    </div>
                )}
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>

            {/* Content Below Image */}
            <div className="space-y-2">
                {/* Year/Category Tag */}
                <span className="text-sm font-medium text-accent">
                    {project.year || 'Project'}
                </span>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-text uppercase tracking-wide group-hover:text-accent transition-colors duration-300">
                    {project.title}
                </h3>

                {/* Description */}
                {project.description ? (
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                        {project.description}
                    </p>
                ) : project.site && (
                    <p className="text-text-muted text-sm leading-relaxed">
                        {project.site}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

export default function Projects() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const PROJECTS_PER_PAGE = 6;

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProjects();
    }, []);

    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
    const visibleProjects = projects.slice(
        currentPage * PROJECTS_PER_PAGE,
        (currentPage + 1) * PROJECTS_PER_PAGE
    );
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;
    const shouldAnimate = isInView && !isLoading;

    return (
        <>
            <section id="projects" ref={ref} className="relative py-32 px-6 lg:px-20 bg-card-bg">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.div
                        initial="hidden"
                        animate={shouldAnimate ? "visible" : "hidden"}
                        variants={staggerContainer}
                    >
                        <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                            Projects
                        </motion.span>

                        <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-16 max-w-3xl">
                            Selected <span className="accent-dot">Works</span>
                        </motion.h2>

                        {/* Projects Grid - 3 columns, 2 rows = 6 per page */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {isLoading ? (
                                    // Loading skeleton
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i}>
                                            <div className="bg-bg animate-pulse h-[300px]" />
                                            <div className="mt-4 space-y-2">
                                                <div className="h-4 w-16 bg-border/20 rounded" />
                                                <div className="h-6 w-3/4 bg-border/20 rounded" />
                                                <div className="h-4 w-full bg-border/20 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : visibleProjects.length > 0 ? (
                                    visibleProjects.map((project, index) => (
                                        <MasonryProjectCard
                                            key={project.id}
                                            project={project}
                                            index={index}
                                            onClick={() => setSelectedProject(project)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-text-muted py-12">
                                        No projects to display
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination Controls */}
                        {!isLoading && totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center gap-4 mt-12"
                            >
                                {/* Previous Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    disabled={!hasPrevPage}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${hasPrevPage
                                            ? 'border-accent text-accent hover:bg-accent hover:text-bg'
                                            : 'border-border/30 text-border/30 cursor-not-allowed'
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Indicators */}
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentPage
                                                    ? 'bg-accent w-8'
                                                    : 'bg-border/30 hover:bg-border/50'
                                                }`}
                                            aria-label={`Go to page ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={!hasNextPage}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${hasNextPage
                                            ? 'border-accent text-accent hover:bg-accent hover:text-bg'
                                            : 'border-border/30 text-border/30 cursor-not-allowed'
                                        }`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Page Counter */}
                                <span className="text-text-muted text-sm ml-4">
                                    {currentPage + 1} / {totalPages}
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Project Modal Gallery */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

