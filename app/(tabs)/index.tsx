import React from 'react';
import { useStore } from '../../src/store';
import FirstRunWizard from '../../src/components/FirstRunWizard';
import TacticalHUD from '../../src/components/TacticalHUD';
import { View, Text, ActivityIndicator } from 'react-native';

export default function HomeTab() {
  const { hasCompletedOnboarding, _hasHydrated } = useStore();

  if (!_hasHydrated) {
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
