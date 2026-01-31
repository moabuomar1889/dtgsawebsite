"use client";

import { navItems } from '@/lib/data';
import { motion } from 'framer-motion';
import { useState } from 'react';
import MobileMenu from './MobileMenu';

interface TopNavProps {
    activeSection?: string;
}

export default function TopNav({ activeSection = 'home' }: TopNavProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const sectionId = href.replace('#', '');

        // Use global fullpage navigation if available
        if (typeof window !== 'undefined' && (window as unknown as { goToFullpageSection?: (id: string) => void }).goToFullpageSection) {
            (window as unknown as { goToFullpageSection: (id: string) => void }).goToFullpageSection(sectionId);
        }

        // Close mobile menu if open
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Navigation - Gilber style */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 hidden lg:block"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="flex items-center justify-between py-6 px-8 bg-bg">
                    {/* Logo */}
                    <div className="flex flex-col leading-tight">
                        <div className="text-2xl font-bold text-accent tracking-wide">
                            DURRAT<span>.</span>
                        </div>
                        <div className="text-[11px] tracking-[0.2em] text-accent/80 font-medium">
                            CONSTRUCTION
                        </div>
                    </div>

                    {/* Nav Links - Uppercase, White, Spaced like Gilber */}
                    <ul className="flex items-center gap-10">
                        {navItems.map((item) => {
                            const sectionId = item.href.replace('#', '');
                            const isActive = activeSection === sectionId;
                            return (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        onClick={(e) => handleNavClick(e, item.href)}
                                        className={`relative text-[15px] font-medium uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-accent' : 'text-white hover:text-accent'
                                            }`}
                                    >
                                        {item.label.toUpperCase()}
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeNav"
                                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Phone Number - like Gilber */}
                    <div className="text-[13px] font-medium text-white tracking-wide">
                        +966 13 867 0967
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 lg:hidden"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="flex items-center justify-between p-4 bg-bg/90 backdrop-blur-sm">
                    <div className="flex flex-col leading-tight">
                        <div className="text-xl font-bold text-accent tracking-wide">
                            DURRAT<span>.</span>
                        </div>
                        <div className="text-[9px] tracking-[0.2em] text-accent/80 font-medium">
                            CONSTRUCTION
                        </div>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 text-white hover:text-accent transition-colors"
                        aria-label="Open menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                activeId={activeSection}
                onNavClick={handleNavClick}
            />
        </>
    );
}
