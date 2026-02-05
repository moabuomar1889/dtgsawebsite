"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import Image from 'next/image';

interface Service {
    id: string;
    title: string;
    description?: string;
    icon_url?: string | null;
    icon_key?: string;
    sort_order: number;
}

export default function Services() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await fetch('/api/services');
                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                }
            } catch (error) {
                console.error('Error loading services:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadServices();
    }, []);

    const shouldAnimate = isInView && !isLoading;

    return (
        <section id="services" ref={ref} className="relative py-32 px-6 lg:px-20 bg-bg">
            <div className="max-w-7xl mx-auto w-full">
                <motion.div
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                        What We Do
                    </motion.span>

                    <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-16 max-w-3xl">
                        Our <span className="accent-dot">Services</span>
                    </motion.h2>

                    {/* Services List - Slide in from left */}
                    <div className="space-y-6">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-6 py-6 border-b border-border/30">
                                    <div className="w-16 h-16 bg-border/20 rounded-lg animate-pulse" />
                                    <div className="h-8 w-64 bg-border/20 rounded animate-pulse" />
                                </div>
                            ))
                        ) : services.length > 0 ? (
                            services.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, x: -100 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    className="group flex items-center gap-6 md:gap-8 py-6 border-b border-border/30 hover:border-accent/50 transition-colors cursor-pointer"
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative">
                                        {service.icon_url ? (
                                            <Image
                                                src={service.icon_url}
                                                alt={service.title}
                                                fill
                                                className="object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-lg bg-border/10 flex items-center justify-center">
                                                <span className="text-2xl text-text-muted">•</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl md:text-4xl font-bold text-text uppercase tracking-wide group-hover:text-accent transition-colors duration-300">
                                        {service.title}
                                    </h3>

                                    {/* Arrow - appears on hover */}
                                    <motion.div
                                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={{ x: -10 }}
                                        whileHover={{ x: 0 }}
                                    >
                                        <svg
                                            className="w-8 h-8 text-accent"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </motion.div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-text-muted py-12">
                                No services to display
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
