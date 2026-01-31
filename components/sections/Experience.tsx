"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { skills, getYearsOfExperience } from '@/lib/data';

// Animated skill bar component
function SkillBar({ name, percentage, delay }: { name: string; percentage: number; delay: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-muted uppercase tracking-wider">{name}</span>
                <span className="text-sm font-medium text-text-muted">{percentage}%</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay: delay, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
        </div>
    );
}

// Scroll-triggered 3-side border (TOP → LEFT → BOTTOM)
function ScrollBorderCard({ children }: { children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(card);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`exp-border-card p-12 inline-block relative ${isVisible ? 'is-visible' : ''}`}
        >
            {/* 3-sided border: TOP (R→L) → LEFT (T→B) → BOTTOM (L→R) */}
            <div className="exp-border">
                <span className="exp-top"></span>
                <span className="exp-left"></span>
                <span className="exp-bottom"></span>
            </div>
            {children}
        </div>
    );
}

export default function Experience() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="experience" ref={ref} className="h-screen flex items-center py-32 px-6 lg:px-20 bg-card-bg">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left - Years Counter with scroll-animated border */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 60 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <ScrollBorderCard>
                            {/* Large Number */}
                            <div className="relative mb-6">
                                <span className="text-[120px] md:text-[180px] font-bold leading-none text-text">
                                    {getYearsOfExperience()}
                                </span>
                                <span className="absolute bottom-4 right-0 w-4 h-4 bg-accent rounded-full"></span>
                            </div>

                            {/* Text below number */}
                            <div className="text-right">
                                <div className="w-12 h-px bg-border mb-4 ml-auto"></div>
                                <p className="text-lg font-medium text-text">Years</p>
                                <p className="text-lg font-medium text-text">Experience</p>
                                <p className="text-lg font-medium text-text">Working</p>
                            </div>
                        </ScrollBorderCard>
                    </motion.div>

                    {/* Right - Skills */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif italic">
                            Great Experience
                        </h2>

                        <p className="text-text-muted mb-12 leading-relaxed">
                            With over a decade of proven expertise in oil and gas construction,
                            we deliver world-class infrastructure projects with precision,
                            safety, and excellence at every phase.
                        </p>

                        {/* Skill Bars */}
                        <div>
                            {skills.map((skill, index) => (
                                <SkillBar
                                    key={skill.id}
                                    name={skill.name}
                                    percentage={skill.percentage}
                                    delay={0.3 + index * 0.15}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
