"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';

interface HSliderProps {
    children: ReactNode[];
    /** Labels for each slide (shown in dots tooltip) */
    labels?: string[];
}

/**
 * HSlider - Horizontal Section Slider (Gilber-style)
 * 
 * A full-viewport horizontal slider with pagination dots.
 * - Slides move via translateX (GPU-friendly)
 * - Click dots to navigate
 * - Smooth page-like easing
 * 
 * Usage:
 * <HSlider labels={['Services', 'Projects', 'Clients', 'News']}>
 *   <ServicesContent />
 *   <ProjectsContent />
 *   <ClientsContent />
 *   <NewsContent />
 * </HSlider>
 */
export default function HSlider({ children, labels = [] }: HSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const slideCount = children.length;

    // Disable body scroll when slider is active
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Navigate to slide by index
    const goToSlide = (index: number) => {
        if (index >= 0 && index < slideCount) {
            setActiveIndex(index);
        }
    };

    return (
        <section className="hslider">
            {/* Track - contains all slides, moves horizontally */}
            <div
                ref={trackRef}
                className="hslider-track"
                style={{
                    // Move track by -100vw * activeIndex
                    transform: `translateX(-${activeIndex * 100}vw)`,
                }}
            >
                {children.map((child, index) => (
                    <article
                        key={index}
                        className="hslide"
                        aria-hidden={index !== activeIndex}
                    >
                        {child}
                    </article>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="hslider-dots">
                {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                        key={index}
                        data-index={index}
                        className={`hslider-dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={labels[index] || `Slide ${index + 1}`}
                        title={labels[index] || `Slide ${index + 1}`}
                    >
                        <span className="sr-only">{labels[index] || `Slide ${index + 1}`}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
