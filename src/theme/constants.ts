/**
 * Theme constants for MultiCortex
 * Centralized color palette and design tokens
 */

export const COLORS = {
    // Background shades
    bg: {
        primary: '#09090b',   // zinc-950
        secondary: '#18181b', // zinc-900
        tertiary: '#27272a',  // zinc-800
    },

    // Text colors
    text: {
        primary: '#f4f4f5',   // zinc-100
        secondary: '#a1a1aa', // zinc-400
        muted: '#71717a',     // zinc-500
        faint: '#52525b',     // zinc-600
    },

    // Accent colors
    accent: {
        primary: '#22d3ee',   // cyan-400
        secondary: '#fbbf24', // amber-400
        success: '#22c55e',   // green-500
        danger: '#ef4444',    // red-500
        warning: '#f59e0b',   // amber-500
    },

    // Border colors
    border: {
        default: '#27272a',   // zinc-800
        subtle: '#3f3f46',    // zinc-700
    },

    // Status colors
    status: {
        online: '#22c55e',
        offline: '#71717a',
        loading: '#22d3ee',
    }
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
} as const;

export const FONT_SIZES = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 28,
} as const;

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
} as const;
