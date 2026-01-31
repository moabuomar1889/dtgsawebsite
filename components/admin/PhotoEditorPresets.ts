/**
 * Photo Editor Presets - 30 Instagram-like Presets
 * Organized by category: Vivid, Warm, Cool, B&W, Cinematic, Matte
 */

import { ImageAdjustments } from '@/lib/imageProcessing';

export interface Preset {
    id: string;
    name: string;
    category: PresetCategory;
    adjustments: Partial<ImageAdjustments>;
    thumbnail?: string; // Optional preview color
}

export type PresetCategory = 'Vivid' | 'Warm' | 'Cool' | 'B&W' | 'Cinematic' | 'Matte';

export const PRESET_CATEGORIES: PresetCategory[] = [
    'Vivid',
    'Warm',
    'Cool',
    'B&W',
    'Cinematic',
    'Matte'
];

export const PRESETS: Preset[] = [
    // ========== VIVID (5) ==========
    {
        id: 'vivid-punch',
        name: 'Punch',
        category: 'Vivid',
        adjustments: {
            contrast: 25,
            saturation: 30,
            vibrance: 20,
            clarity: 15,
        }
    },
    {
        id: 'vivid-pop',
        name: 'Pop',
        category: 'Vivid',
        adjustments: {
            brightness: 5,
            contrast: 20,
            saturation: 40,
            vibrance: 25,
            highlights: 10,
        }
    },
    {
        id: 'vivid-vibrant',
        name: 'Vibrant',
        category: 'Vivid',
        adjustments: {
            saturation: 50,
            vibrance: 35,
            contrast: 15,
            clarity: 10,
        }
    },
    {
        id: 'vivid-saturate',
        name: 'Saturate',
        category: 'Vivid',
        adjustments: {
            saturation: 60,
            vibrance: 20,
            contrast: 10,
        }
    },
    {
        id: 'vivid-bold',
        name: 'Bold',
        category: 'Vivid',
        adjustments: {
            contrast: 35,
            saturation: 25,
            shadows: -15,
            highlights: 15,
            clarity: 20,
        }
    },

    // ========== WARM (5) ==========
    {
        id: 'warm-golden',
        name: 'Golden',
        category: 'Warm',
        adjustments: {
            temperature: 40,
            tint: 10,
            saturation: 15,
            highlights: 10,
            shadows: 5,
        }
    },
    {
        id: 'warm-sunset',
        name: 'Sunset',
        category: 'Warm',
        adjustments: {
            temperature: 55,
            tint: 20,
            saturation: 20,
            contrast: 10,
            redChannel: 15,
        }
    },
    {
        id: 'warm-amber',
        name: 'Amber',
        category: 'Warm',
        adjustments: {
            temperature: 45,
            tint: 5,
            saturation: 10,
            contrast: 5,
            redChannel: 10,
        }
    },
    {
        id: 'warm-toast',
        name: 'Toast',
        category: 'Warm',
        adjustments: {
            temperature: 30,
            contrast: 15,
            saturation: -10,
            shadows: 10,
            redChannel: 8,
        }
    },
    {
        id: 'warm-honey',
        name: 'Honey',
        category: 'Warm',
        adjustments: {
            temperature: 35,
            tint: 15,
            saturation: 25,
            brightness: 5,
            vibrance: 15,
        }
    },

    // ========== COOL (5) ==========
    {
        id: 'cool-arctic',
        name: 'Arctic',
        category: 'Cool',
        adjustments: {
            temperature: -40,
            tint: -10,
            saturation: 10,
            contrast: 15,
            blueChannel: 15,
        }
    },
    {
        id: 'cool-ocean',
        name: 'Ocean',
        category: 'Cool',
        adjustments: {
            temperature: -35,
            tint: 5,
            saturation: 20,
            vibrance: 15,
            blueChannel: 20,
            greenChannel: 5,
        }
    },
    {
        id: 'cool-frost',
        name: 'Frost',
        category: 'Cool',
        adjustments: {
            temperature: -50,
            brightness: 10,
            contrast: 10,
            saturation: -15,
            blueChannel: 25,
        }
    },
    {
        id: 'cool-ice',
        name: 'Ice',
        category: 'Cool',
        adjustments: {
            temperature: -45,
            contrast: 20,
            highlights: 20,
            saturation: -20,
            blueChannel: 20,
        }
    },
    {
        id: 'cool-steel',
        name: 'Steel',
        category: 'Cool',
        adjustments: {
            temperature: -25,
            saturation: -30,
            contrast: 25,
            clarity: 15,
            blueChannel: 10,
        }
    },

    // ========== B&W (5) ==========
    {
        id: 'bw-classic',
        name: 'Classic',
        category: 'B&W',
        adjustments: {
            saturation: -100,
            contrast: 15,
            brightness: 5,
        }
    },
    {
        id: 'bw-high-contrast',
        name: 'High Contrast',
        category: 'B&W',
        adjustments: {
            saturation: -100,
            contrast: 50,
            shadows: -20,
            highlights: 20,
        }
    },
    {
        id: 'bw-film-noir',
        name: 'Film Noir',
        category: 'B&W',
        adjustments: {
            saturation: -100,
            contrast: 40,
            shadows: -30,
            highlights: 10,
            clarity: 20,
        }
    },
    {
        id: 'bw-silvertone',
        name: 'Silvertone',
        category: 'B&W',
        adjustments: {
            saturation: -100,
            contrast: 10,
            brightness: 10,
            highlights: 15,
            shadows: 15,
        }
    },
    {
        id: 'bw-dramatic',
        name: 'Dramatic',
        category: 'B&W',
        adjustments: {
            saturation: -100,
            contrast: 60,
            clarity: 30,
            shadows: -25,
            highlights: 25,
        }
    },

    // ========== CINEMATIC (5) ==========
    {
        id: 'cine-teal-orange',
        name: 'Teal & Orange',
        category: 'Cinematic',
        adjustments: {
            temperature: 20,
            tint: -15,
            saturation: 15,
            contrast: 20,
            shadows: -10,
            blueChannel: 15,
            redChannel: 10,
        }
    },
    {
        id: 'cine-blockbuster',
        name: 'Blockbuster',
        category: 'Cinematic',
        adjustments: {
            contrast: 30,
            saturation: -10,
            temperature: 10,
            shadows: -20,
            highlights: -10,
            clarity: 15,
        }
    },
    {
        id: 'cine-vintage-film',
        name: 'Vintage Film',
        category: 'Cinematic',
        adjustments: {
            temperature: 15,
            saturation: -20,
            contrast: 20,
            redChannel: 10,
            greenChannel: -5,
            blueChannel: -10,
            shadows: 15,
        }
    },
    {
        id: 'cine-desaturated',
        name: 'Desaturated',
        category: 'Cinematic',
        adjustments: {
            saturation: -40,
            contrast: 25,
            clarity: 10,
            temperature: 5,
        }
    },
    {
        id: 'cine-moody',
        name: 'Moody',
        category: 'Cinematic',
        adjustments: {
            contrast: 20,
            saturation: -15,
            shadows: -25,
            highlights: -15,
            temperature: -10,
            clarity: 15,
            blueChannel: 10,
        }
    },

    // ========== MATTE (5) ==========
    {
        id: 'matte-faded',
        name: 'Faded',
        category: 'Matte',
        adjustments: {
            contrast: -15,
            shadows: 30,
            highlights: -10,
            saturation: -15,
        }
    },
    {
        id: 'matte-haze',
        name: 'Haze',
        category: 'Matte',
        adjustments: {
            contrast: -20,
            brightness: 10,
            shadows: 40,
            saturation: -20,
            clarity: -10,
        }
    },
    {
        id: 'matte-soft',
        name: 'Soft',
        category: 'Matte',
        adjustments: {
            contrast: -10,
            shadows: 25,
            highlights: -5,
            saturation: -10,
            clarity: -15,
        }
    },
    {
        id: 'matte-dusty',
        name: 'Dusty',
        category: 'Matte',
        adjustments: {
            contrast: -15,
            shadows: 35,
            saturation: -25,
            temperature: 10,
            redChannel: 5,
        }
    },
    {
        id: 'matte-cream',
        name: 'Cream',
        category: 'Matte',
        adjustments: {
            contrast: -10,
            shadows: 30,
            temperature: 20,
            saturation: -15,
            highlights: 5,
            brightness: 5,
        }
    },
];

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: PresetCategory): Preset[] {
    return PRESETS.filter(p => p.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): Preset | undefined {
    return PRESETS.find(p => p.id === id);
}

/**
 * Get all categories with their presets
 */
export function getPresetsGroupedByCategory(): Record<PresetCategory, Preset[]> {
    return PRESET_CATEGORIES.reduce((acc, category) => {
        acc[category] = getPresetsByCategory(category);
        return acc;
    }, {} as Record<PresetCategory, Preset[]>);
}
