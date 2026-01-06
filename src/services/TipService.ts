/**
 * Contextual tips and guides for MultiCortex features
 */

export interface Tip {
    id: string;
    title: string;
    message: string;
    feature: 'capture' | 'chat' | 'projects' | 'export' | 'general';
}

export const TIPS: Tip[] = [
    // Capture tips
    {
        id: 'capture-1',
        title: '📥 Quick Capture',
        message: 'Type anything and tap the upload button to save it instantly. Ideas, notes, links - capture now, organize later.',
        feature: 'capture'
    },
    {
        id: 'capture-2',
        title: '🔒 Security First',
        message: 'MultiCortex automatically detects and redacts API keys or tokens you might accidentally paste.',
        feature: 'capture'
    },

    // Chat tips
    {
        id: 'chat-1',
        title: '💬 Ask Your Data',
        message: 'Chat with AI about your captured notes. Ask "What are the main themes?" or "Summarize my recent ideas".',
        feature: 'chat'
    },
    {
        id: 'chat-2',
        title: '✨ Crystallize Ideas',
        message: 'Use the Crystallize button to transform scattered notes into refined, actionable prompts.',
        feature: 'chat'
    },

    // Projects tips
    {
        id: 'projects-1',
        title: '📂 Your Data Library',
        message: 'All your captures are stored locally. Tap any project to view details or edit content.',
        feature: 'projects'
    },
    {
        id: 'projects-2',
        title: '🗑️ Clean Up',
        message: 'Swipe left on a project to delete it. Don\'t worry - you can export backups first!',
        feature: 'projects'
    },

    // Export tips
    {
        id: 'export-1',
        title: '💾 Own Your Data',
        message: 'Export your entire knowledge base as JSON. Import it anywhere - you\'re never locked in.',
        feature: 'export'
    },

    // General tips
    {
        id: 'general-1',
        title: '🚀 Getting Started',
        message: 'Start by capturing a few ideas, then head to Chat to discuss them with AI.',
        feature: 'general'
    }
];

export const TipService = {
    /**
     * Get a random tip for a feature
     */
    getRandomTip(feature?: Tip['feature']): Tip {
        const filtered = feature
            ? TIPS.filter(t => t.feature === feature)
            : TIPS;
        return filtered[Math.floor(Math.random() * filtered.length)];
    },

    /**
     * Get all tips for a feature
     */
    getTipsForFeature(feature: Tip['feature']): Tip[] {
        return TIPS.filter(t => t.feature === feature);
    },

    /**
     * Get onboarding tips in order
     */
    getOnboardingTips(): Tip[] {
        return [
            TIPS.find(t => t.id === 'general-1')!,
            TIPS.find(t => t.id === 'capture-1')!,
            TIPS.find(t => t.id === 'chat-1')!,
            TIPS.find(t => t.id === 'projects-1')!,
            TIPS.find(t => t.id === 'export-1')!,
        ];
    },

    /**
     * Show the full onboarding tour with sequential toasts
     */
    showOnboardingTour(toast: any, onComplete?: () => void): void {
        const tips = this.getOnboardingTips();
        let index = 0;

        const showNextTip = () => {
            if (index < tips.length) {
                toast.info(`${tips[index].title}\n${tips[index].message}`, {
                    duration: 4000
                });
                index++;
                setTimeout(showNextTip, 4500);
            } else {
                toast.success('🎓 Tour complete! Explore the tabs below.');
                onComplete?.();
            }
        };

        showNextTip();
    }
};
