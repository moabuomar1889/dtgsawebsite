"use client";

import { useState, useEffect } from 'react';
import Services from '@/components/sections/Workforce';
import Projects from '@/components/sections/Projects';
import Clients from '@/components/sections/Clients';
import News from '@/components/sections/News';

const slides = [
    { id: 'services', name: 'Services' },
    { id: 'projects', name: 'Projects' },
    { id: 'clients', name: 'Clients' },
    { id: 'news', name: 'News' },
];

/**
 * HorizontalSlider - Gilber-style horizontal section slider
 * 
 * Contains: Services → Projects → Clients → News
 * Navigation via pagination dots (click only)
 * Slides horizontally with translateX animation
 */
export default function HorizontalSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Navigate to slide by index
    const goToSlide = (index: number) => {
        if (index >= 0 && index < slides.length) {
            setActiveIndex(index);
        }
    };

    return (
        <section className="hslider" id="slider-section">
            {/* Track - contains all slides, moves horizontally */}
            <div
                className="hslider-track"
                style={{
                    transform: `translateX(-${activeIndex * 100}vw)`,
                }}
            >
                {/* Slide 1: Services */}
                <article className="hslide" aria-hidden={activeIndex !== 0}>
                    <div className="h-full w-full overflow-y-auto">
                        <Services />
                    </div>
                </article>

                {/* Slide 2: Projects */}
                <article className="hslide" aria-hidden={activeIndex !== 1}>
                    <div className="h-full w-full overflow-y-auto">
                        <Projects />
                    </div>
                </article>

                {/* Slide 3: Clients */}
                <article className="hslide" aria-hidden={activeIndex !== 2}>
                    <div className="h-full w-full overflow-y-auto">
                        <Clients />
                    </div>
                </article>

                {/* Slide 4: News */}
                <article className="hslide" aria-hidden={activeIndex !== 3}>
                    <div className="h-full w-full overflow-y-auto">
                        <News />
                    </div>
                </article>
            </div>

            {/* Pagination Dots - Right side */}
            <div className="hslider-dots">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        data-index={index}
                        className={`hslider-dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={slide.name}
                        title={slide.name}
                    />
                ))}
            </div>

            {/* Slide Labels - Left side */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
                <div className="text-xs font-medium text-text-muted uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    {slides[activeIndex].name}
                </div>
            </div>
        </section>
    );
}
