"use client";

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import Image from 'next/image';
import GilberCard from '@/components/ui/GilberCard';
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

                {/* Main Image Area - NO CROPPING, with blurred backdrop */}
                <div
                    className="relative h-[60vh] md:h-[70vh] bg-bg/50"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {currentImage ? (
                        <>
                            {/* Blurred Backdrop Layer - for aesthetics only */}
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

                            {/* Main Sharp Image - NO CROP, object-contain */}
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

                    {/* Simple Logo Watermark - Bottom Right */}
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

export default function Projects() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const PROJECTS_PER_PAGE = 8;

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
    const visibleProjects = projects.slice(currentPage * PROJECTS_PER_PAGE, (currentPage + 1) * PROJECTS_PER_PAGE);
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;
    const shouldAnimate = isInView && !isLoading;

    const handleNextPage = () => {
        if (hasNextPage) {
            setSlideDirection('left');
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (hasPrevPage) {
            setSlideDirection('right');
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <>
            <section id="projects" ref={ref} className="relative min-h-screen flex items-center py-32 px-6 lg:px-20 bg-card-bg">
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

                        {/* Projects Grid - 4 columns, 2 rows with sliding animation */}
                        <div className="relative">
                            <div className="overflow-hidden">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={currentPage}
                                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
                                        initial={{ x: slideDirection === 'left' ? '100%' : '-100%', opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: slideDirection === 'left' ? '-100%' : '100%', opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {isLoading ? (
                                            // Loading skeleton
                                            Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} className="bg-bg animate-pulse">
                                                    <div className="h-48 md:h-56 bg-border/20" />
                                                    <div className="p-4">
                                                        <div className="h-3 w-16 bg-border/20 rounded mb-2" />
                                                        <div className="h-5 w-3/4 bg-border/20 rounded mb-2" />
                                                        <div className="h-3 w-full bg-border/20 rounded" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : visibleProjects.length > 0 ? (
                                            visibleProjects.map((project, index) => (
                                                <GilberCard
                                                    key={project.id}
                                                    index={index}
                                                    className="group bg-bg cursor-pointer"
                                                >
                                                    <div onClick={() => setSelectedProject(project)}>
                                                        {/* Image - Compact for 4-column grid */}
                                                        <div className="relative h-48 md:h-56 overflow-hidden">
                                                            {project.image_url ? (
                                                                <Image
                                                                    src={project.image_url}
                                                                    alt={project.title}
                                                                    fill
                                                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-border/20 flex items-center justify-center">
                                                                    <span className="text-text-muted">No image</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-60" />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-4">
                                                            <span className="text-xs font-medium text-accent mb-1 block">
                                                                {project.year || 'Project'}
                                                            </span>
                                                            <h3 className="text-lg font-semibold mb-1 text-text group-hover:text-accent transition-colors duration-300 line-clamp-1">
                                                                {project.title}
                                                            </h3>
                                                            {project.site && (
                                                                <p className="text-text-muted text-sm mb-2 line-clamp-1">
                                                                    {project.site}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center text-xs text-accent font-medium">
                                                                <span>View Project</span>
                                                                <svg className="vlt-read-more-arrow w-3 h-3 ml-1" fill="none" viewBox="0 0 16 8" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M15.3536 4.35355c.1952-.19526.1952-.51184 0-.7071L12.1716.464466c-.1953-.195262-.5119-.195262-.7071 0-.1953.195262-.1953.511845 0 .707104L14.2929 4l-2.8284 2.82843c-.1953.19526-.1953.51184 0 .7071.1952.19527.5118.19527.7071 0l3.182-3.18198zM0 4.5h15v-1H0v1z" fill="currentColor" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </GilberCard>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center text-text-muted py-12">
                                                No projects to display
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigation Arrows */}
                            {!isLoading && totalPages > 1 && (
                                <>
                                    {/* Previous Page Arrow (Left) */}
                                    {hasPrevPage && (
                                        <motion.button
                                            onClick={handlePrevPage}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -ml-[155px] flex flex-col items-center gap-2 text-accent hover:text-text transition-colors group z-10"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            aria-label="Previous projects"
                                        >
                                            <motion.div
                                                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-current flex items-center justify-center"
                                                animate={{ x: [-2, 2, -2] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </motion.div>
                                        </motion.button>
                                    )}

                                    {/* Next Page Arrow (Right) */}
                                    {hasNextPage && (
                                        <motion.button
                                            onClick={handleNextPage}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-[55px] flex flex-col items-center gap-2 text-accent hover:text-text transition-colors group z-10"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            aria-label="More projects"
                                        >
                                            <span className="text-xs font-medium tracking-wider uppercase hidden md:block" style={{ writingMode: 'vertical-rl' }}>
                                                More
                                            </span>
                                            <motion.div
                                                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-current flex items-center justify-center"
                                                animate={{ x: [2, -2, 2] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </motion.div>
                                        </motion.button>
                                    )}

                                    {/* Page Indicator - Right side aligned with cards like Gilber */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[60px] flex flex-col items-center gap-3">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSlideDirection(i > currentPage ? 'left' : 'right');
                                                    setCurrentPage(i);
                                                }}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 border ${i === currentPage
                                                        ? 'bg-accent border-accent'
                                                        : 'bg-transparent border-text-muted/50 hover:border-accent'
                                                    }`}
                                                aria-label={`Go to page ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
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
