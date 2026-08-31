"use client";

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { submitContactMessage } from '@/lib/actions';

export interface ContactDetails {
    email: string;
    phone: string;
    address: string;
}

interface ContactProps {
    contactDetails: ContactDetails;
}

export default function Contact({ contactDetails }: ContactProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ success: boolean; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage(null);

        const result = await submitContactMessage(formData);
        if (result.success) {
            setFormData({ name: '', email: '', message: '' });
            setSubmitMessage({ success: true, text: 'Your message has been sent.' });
        } else {
            setSubmitMessage({ success: false, text: result.error ?? 'Unable to send your message.' });
        }
        setSubmitting(false);
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
                            Building the energy infrastructure of tomorrow
                        </motion.h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm text-text-muted mb-2">Email</div>
                                    <a href={`mailto:${contactDetails.email}`} className="text-xl text-text hover:text-accent transition-colors duration-200">
                                        {contactDetails.email}
                                    </a>
                                </div>

                                <div>
                                    <div className="text-sm text-text-muted mb-2">Phone</div>
                                    <a href={`tel:${contactDetails.phone}`} className="text-xl text-text hover:text-accent transition-colors duration-200">
                                        {contactDetails.phone}
                                    </a>
                                </div>

                                <div>
                                    <div className="text-sm text-text-muted mb-2">Location</div>
                                    <div className="text-xl text-text">{contactDetails.address}</div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <div className="text-sm text-text-muted">Follow Us</div>
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
                                disabled={submitting}
                                className="w-full px-8 py-4 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? 'Sending...' : 'Send Message'}
                            </button>
                            {submitMessage && (
                                <p
                                    className={submitMessage.success ? 'text-sm text-green-400' : 'text-sm text-red-400'}
                                    role={submitMessage.success ? 'status' : 'alert'}
                                >
                                    {submitMessage.text}
                                </p>
                            )}
                        </motion.form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
