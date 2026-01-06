import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../services/UniversalStorageAdapter';

interface Project {
    id: string;
    name: string;
    data: any;
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
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            hasCompletedOnboarding: false,
            apiKey: null,
            projects: [],
            // FORCED TRUE: Skip hydration wait to ensure app loads immediately
            _hasHydrated: true,

            setHydrated: (state) => set({ _hasHydrated: state }),
            setApiKey: (key) => set({ apiKey: key }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
        }),
        {
            name: 'multicortex-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);
