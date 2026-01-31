"use client";

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import Image from 'next/image';
import GilberCard from '@/components/ui/GilberCard';

interface NewsArticle {
    id: string;
    title: string;
    date?: string;
    excerpt?: string;
    image_url?: string;
}

export default function News() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

    const NEWS_PER_PAGE = 4;

    useEffect(() => {
        const loadNews = async () => {
            try {
                const response = await fetch('/api/news');
                if (response.ok) {
                    const data = await response.json();
                    setNews(data);
                }
            } catch (error) {
                console.error('Error loading news:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadNews();
    }, []);

    const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
    const visibleNews = news.slice(currentPage * NEWS_PER_PAGE, (currentPage + 1) * NEWS_PER_PAGE);
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const shouldAnimate = isInView && !isLoading;

    return (
        <section id="news" ref={ref} className="relative min-h-screen flex items-center py-32 px-6 lg:px-20 bg-card-bg">
            <div className="max-w-7xl mx-auto w-full">
                <motion.div
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                        News & Insights
                    </motion.span>

                    <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-16 max-w-3xl">
                        Latest <span className="accent-dot">Thinking</span>
                    </motion.h2>

                    {/* News Grid with sliding animation */}
                    <div className="relative">
                        <div className="overflow-hidden">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentPage}
                                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                                    initial={{ x: slideDirection === 'left' ? '100%' : '-100%', opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: slideDirection === 'left' ? '-100%' : '100%', opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="bg-bg animate-pulse">
                                                <div className="h-48 bg-border/20" />
                                                <div className="p-4">
                                                    <div className="h-3 w-24 bg-border/20 rounded mb-3" />
                                                    <div className="h-5 w-3/4 bg-border/20 rounded mb-3" />
                                                    <div className="h-4 w-full bg-border/20 rounded" />
                                                </div>
                                            </div>
                                        ))
                                    ) : visibleNews.length > 0 ? (
                                        visibleNews.map((article, index) => (
                                            <GilberCard
                                                key={article.id}
                                                as="article"
                                                index={index}
                                                className="group bg-bg"
                                            >
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden">
                                                    {article.image_url ? (
                                                        <Image
                                                            src={article.image_url}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-border/20 flex items-center justify-center">
                                                            <span className="text-text-muted">No image</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <time className="text-xs font-medium text-accent mb-2 block">
                                                        {formatDate(article.date)}
                                                    </time>

                                                    <h3 className="text-lg font-semibold mb-2 text-text group-hover:text-accent transition-colors duration-300 line-clamp-2">
                                                        {article.title}
                                                    </h3>

                                                    <p className="text-text-muted text-sm mb-3 line-clamp-2">
                                                        {article.excerpt || ''}
                                                    </p>

                                                    {/* Read More with arrow micro-animation */}
                                                    <div className="flex items-center text-xs text-accent font-medium">
                                                        <span>Read More</span>
                                                        <svg className="vlt-read-more-arrow w-3 h-3 ml-1" fill="none" viewBox="0 0 16 8" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M15.3536 4.35355c.1952-.19526.1952-.51184 0-.7071L12.1716.464466c-.1953-.195262-.5119-.195262-.7071 0-.1953.195262-.1953.511845 0 .707104L14.2929 4l-2.8284 2.82843c-.1953.19526-.1953.51184 0 .7071.1952.19527.5118.19527.7071 0l3.182-3.18198zM0 4.5h15v-1H0v1z" fill="currentColor" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </GilberCard>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-text-muted py-12">
                                            No news to display
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
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -ml-[55px] flex flex-col items-center gap-2 text-accent hover:text-text transition-colors group z-10"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        aria-label="Previous news"
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
                                        aria-label="More news"
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

                                {/* Page Indicator */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSlideDirection(i > currentPage ? 'left' : 'right');
                                                setCurrentPage(i);
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-accent w-6' : 'bg-border hover:bg-text-muted'}`}
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
    );
}
