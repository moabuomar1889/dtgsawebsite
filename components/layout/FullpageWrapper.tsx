"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
    id: string;
    name: string;
    component: React.ReactNode;
}

interface FullpageWrapperProps {
    sections: Section[];
    onSectionChange?: (sectionId: string, index: number) => void;
}

export default function FullpageWrapper({ sections, onSectionChange }: FullpageWrapperProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const lastScrollTime = useRef(0);

    const goToSection = useCallback((index: number) => {
        if (index < 0 || index >= sections.length || isAnimating) return;

        setIsAnimating(true);
        setCurrentIndex(index);

        if (onSectionChange) {
            onSectionChange(sections[index].id, index);
        }

        // Reset animation lock after transition
        setTimeout(() => {
            setIsAnimating(false);
        }, 800);
    }, [sections, isAnimating, onSectionChange]);

    // Handle wheel scroll
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const now = Date.now();
            if (now - lastScrollTime.current < 1000 || isAnimating) return;
            lastScrollTime.current = now;

            if (e.deltaY > 0) {
                goToSection(currentIndex + 1);
            } else {
                goToSection(currentIndex - 1);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [currentIndex, isAnimating, goToSection]);

    // Handle touch events
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isAnimating) return;

            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY.current - touchEndY;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSection(currentIndex + 1);
                } else {
                    goToSection(currentIndex - 1);
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        return () => {
            if (container) {
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [currentIndex, isAnimating, goToSection]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimating) return;

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                goToSection(currentIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                goToSection(currentIndex - 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSection(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSection(sections.length - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isAnimating, goToSection, sections.length]);

    // Expose navigation function globally for nav links
    useEffect(() => {
        (window as unknown as { goToFullpageSection: (id: string) => void }).goToFullpageSection = (id: string) => {
            const index = sections.findIndex(s => s.id === id);
            if (index !== -1) {
                goToSection(index);
            }
        };
    }, [sections, goToSection]);

    const progress = (currentIndex + 1) / sections.length;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden"
            style={{ touchAction: 'none' }}
        >
            {/* Sections */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                >
                    {sections[currentIndex].component}
                </motion.div>
            </AnimatePresence>

            {/* Progress Bar (right side like Gilber) */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 w-0.5 h-32 bg-border/30 z-50 hidden lg:block">
                <motion.div
                    className="absolute top-0 left-0 w-full bg-accent origin-top"
                    style={{ height: '100%' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: progress }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Section dots (optional, like Gilber's pagination) */}
            <div className="fixed right-8 bottom-8 z-50 hidden lg:flex flex-col gap-2">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => goToSection(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-accent scale-125'
                            : 'bg-border hover:bg-text-muted'
                            }`}
                        aria-label={`Go to ${section.name}`}
                    />
                ))}
            </div>
        </div>
    );
}
