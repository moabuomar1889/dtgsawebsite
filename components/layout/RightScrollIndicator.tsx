"use client";

import { useScrollProgress } from '@/hooks/useScrollProgress';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';

export default function RightScrollIndicator() {
    const scrollProgress = useScrollProgress();

    return (
        <motion.aside
            className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center h-[600px]"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
        >
            {/* Track - 3x longer */}
            <div className="relative w-[2px] h-full bg-border">
                {/* Progress marker - 3x longer and thicker */}
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-[3px] h-36 bg-accent rounded-full"
                    style={{
                        top: `calc(${scrollProgress}% - 72px)`,
                    }}
                    transition={{
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                />
            </div>

            {/* Scroll percentage indicator */}
            <div className="mt-4 text-xs text-text-muted font-mono">
                {Math.round(scrollProgress)}%
            </div>
        </motion.aside>
    );
}
