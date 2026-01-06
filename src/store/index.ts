import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../services/UniversalStorageAdapter';
import { TagUtils } from '../utils/tagUtils';

// ============================================
// Types
// ============================================

export interface ProjectData {
    content: string;
    source?: 'capture' | 'chat' | 'import';
    metadata?: Record<string, unknown>;
}

export interface Project {
    id: string;
    name: string;
    data: ProjectData;
    tags: string[];
    createdAt: number;
    deletedAt?: number; // NEW: Soft delete timestamp
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

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
    trashProject: (id: string) => void; // Renamed from deleteProject
    restoreProject: (id: string) => void; // NEW
    permanentlyDeleteProject: (id: string) => void; // NEW
    emptyTrash: () => void; // NEW
    updateProject: (id: string, data: Partial<ProjectData>) => void;
    importProjects: (projects: Project[]) => void;

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
            addProject: (projectData) => set((state) => {
                const tags = projectData.tags && projectData.tags.length > 0
                    ? projectData.tags
                    : TagUtils.extractTags(projectData.data.content);

                const project: Project = {
                    ...projectData,
                    tags
                };

                return {
                    projects: [...state.projects, project]
                };
            }),

            // Soft delete
            trashProject: (id) => set((state) => ({
                projects: state.projects.map(p =>
                    p.id === id ? { ...p, deletedAt: Date.now() } : p
                )
            })),

            // Restore from trash
            restoreProject: (id) => set((state) => ({
                projects: state.projects.map(p =>
                    p.id === id ? { ...p, deletedAt: undefined } : p
                )
            })),

            // Hard delete
            permanentlyDeleteProject: (id) => set((state) => ({
                projects: state.projects.filter(p => p.id !== id)
            })),

            // Empty trash
            emptyTrash: () => set((state) => ({
                projects: state.projects.filter(p => !p.deletedAt)
            })),

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

            importProjects: (projects) => set((state) => {
                const processedProjects = projects.map(p => ({
                    ...p,
                    tags: p.tags || TagUtils.extractTags(p.data.content)
                }));
                return {
                    projects: [...state.projects, ...processedProjects]
                };
            }),

            // Chat Actions
            addChatMessage: (message) => set((state) => ({
                chatHistory: [...state.chatHistory, message]
            })),

            setChatHistory: (messages) => set({ chatHistory: messages }),

            clearChatHistory: () => set({ chatHistory: [] }),

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
                    createdAt: Date.now()
                };
                set((state) => ({
                    projects: [...state.projects, project]
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
