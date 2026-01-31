"use client";

import { motion } from 'framer-motion';
import { heroStagger, heroItem } from '@/lib/motion';
import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/actions';

export default function Hero() {
    const [heroImageUrl, setHeroImageUrl] = useState('/placeholders/hero-bg.jpg');

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getSettings();
            if (settings?.hero_image_url) {
                setHeroImageUrl(settings.hero_image_url);
            }
        };
        loadSettings();
    }, []);

    return (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImageUrl})` }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-bg/40" />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 text-center px-6 max-w-5xl mx-auto"
                variants={heroStagger}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={heroItem} className="mb-8">
                    <span className="inline-flex items-center text-sm font-medium text-text-muted mb-4">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse" />
                        Welcome to Durrat Construction
                    </span>
                </motion.div>

                <motion.h1
                    variants={heroItem}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
                >
                    Excellence in
                    <br />
                    <span className="text-accent">Oil & Gas Construction</span>
                </motion.h1>

                <motion.p
                    variants={heroItem}
                    className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12"
                >
                    Building world-class energy infrastructure with precision engineering,
                    proven expertise, and unwavering commitment to safety and quality.
                </motion.p>

                <motion.div variants={heroItem} className="flex gap-4 justify-center flex-wrap">
                    <a
                        href="#projects"
                        className="px-8 py-4 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200"
                    >
                        View Projects
                    </a>
                    <a
                        href="#contact"
                        className="px-8 py-4 border border-border text-text rounded-lg font-medium hover:border-accent hover:text-accent transition-colors duration-200"
                    >
                        Get in Touch
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-text-muted">Scroll</span>
                    <div className="w-px h-12 bg-border relative overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 w-full h-6 bg-accent"
                            animate={{ y: [0, 24, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
