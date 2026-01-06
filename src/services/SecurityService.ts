export const SecurityService = {
    /**
     * Strips potential API keys and sensitive data from text inputs.
     * Currently targets patterns looking like OpenAI/Anthropic keys.
     */
    sanitizeInput: (input: string): string => {
        if (!input) return "";

        // Regex for standard sk- keys (OpenAI) and simple safeguards
        const sensitivePatterns = [
            /sk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,}/g, // OpenAI standard
            /sk-[a-zA-Z0-9]{32,}/g, // Generic sk- pattern
            /xox[baprs]-([0-9a-zA-Z]{10,48})/g, // Slack
        ];

        let sanitized = input;
        sensitivePatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
        });

        return sanitized;
    }
};
