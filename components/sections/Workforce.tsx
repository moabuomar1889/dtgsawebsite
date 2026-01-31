"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { Ship, PipetteIcon as Pipeline, Factory, ClipboardList, ShieldCheck, Zap, Wrench, Building, Settings, Truck } from 'lucide-react';
import GilberCard from '@/components/ui/GilberCard';

interface Service {
    id: string;
    title: string;
    description?: string;
    icon_key?: string;
}

// Extended icon map for various services
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'offshore': Ship,
    'pipeline': Pipeline,
    'facility': Factory,
    'management': ClipboardList,
    'safety': ShieldCheck,
    'commissioning': Zap,
    'wrench': Wrench,
    'building': Building,
    'platform': Ship,
    'settings': Settings,
    'truck': Truck,
};

export default function Workforce() {
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
        <section id="services" ref={ref} className="h-screen flex items-center py-32 px-6 lg:px-20 bg-bg">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                        Our Services
                    </motion.span>

                    <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-16 max-w-3xl">
                        Comprehensive <span className="accent-dot">construction solutions</span>
                    </motion.h2>

                    {/* Capabilities Grid - each card has hover border */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-8 rounded-lg bg-card-bg animate-pulse">
                                    <div className="w-12 h-12 rounded-lg bg-border/20 mb-4" />
                                    <div className="h-6 w-3/4 bg-border/20 rounded mb-3" />
                                    <div className="h-4 w-full bg-border/20 rounded" />
                                </div>
                            ))
                        ) : services.length > 0 ? (
                            services.map((service, index) => {
                                const IconComponent = iconMap[service.icon_key || 'wrench'] || Factory;
                                return (
                                    <GilberCard
                                        key={service.id}
                                        index={index}
                                        className="group p-8 rounded-lg bg-card-bg"
                                    >
                                        <div className="mb-4">
                                            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                                <IconComponent className="w-6 h-6 text-text-muted group-hover:text-accent transition-colors" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold mb-3 text-text">{service.title}</h3>
                                        <p className="text-text-muted leading-relaxed">{service.description || ''}</p>

                                        {/* Hover indicator */}
                                        <div className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </GilberCard>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center text-text-muted py-12">
                                No services to display
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
