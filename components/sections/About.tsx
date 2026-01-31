"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { scrollReveal, staggerContainer, staggerItem } from '@/lib/motion';
import { getYearsOfExperience } from '@/lib/data';
import { getSettings } from '@/lib/actions';

export default function About() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getSettings();
            if (settings?.about_image_url) {
                setAboutImageUrl(settings.about_image_url);
            }
        };
        loadSettings();
    }, []);

    return (
        <section id="about" ref={ref} className="h-screen flex items-center py-32 px-6 lg:px-20 bg-bg">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="grid lg:grid-cols-2 gap-16 items-center"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    {/* Text Content */}
                    <div>
                        <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                            About Us
                        </motion.span>

                        <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-6">
                            Where engineering meets <span className="accent-dot">excellence</span>
                        </motion.h2>

                        <motion.div variants={staggerItem} className="space-y-4">
                            <p className="text-text-muted leading-relaxed">
                                Durrat Construction is a leading contractor specializing in oil and gas construction
                                projects. Our expertise spans offshore platforms, pipelines, processing facilities,
                                and refinery installations across the Middle East and beyond.
                            </p>

                            <p className="text-text-muted leading-relaxed">
                                With over a decade of proven experience in the energy sector, we deliver complex
                                EPC projects with unwavering commitment to safety, quality, and schedule compliance.
                                Our team of skilled engineers and craftsmen brings technical excellence to every
                                phase of construction.
                            </p>

                            <p className="text-text-muted leading-relaxed">
                                From subsea pipelines to onshore facilities, we build the critical infrastructure
                                that powers the world—always with precision, integrity, and a focus on sustainable
                                engineering solutions.
                            </p>
                        </motion.div>

                        <motion.div variants={staggerItem} className="mt-8 grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-3xl font-bold text-accent mb-2">85+</div>
                                <div className="text-sm text-text-muted">Projects</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-accent mb-2">40+</div>
                                <div className="text-sm text-text-muted">Clients</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-accent mb-2">{getYearsOfExperience()}+</div>
                                <div className="text-sm text-text-muted">Years</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image */}
                    <motion.div
                        variants={scrollReveal}
                        className="relative h-[500px] rounded-lg overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${aboutImageUrl || '/placeholders/project-7.jpg'})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
