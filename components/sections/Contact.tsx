"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { contactInfo, socialLinks } from '@/lib/data';

export default function Contact() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form submission will be implemented with Supabase in future step
        alert('Form submission will be connected to backend in next step!');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <section id="contact" ref={ref} className="h-screen flex items-center py-32 px-6 lg:px-20 bg-bg">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    <div className="text-center mb-16">
                        <motion.span variants={staggerItem} className="text-sm font-medium text-accent mb-4 block">
                            Get in Touch
                        </motion.span>

                        <motion.h2 variants={staggerItem} className="text-4xl md:text-5xl font-bold mb-6">
                            {contactInfo.tagline}
                        </motion.h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm text-text-muted mb-2">Email</div>
                                    <a href={`mailto:${contactInfo.email}`} className="text-xl text-text hover:text-accent transition-colors duration-200">
                                        {contactInfo.email}
                                    </a>
                                </div>

                                <div>
                                    <div className="text-sm text-text-muted mb-2">Phone</div>
                                    <a href={`tel:${contactInfo.phone}`} className="text-xl text-text hover:text-accent transition-colors duration-200">
                                        {contactInfo.phone}
                                    </a>
                                </div>

                                <div>
                                    <div className="text-sm text-text-muted mb-2">Location</div>
                                    <div className="text-xl text-text">{contactInfo.address}</div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-12">
                                <div className="text-sm text-text-muted mb-4">Follow Us</div>
                                <div className="flex gap-4">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.platform}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors duration-200"
                                            aria-label={social.platform}
                                        >
                                            <span className="text-sm font-medium">{social.platform[0]}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.form variants={staggerItem} onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-colors duration-200 text-text"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-colors duration-200 text-text"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-colors duration-200 text-text resize-none"
                                    placeholder="Tell us about your project..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-4 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200"
                            >
                                Send Message
                            </button>
                        </motion.form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
