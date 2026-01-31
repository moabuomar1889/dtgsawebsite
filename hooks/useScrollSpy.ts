"use client";

import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[], offset: number = 100) {
    const [activeId, setActiveId] = useState<string>('home');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + offset + 100;

            // Find the current section
            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const element = document.getElementById(sectionIds[i]);
                if (element) {
                    const top = element.offsetTop;
                    if (scrollPosition >= top) {
                        setActiveId(sectionIds[i]);
                        return;
                    }
                }
            }

            // Default to first section if at top
            if (window.scrollY < 100) {
                setActiveId(sectionIds[0] || 'home');
            }
        };

        // Run once on mount
        handleScroll();

        // Add scroll listener with throttling
        let ticking = false;
        const scrollListener = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollListener, { passive: true });

        return () => {
            window.removeEventListener('scroll', scrollListener);
        };
    }, [sectionIds, offset]);

    return activeId;
}
