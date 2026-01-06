import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useStore } from '../../src/store';
import { TipService } from '../../src/services/TipService';
import { storage } from '../../src/services/UniversalStorageAdapter';
import { toast } from 'sonner-native';
import {
    Key, Download, Upload, Trash2, BookOpen, ChevronRight,
    Shield, Database, HelpCircle, Activity
} from 'lucide-react-native';
import { PageHeader, SectionTitle, FloatingHelpButton, ActivityHeatmap } from '../../src/components/ui';

interface SettingsItemProps {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    danger?: boolean;
    badge?: string;
}

/**
 * Reusable settings row component
 */
function SettingsItem({ icon: Icon, title, subtitle, onPress, danger = false, badge }: SettingsItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-4 bg-zinc-900/50 border-b border-zinc-800/50 active:bg-zinc-800"
        >
            <View className={`p-2.5 rounded-xl ${danger ? 'bg-red-900/20' : 'bg-zinc-800'}`}>
                <Icon size={20} color={danger ? '#ef4444' : '#71717a'} />
            </View>
            <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2">
                    <Text className={`font-bold ${danger ? 'text-red-400' : 'text-zinc-100'}`}>
                        {title}
                    </Text>
                    {badge && (
                        <View className="bg-cyan-600/20 px-2 py-0.5 rounded-full">
                            <Text className="text-cyan-400 text-xs font-bold">{badge}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-zinc-500 text-xs mt-1">{subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#52525b" />
        </TouchableOpacity>
    );
}

export default function SettingsTab() {
    const { apiKey, setApiKey, projects, exportData, importProjects, resetStore } = useStore();
    const [showApiInput, setShowApiInput] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');

    const handleSaveApiKey = useCallback(() => {
        if (newApiKey.length < 10) {
            toast.error('Invalid API key format');
            return;
        }
        setApiKey(newApiKey);
        setShowApiInput(false);
        setNewApiKey('');
        toast.success('🔑 API key saved securely');
    }, [newApiKey, setApiKey]);

    const handleExport = useCallback(async () => {
        const data = exportData();
        const jsonString = JSON.stringify(data, null, 2);

        if (Platform.OS === 'web') {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `multicortex-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`📦 Exported ${data.projects.length} projects`);
        } else {
            toast.info('Export copied to clipboard (native sharing coming soon)');
        }
    }, [exportData]);

    const handleImport = useCallback(() => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    if (data.projects && Array.isArray(data.projects)) {
                        const validProjects = data.projects.filter((p: any) =>
                            p && typeof p.id === 'string' &&
                            typeof p.name === 'string' &&
                            typeof p.createdAt === 'number' &&
                            p.data && typeof p.data.content === 'string'
                        );

                        if (validProjects.length !== data.projects.length) {
                            toast.warning(`Skipped ${data.projects.length - validProjects.length} invalid entries`);
                        }

                        importProjects(validProjects);
                        toast.success(`📥 Imported ${validProjects.length} projects`);
                    } else {
                        toast.error('Invalid backup file format');
                    }
                } catch {
                    toast.error('Failed to parse backup file');
                }
            };
            input.click();
        } else {
            toast.info('Import from file coming soon on native');
        }
    }, [importProjects]);

    const handleReset = useCallback(() => {
        const doReset = () => {
            storage.clear();
            resetStore();
            toast.success('🔄 All data cleared');
            if (Platform.OS === 'web') {
                setTimeout(() => window.location.reload(), 1000);
            }
        };

        if (Platform.OS === 'web') {
            if (confirm('Delete ALL data? This cannot be undone. Export a backup first!')) {
                doReset();
            }
        } else {
            Alert.alert(
                'Reset Everything',
                'Delete ALL data? This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: doReset }
                ]
            );
        }
    }, [resetStore]);

    const handleShowGuide = useCallback(() => {
        TipService.showOnboardingTour(toast, () => {
            toast.success('🎓 You\'re ready to go!');
        });
    }, []);

    return (
        <View className="flex-1 bg-zinc-950">
            {/* Header */}
            <PageHeader
                title="Settings"
                subtitle="Configure your experience"
            />

            <ScrollView className="flex-1">
                {/* Insights Section (NEW) */}
                <View className="px-4 pt-6 pb-2">
                    <SectionTitle title="Neural Activity" icon={Activity} />
                </View>
                <View className="px-4">
                    <ActivityHeatmap />
                </View>

                {/* Security Section */}
                <View className="px-4 pt-6 pb-2">
                    <SectionTitle title="Security" icon={Shield} />
                </View>
                <View className="bg-zinc-900 border-y border-zinc-800 overflow-hidden rounded-xl mx-4 mb-2">
                    <TouchableOpacity
                        onPress={() => setShowApiInput(!showApiInput)}
                        className="flex-row items-center p-4"
                    >
                        <View className="p-2.5 rounded-xl bg-cyan-900/20">
                            <Key size={20} color="#22d3ee" />
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="font-bold text-zinc-100">API Key</Text>
                            <Text className="text-zinc-500 text-xs mt-1">
                                {apiKey ? '••••••••' + apiKey.slice(-4) : 'Not configured'}
                            </Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${apiKey ? 'bg-emerald-900/20' : 'bg-amber-900/20'}`}>
                            <Text className={`text-xs font-bold ${apiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {apiKey ? 'Active' : 'Required'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {showApiInput && (
                        <View className="px-4 pb-4 border-t border-zinc-800">
                            <Text className="text-zinc-500 text-xs mt-4 mb-2">
                                Get a free key at openrouter.ai
                            </Text>
                            <TextInput
                                className="bg-zinc-950 border border-zinc-700 text-zinc-100 p-4 rounded-xl font-mono mb-3"
                                placeholder="sk-or-v1-..."
                                placeholderTextColor="#52525b"
                                value={newApiKey}
                                onChangeText={setNewApiKey}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                onPress={handleSaveApiKey}
                                className="bg-cyan-600 py-3.5 rounded-xl items-center active:bg-cyan-700"
                            >
                                <Text className="text-white font-bold">Save Key</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Data Section */}
                <View className="px-4 pt-6 pb-2">
                    <SectionTitle title="Data Management" icon={Database} />
                </View>
                <View className="bg-zinc-900 border-y border-zinc-800 overflow-hidden rounded-xl mx-4 mb-2">
                    <SettingsItem
                        icon={Download}
                        title="Export Data"
                        subtitle={`Backup ${projects.length} projects`}
                        badge={projects.length > 0 ? `${projects.length}` : undefined}
                        onPress={handleExport}
                    />
                    <SettingsItem
                        icon={Upload}
                        title="Import Data"
                        subtitle="Restore from backup file"
                        onPress={handleImport}
                    />
                </View>

                {/* Help Section */}
                <View className="px-4 pt-6 pb-2">
                    <SectionTitle title="Help & Support" icon={HelpCircle} />
                </View>
                <View className="bg-zinc-900 border-y border-zinc-800 overflow-hidden rounded-xl mx-4 mb-2">
                    <SettingsItem
                        icon={BookOpen}
                        title="Feature Guide"
                        subtitle="Learn what each feature does"
                        onPress={handleShowGuide}
                    />
                    <SettingsItem
                        icon={HelpCircle}
                        title="Quick Tips"
                        subtitle="Get a random helpful tip"
                        onPress={() => {
                            const tip = TipService.getRandomTip();
                            toast.info(`${tip.title}\n${tip.message}`, { duration: 6000 });
                        }}
                    />
                </View>

                {/* Danger Zone */}
                <View className="px-4 pt-6 pb-2">
                    <SectionTitle title="Danger Zone" />
                </View>
                <View className="bg-zinc-900 border-y border-zinc-800 overflow-hidden rounded-xl mx-4 mb-6">
                    <SettingsItem
                        icon={Trash2}
                        title="Reset Everything"
                        subtitle="Delete all data and start fresh"
                        onPress={handleReset}
                        danger
                    />
                </View>

                {/* Footer */}
                <View className="p-8 items-center">
                    <Text className="text-zinc-600 text-sm font-bold">MultiCortex v1.0</Text>
                    <Text className="text-zinc-700 text-xs mt-1">Tactical Second Brain</Text>
                </View>
            </ScrollView>

            {/* Floating Help */}
            <FloatingHelpButton />
        </View>
    );
}
