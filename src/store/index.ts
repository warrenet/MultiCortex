import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../services/UniversalStorageAdapter';

interface ProjectData {
    content: string;
    metadata?: Record<string, unknown>;
}

interface Project {
    id: string;
    name: string;
    data: ProjectData;
    createdAt: number;
}

interface AppState {
    hasCompletedOnboarding: boolean;
    apiKey: string | null;
    projects: Project[];
    _hasHydrated: boolean;

    setHydrated: (state: boolean) => void;
    setApiKey: (key: string) => void;
    completeOnboarding: () => void;
    addProject: (project: Project) => void;
    resetStore: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            hasCompletedOnboarding: false,
            apiKey: null,
            projects: [],
            _hasHydrated: false,

            setHydrated: (state) => set({ _hasHydrated: state }),
            setApiKey: (key) => set({ apiKey: key }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
            resetStore: () => set({
                hasCompletedOnboarding: false,
                apiKey: null,
                projects: [],
            }),
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
