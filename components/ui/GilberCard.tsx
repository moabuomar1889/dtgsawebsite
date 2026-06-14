"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';

interface GilberCardProps {
    children: ReactNode;
    className?: string;
    as?: 'div' | 'article';
    index?: number;
    style?: CSSProperties;
}

/**
 * GilberCard - Card wrapper with 4-span border animation
 * Border draws from TOP-RIGHT counter-clockwise on hover
 */
export default function GilberCard({
    children,
    className = '',
    as: Component = 'div',
    index = 0,
    style
}: GilberCardProps) {
    const cardRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Scroll reveal for card fade-in
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            const frame = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            setIsVisible(true);
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        observer.observe(card);

        return () => observer.disconnect();
    }, [index]);

    const content = (
        <>
            {/* 4-span Border: TOP -> RIGHT -> BOTTOM -> LEFT (clockwise) */}
            <div className="vlt-post-border">
                <span className="top"></span>
                <span className="right"></span>
                <span className="bottom"></span>
                <span className="left"></span>
            </div>

            {/* Card Content */}
            <div className="vlt-card-content">
                {children}
            </div>
        </>
    );

    if (Component === 'article') {
        return (
            <article
                ref={cardRef as RefObject<HTMLElement>}
                className={`vlt-card ${isVisible ? 'vlt-card--visible' : ''} ${className}`}
                style={style}
            >
                {content}
            </article>
        );
    }

    return (
        <div
            ref={cardRef as RefObject<HTMLDivElement>}
            className={`vlt-card ${isVisible ? 'vlt-card--visible' : ''} ${className}`}
            style={style}
        >
            {content}
        </div>
    );
}
