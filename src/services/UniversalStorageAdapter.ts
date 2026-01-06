// Web implementation using localStorage for maximum compatibility
// With SSR/bundler guard for Node.js context

interface StorageAdapter {
    setItem(key: string, value: any): Promise<void>;
    getItem<T>(key: string): Promise<T | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
}

class UniversalStorageAdapter implements StorageAdapter {
    private get isClient(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    async setItem(key: string, value: any): Promise<void> {
        if (!this.isClient) return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('[Storage:Web] Failed to save', e);
            // Check for quota exceeded specifically
            if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
                throw new Error('Storage quota exceeded. Export your data and clear some projects.');
            }
            throw e;
        }
    }

    async getItem<T>(key: string): Promise<T | null> {
        if (!this.isClient) return null;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('[Storage:Web] Failed to load', e);
            return null;
        }
    }

    async removeItem(key: string): Promise<void> {
        if (!this.isClient) return;
        localStorage.removeItem(key);
    }

    async clear(): Promise<void> {
        if (!this.isClient) return;
        localStorage.clear();
    }
}

export const storage = new UniversalStorageAdapter();
