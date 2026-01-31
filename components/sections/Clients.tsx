"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { getClients } from '@/lib/actions';
import type { Client } from '@/lib/supabase/types';
import GilberCard from '@/components/ui/GilberCard';

export default function Clients() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients(true);
                setClients(data);
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadClients();
    }, []);

    const shouldAnimate = isInView && !isLoading;

    return (
        <section id="clients" ref={ref} className="min-h-screen flex items-center py-32 px-6 lg:px-20 bg-bg">
            <div className="max-w-7xl mx-auto w-full">
                <motion.div
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    {/* Header */}
                    <motion.div variants={staggerItem} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="text-accent">Clients</span> Who Trust<span className="accent-dot"> Us</span>
                        </h2>

                        <p className="text-text-muted max-w-2xl mx-auto">
                            We've had the privilege of working with industry leaders who trust our expertise.
                        </p>
                    </motion.div>

                    {/* Client Grid - Fixed 230x125px cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="border border-border" style={{ width: '230px', height: '125px' }}>
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <div className="h-10 w-24 bg-border/20 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : clients.length > 0 ? (
                            clients.map((client, index) => (
                                <GilberCard
                                    key={client.id}
                                    index={index}
                                    className="group bg-bg border-gray"
                                    style={{ width: '230px', height: '125px' }}
                                >
                                    {/* Client Logo */}
                                    <div className="w-full h-full flex items-center justify-center p-3 overflow-hidden">
                                        {client.logo_url_bw ? (
                                            <img
                                                src={client.logo_url_bw}
                                                alt={client.name}
                                                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        ) : (
                                            <span className="text-text-muted text-xs text-center">{client.name}</span>
                                        )}
                                    </div>
                                </GilberCard>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-text-muted py-12">
                                No clients to display
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
