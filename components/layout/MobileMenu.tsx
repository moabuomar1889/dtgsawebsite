"use client";

import { navItems } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInRight } from '@/lib/motion';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeId: string;
    onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function MobileMenu({ isOpen, onClose, activeId, onNavClick }: MobileMenuProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        onNavClick(e, href);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Menu Panel */}
                    <motion.div
                        className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-card-bg border-l border-border z-[70] overflow-y-auto"
                        variants={slideInRight}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">Durrat Construction</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-text hover:text-accent transition-colors"
                                aria-label="Close menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="p-6">
                            <ul className="space-y-2">
                                {navItems.map((item, index) => {
                                    const isActive = activeId === item.href.replace('#', '');
                                    return (
                                        <motion.li
                                            key={item.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <a
                                                href={item.href}
                                                onClick={(e) => handleClick(e, item.href)}
                                                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'text-text-muted hover:text-text hover:bg-border/30'
                                                    }`}
                                            >
                                                {item.label}
                                            </a>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
