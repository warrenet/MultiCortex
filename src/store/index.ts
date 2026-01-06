import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../services/UniversalStorageAdapter';
import { TagUtils } from '../utils/tagUtils';
import { z } from 'zod'; // 1. Safety: Zod
import * as Haptics from 'expo-haptics'; // 7. Haptics
import { Platform } from 'react-native';

// ============================================
// Schemas (Safety & Stability)
// ============================================

export const ProjectDataSchema = z.object({
    content: z.string(),
    source: z.enum(['capture', 'chat', 'import']).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    data: ProjectDataSchema,
    tags: z.array(z.string()),
    createdAt: z.number(),
    deletedAt: z.number().optional(),
    isPinned: z.boolean().optional(), // 3. Features: Pinning
});

export const ChatMessageSchema = z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.number(),
});

// Infer types from Zod schemas
export type ProjectData = z.infer<typeof ProjectDataSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ============================================
// State Interface
// ============================================

interface AppState {
    // Onboarding
    hasCompletedOnboarding: boolean;
    hasSeenTour: boolean;

    // API
    apiKey: string | null;

    // Projects
    projects: Project[];

    // Chat History
    chatHistory: ChatMessage[];

    // Hydration
    _hasHydrated: boolean;

    // Actions
    setHydrated: (state: boolean) => void;
    setApiKey: (key: string) => void;
    completeOnboarding: () => void;
    completeTour: () => void;

    // Project Actions
    addProject: (project: Omit<Project, 'tags'> & { tags?: string[] }) => void;
    trashProject: (id: string) => void;
    restoreProject: (id: string) => void;
    permanentlyDeleteProject: (id: string) => void;
    emptyTrash: () => void;
    updateProject: (id: string, data: Partial<ProjectData>) => void;
    togglePinProject: (id: string) => void; // NEW: Pinning Action
    importProjects: (projects: unknown[]) => boolean; // Updated to return success/fail

    // Chat Actions
    addChatMessage: (message: ChatMessage) => void;
    setChatHistory: (messages: ChatMessage[]) => void;
    clearChatHistory: () => void;
    saveChatAsProject: (content: string, name?: string) => void;

    // Utility Actions
    resetStore: () => void;
    exportData: () => { projects: Project[]; chatHistory: ChatMessage[]; exportedAt: number };
    getUniqueTags: () => string[];
}

// ============================================
// Haptic Helper
// ============================================
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (Platform.OS === 'web') return;

    switch (type) {
        case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
        case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
        case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
    }
};

// ============================================
// Store
// ============================================

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial State
            hasCompletedOnboarding: false,
            hasSeenTour: false,
            apiKey: null,
            projects: [],
            chatHistory: [],
            _hasHydrated: false,

            // Setters
            setHydrated: (state) => set({ _hasHydrated: state }),
            setApiKey: (key) => set({ apiKey: key }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            completeTour: () => set({ hasSeenTour: true }),

            // Project Actions
            addProject: (projectData) => {
                triggerHaptic('success');
                set((state) => {
                    const tags = projectData.tags && projectData.tags.length > 0
                        ? projectData.tags
                        : TagUtils.extractTags(projectData.data.content);

                    const project: Project = {
                        ...projectData,
                        tags,
                        isPinned: false
                    };
                    return { projects: [project, ...state.projects] }; // Add to top
                });
            },

            trashProject: (id) => {
                triggerHaptic('medium');
                set((state) => ({
                    projects: state.projects.map(p =>
                        p.id === id ? { ...p, deletedAt: Date.now(), isPinned: false } : p
                    )
                }));
            },

            restoreProject: (id) => {
                triggerHaptic('light');
                set((state) => ({
                    projects: state.projects.map(p =>
                        p.id === id ? { ...p, deletedAt: undefined } : p
                    )
                }));
            },

            permanentlyDeleteProject: (id) => {
                triggerHaptic('heavy');
                set((state) => ({
                    projects: state.projects.filter(p => p.id !== id)
                }));
            },

            emptyTrash: () => {
                triggerHaptic('heavy');
                set((state) => ({
                    projects: state.projects.filter(p => !p.deletedAt)
                }));
            },

            updateProject: (id, data) => set((state) => ({
                projects: state.projects.map(p => {
                    if (p.id === id) {
                        const newContent = data.content || p.data.content;
                        const tags = data.content
                            ? TagUtils.extractTags(newContent)
                            : p.tags;
                        return {
                            ...p,
                            data: { ...p.data, ...data },
                            tags
                        };
                    }
                    return p;
                })
            })),

            togglePinProject: (id) => {
                triggerHaptic('light');
                set((state) => ({
                    projects: state.projects.map(p =>
                        p.id === id ? { ...p, isPinned: !p.isPinned } : p
                    )
                }));
            },

            importProjects: (projects) => {
                try {
                    // Safe Parse with Zod
                    const validProjects = z.array(ProjectSchema).parse(projects);

                    // Re-calculate tags if needed
                    const processedProjects = validProjects.map(p => ({
                        ...p,
                        tags: p.tags || TagUtils.extractTags(p.data.content)
                    }));

                    set((state) => ({
                        projects: [...state.projects, ...processedProjects]
                    }));
                    triggerHaptic('success');
                    return true;
                } catch (e) {
                    console.error("Import failed invalid schema", e);
                    triggerHaptic('error');
                    return false;
                }
            },

            // Chat Actions
            addChatMessage: (message) => set((state) => ({
                chatHistory: [...state.chatHistory, message]
            })),

            setChatHistory: (messages) => set({ chatHistory: messages }),

            clearChatHistory: () => {
                triggerHaptic('medium');
                set({ chatHistory: [] });
            },

            saveChatAsProject: (content, name) => {
                const tags = TagUtils.extractTags(content);
                const project: Project = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    name: name || `AI Response ${new Date().toLocaleTimeString()}`,
                    data: {
                        content,
                        source: 'chat'
                    },
                    tags,
                    createdAt: Date.now(),
                    isPinned: false
                };
                triggerHaptic('success');
                set((state) => ({
                    projects: [project, ...state.projects]
                }));
            },

            // Utility Actions
            resetStore: () => set({
                hasCompletedOnboarding: false,
                hasSeenTour: false,
                apiKey: null,
                projects: [],
                chatHistory: [],
            }),

            exportData: () => ({
                projects: get().projects,
                chatHistory: get().chatHistory,
                exportedAt: Date.now()
            }),

            getUniqueTags: () => {
                const allTags = new Set<string>();
                get().projects.forEach(p => {
                    if (!p.deletedAt && p.tags) p.tags.forEach(t => allTags.add(t));
                });
                return Array.from(allTags).sort();
            }
        }),
        {
            name: 'multicortex-storage',
            storage: createJSONStorage(() => storage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);
