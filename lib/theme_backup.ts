import { Variants } from 'framer-motion';

// Timing constants
export const TIMING = {
    scrollReveal: 0.7,
    hover: 0.15,
    nav: 0.3,
    stagger: 0.06,
} as const;

// Easing functions
export const EASE = {
    out: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
} as const;

// Scroll reveal animation (700ms easeOut, opacity 0→1, translateY 12→0)
export const scrollReveal: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: TIMING.scrollReveal,
            ease: EASE.out,
        },
    },
};

// Stagger container for lists/grids
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: TIMING.stagger,
        },
    },
};

// Stagger item (child of staggerContainer)
export const staggerItem: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: TIMING.scrollReveal,
            ease: EASE.out,
        },
    },
};

// Hero staggered entrance
export const heroStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: TIMING.stagger,
            delayChildren: 0.2,
        },
    },
};

export const heroItem: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: EASE.out,
        },
    },
};

// Hover lift effect (150-200ms)
export const hoverLift = {
    rest: {
        y: 0,
        scale: 1,
    },
    hover: {
        y: -4,
        scale: 1.02,
        transition: {
            duration: TIMING.hover,
            ease: EASE.out,
        },
    },
};

// Fade in animation
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: EASE.out,
        },
    },
};

// Slide in from right (for mobile menu)
export const slideInRight: Variants = {
    hidden: {
        x: '100%',
    },
    visible: {
        x: 0,
        transition: {
            duration: TIMING.nav,
            ease: EASE.out,
        },
    },
    exit: {
        x: '100%',
        transition: {
            duration: TIMING.nav,
            ease: EASE.inOut,
        },
    },
};
