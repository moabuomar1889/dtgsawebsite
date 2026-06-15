export const DEFAULT_ACCENT_COLOR = '#ffbb00';
export const ADMIN_ACCENT_COLOR = DEFAULT_ACCENT_COLOR;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeHexColor(value: string | null | undefined, fallback = DEFAULT_ACCENT_COLOR) {
    const color = value?.trim();
    if (!color || !HEX_COLOR_PATTERN.test(color)) {
        return fallback;
    }

    return color.toLowerCase();
}
