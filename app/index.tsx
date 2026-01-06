import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useStore } from '../src/store';
import FirstRunWizard from '../src/components/FirstRunWizard';
import TacticalHUD from '../src/components/TacticalHUD';

const FALLBACK_TIMEOUT_MS = 3000;

export default function Index() {
    const { hasCompletedOnboarding, _hasHydrated, setHydrated } = useStore();
    const [forcedHydration, setForcedHydration] = useState(false);

    // Fallback: if hydration doesn't complete, force it
    useEffect(() => {
        if (_hasHydrated) return;

        const timer = setTimeout(() => {
            console.warn('[Index] Forcing hydration via fallback timer');
            setHydrated(true);
            setForcedHydration(true);
        }, FALLBACK_TIMEOUT_MS);

        return () => clearTimeout(timer);
    }, [_hasHydrated, setHydrated]);

    const isReady = _hasHydrated || forcedHydration;

    if (!isReady) {
        return (
            <View className="flex-1 bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-zinc-500 mt-4 text-xs font-mono">INITIALIZING MULTICORTEX...</Text>
            </View>
        );
    }

    if (!hasCompletedOnboarding) {
        return <FirstRunWizard />;
    }

    return <TacticalHUD />;
}
