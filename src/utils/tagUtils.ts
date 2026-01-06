/**
 * Utility for extracting tags from text
 * Tags are hashtags like #idea, #todo, #project-alpha
 */

export const TagUtils = {
    /**
     * EXTRACTS unique tags from text
     * - Case insensitive (stored as lowercase)
     * - Alphanumeric + hyphens/underscores
     * - Removes the '#' prefix
     */
    extractTags: (text: string): string[] => {
        if (!text) return [];

        // Regex: # followed by alphanumeric/underscore/hyphen
        const matches = text.match(/#[a-zA-Z0-9-_]+/g);

        if (!matches) return [];

        // Lowercase, remove #, deduplicate
        const uniqueTags = new Set(
            matches.map(tag => tag.slice(1).toLowerCase())
        );

        return Array.from(uniqueTags);
    }
};
