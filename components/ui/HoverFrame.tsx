"use client";

import { ReactNode } from 'react';

interface HoverFrameProps {
    children: ReactNode;
    className?: string;
    /** Custom frame color - defaults to rgba(255,255,255,0.65) */
    frameColor?: string;
    /** Custom frame thickness - defaults to 1px */
    frameWidth?: string;
}

/**
 * HoverFrame - Gilber-style animated border frame
 * 
 * Wraps any card to add a sequential border animation on hover.
 * The frame draws: TOP → RIGHT → BOTTOM → LEFT (clockwise)
 * 
 * Usage:
 * <HoverFrame>
 *   <YourCard />
 * </HoverFrame>
 * 
 * Customize via CSS variables:
 * --hf-color: frame color (default: rgba(255,255,255,0.65))
 * --hf-w: frame thickness (default: 1px)
 * --hf-d: duration per side (default: 140ms)
 */
export default function HoverFrame({
    children,
    className = "",
    frameColor,
    frameWidth
}: HoverFrameProps) {
    const style = {
        ...(frameColor && { '--hf-color': frameColor }),
        ...(frameWidth && { '--hf-w': frameWidth }),
    } as React.CSSProperties;

    return (
        <div
            className={`hf group relative ${className}`}
            style={Object.keys(style).length > 0 ? style : undefined}
        >
            {children}
            {/* Animated frame lines - pointer-events none so clicks pass through */}
            <div className="hf-frame pointer-events-none absolute inset-0 z-10">
                <span className="hf-line hf-top" />
                <span className="hf-line hf-right" />
                <span className="hf-line hf-bottom" />
                <span className="hf-line hf-left" />
            </div>
        </div>
    );
}
