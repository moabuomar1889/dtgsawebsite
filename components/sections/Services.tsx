"use client";

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import Image from 'next/image';
import {
    ArrowUpRight,
    Building,
    ClipboardList,
    Factory,
    PipetteIcon as Pipeline,
    Settings,
    ShieldCheck,
    Ship,
    Truck,
    Wrench,
    Zap,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/motion';

interface Service {
    id: string;
    title: string;
    description?: string;
    icon_url?: string | null;
    icon_key?: string;
    sort_order: number;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    offshore: Ship,
    pipeline: Pipeline,
    facility: Factory,
    management: ClipboardList,
    safety: ShieldCheck,
    commissioning: Zap,
    wrench: Wrench,
    building: Building,
    platform: Ship,
    settings: Settings,
    truck: Truck,
};

function ServiceIcon({ service }: { service: Service }) {
    const IconComponent = iconMap[service.icon_key || 'wrench'] || Factory;

    if (service.icon_url) {
        return (
            <Image
                src={service.icon_url}
                alt=""
                fill
                sizes="44px"
                className="object-contain filter brightness-0 invert opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            />
        );
    }

    return (
        <IconComponent className="h-5 w-5 text-text-muted transition-colors duration-300 group-hover:text-accent" />
    );
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
        <section id="services" ref={ref} className="relative flex min-h-screen items-center overflow-hidden bg-bg px-6 py-20 lg:px-20">
            <div className="absolute left-0 top-0 hidden h-full w-px bg-border/50 lg:block" />
            <div className="absolute right-0 top-0 hidden h-full w-px bg-border/30 lg:block" />

            <div className="mx-auto w-full max-w-7xl">
                <motion.div
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    <div className="mb-9 grid gap-6 lg:grid-cols-[0.9fr_1.4fr] lg:items-end">
                        <div>
                            <motion.span variants={staggerItem} className="mb-4 block text-sm font-medium text-accent">
                                What We Do
                            </motion.span>

                            <motion.h2 variants={staggerItem} className="max-w-xl text-4xl font-bold md:text-5xl">
                                Our <span className="accent-dot">Services</span>
                            </motion.h2>
                        </div>

                        <motion.div
                            variants={staggerItem}
                            className="grid gap-4 border-l border-border/60 pl-5 sm:grid-cols-[1fr_auto] sm:items-end"
                        >
                            <p className="max-w-2xl text-sm leading-7 text-text-muted md:text-base">
                                Integrated construction capabilities arranged for quick scanning, from fabrication to field execution and maintenance.
                            </p>
                            <div className="text-left sm:text-right">
                                <div className="text-3xl font-bold text-text">{String(services.length || 0).padStart(2, '0')}</div>
                                <div className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">Capabilities</div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="min-h-[150px] border border-border/50 bg-card-bg/50 p-4">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="h-11 w-11 animate-pulse rounded bg-border/20" />
                                        <div className="h-3 w-8 animate-pulse rounded bg-border/20" />
                                    </div>
                                    <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-border/20" />
                                    <div className="h-3 w-full animate-pulse rounded bg-border/20" />
                                </div>
                            ))
                        ) : services.length > 0 ? (
                            services.map((service, index) => (
                                <motion.article
                                    key={service.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        duration: 0.45,
                                        delay: index * 0.05,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="group relative flex min-h-[150px] flex-col overflow-hidden border border-border/60 bg-card-bg/45 p-4 transition-colors duration-300 hover:border-accent/70 hover:bg-card-bg md:min-h-[158px]"
                                >
                                    <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />

                                    <div className="mb-5 flex items-start justify-between gap-4">
                                        <div className="relative flex h-11 w-11 items-center justify-center border border-border/70 bg-bg/50">
                                            <ServiceIcon service={service} />
                                        </div>
                                        <span className="font-mono text-xs text-text-muted/70">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold uppercase leading-snug tracking-wide text-text transition-colors duration-300 group-hover:text-accent md:text-lg">
                                        {service.title}
                                    </h3>

                                    {service.description ? (
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                                            {service.description}
                                        </p>
                                    ) : null}

                                    <div className="mt-auto flex justify-end pt-4">
                                        <ArrowUpRight className="h-4 w-4 text-text-muted transition-colors duration-300 group-hover:text-accent" />
                                    </div>
                                </motion.article>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-text-muted">
                                No services to display
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
