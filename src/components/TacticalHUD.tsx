import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useStore } from '../store';
import { Sparkles, Upload, Send, FileText, Zap, Box, Tag } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { CatalystService } from '../services/CatalystService';
import { SecurityService } from '../services/SecurityService';
import { TipService } from '../services/TipService';
import { TagUtils } from '../utils/tagUtils';
import { PageHeader, SectionTitle, EmptyState, ActionCard, FloatingHelpButton } from './ui';

export default function TacticalHUD() {
    const { projects, addProject, hasSeenTour, completeTour } = useStore();
    const [inputValue, setInputValue] = useState('');

    // Show onboarding tour on first visit
    useEffect(() => {
        if (!hasSeenTour && projects.filter(p => !p.deletedAt).length === 0) {
            toast.info('👋 Welcome to MultiCortex! Tap the ? button for a quick tour.', { duration: 6000 });
        }
    }, [hasSeenTour, projects]);

    // Memoized recent projects (exclude deleted)
    const recentProjects = useMemo(() =>
        projects
            .filter(p => !p.deletedAt)
            .slice(-3)
            .reverse(),
        [projects]
    );

    // Live tag detection
    const detectedTags = useMemo(() =>
        TagUtils.extractTags(inputValue),
        [inputValue]
    );

    const handleIngest = useCallback(() => {
        if (!inputValue.trim()) {
            toast.warning('Enter some text first');
            return;
        }

        const sanitized = SecurityService.sanitizeInput(inputValue);
        const wasRedacted = sanitized !== inputValue;

        addProject({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: `Capture ${new Date().toLocaleTimeString()}`,
            data: { content: sanitized },
            createdAt: Date.now()
        });

        setInputValue('');

        if (wasRedacted) {
            toast.success('📥 Data captured! (sensitive data was redacted for security)');
        } else {
            toast.success('📥 Data captured successfully!');
        }
    }, [inputValue, addProject]);

    const handleCrystallize = useCallback(() => {
        const activeProjects = projects.filter(p => !p.deletedAt);
        if (activeProjects.length === 0) {
            toast.info('💡 Capture some data first, then crystallize it into prompts!');
            return;
        }

        const contents = activeProjects.map(p => p.data?.content || '').filter(Boolean);
        const prompt = CatalystService.crystallizeIdea(contents);

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(prompt);
            toast.success('✨ Prompt crystallized & copied to clipboard!');
        } else {
            toast.info('Prompt generated! (clipboard not available)');
        }
    }, [projects]);

    const handleShowTour = useCallback(() => {
        completeTour();
        TipService.showOnboardingTour(toast);
    }, [completeTour]);

    const handleShowCaptureTip = useCallback(() => {
        const tip = TipService.getRandomTip('capture');
        toast.info(`${tip.title}\n${tip.message}`, { duration: 5000 });
    }, []);

    return (
        <View className="flex-1 bg-zinc-950">
            {/* Header */}
            <PageHeader
                title="MultiCortex"
                subtitle="Tactical Second Brain"
                rightAction={
                    <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Text className="text-emerald-400 text-xs font-bold">● ONLINE</Text>
                    </View>
                }
                onHelpPress={handleShowTour}
            />

            <ScrollView className="flex-1 p-4">
                {/* Getting Started Banner */}
                {projects.filter(p => !p.deletedAt).length === 0 && (
                    <TouchableOpacity
                        onPress={handleShowTour}
                        className="bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 border border-cyan-800/40 p-5 rounded-2xl mb-6"
                        style={{
                            shadowColor: '#22d3ee',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                        }}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-cyan-500/20 p-3 rounded-xl">
                                <Zap size={24} color="#22d3ee" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-cyan-300 font-bold text-base">Getting Started</Text>
                                <Text className="text-cyan-500/70 text-sm mt-1">
                                    Take a quick tour to learn the basics
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Capture Section */}
                <View className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 mb-6">
                    <SectionTitle
                        title="Quick Capture"
                        icon={Upload}
                        onHelpPress={handleShowCaptureTip}
                    />

                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 p-4 rounded-xl text-base"
                            placeholder="Capture thoughts, ideas #tags..."
                            placeholderTextColor="#52525b"
                            value={inputValue}
                            onChangeText={setInputValue}
                            multiline
                        />
                        <TouchableOpacity
                            className="bg-cyan-600 w-14 justify-center items-center rounded-xl active:bg-cyan-700"
                            onPress={handleIngest}
                        >
                            <Upload size={22} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Live Tags Display */}
                    {detectedTags.length > 0 && (
                        <View className="flex-row flex-wrap mt-3">
                            {detectedTags.map(tag => (
                                <View key={tag} className="flex-row items-center bg-cyan-900/40 px-2 py-1 rounded-md mr-2 mb-1 border border-cyan-500/20">
                                    <Tag size={10} color="#22d3ee" />
                                    <Text className="text-cyan-400 text-xs ml-1 font-bold">{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text className="text-zinc-600 text-xs mt-3">
                        💡 Use #hashtags to automatically tag your captures
                    </Text>
                </View>

                {/* Quick Actions */}
                <SectionTitle title="Quick Actions" icon={Sparkles} />
                <View className="flex-row gap-4 mb-6">
                    <ActionCard
                        icon={Sparkles}
                        iconColor="#fbbf24"
                        title="Crystallize"
                        description="Generate AI prompts from your captured data"
                        onPress={handleCrystallize}
                    />
                    <ActionCard
                        icon={Send}
                        iconColor="#22d3ee"
                        title="Chat"
                        description="Discuss your ideas with AI"
                        onPress={() => toast.info('💬 Switch to Chat tab to talk to AI!')}
                    />
                </View>

                {/* Recent Captures */}
                <SectionTitle
                    title="Recent Captures"
                    icon={Box}
                    count={recentProjects.length}
                    rightAction={
                        recentProjects.length > 0 && (
                            <TouchableOpacity onPress={() => toast.info('📂 View all in Projects tab')}>
                                <Text className="text-cyan-500 text-xs font-medium">View All →</Text>
                            </TouchableOpacity>
                        )
                    }
                />

                {recentProjects.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No captures yet"
                        description="Start by entering some text above. Your ideas, notes, and data will appear here."
                        actionLabel="Take the Tour"
                        onAction={handleShowTour}
                    />
                ) : (
                    recentProjects.map(p => (
                        <View
                            key={p.id}
                            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3"
                        >
                            <View className="flex-row items-center mb-2">
                                <View className="bg-zinc-800 p-2 rounded-lg">
                                    <FileText size={18} color="#71717a" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-zinc-100 font-bold">{p.name}</Text>
                                </View>
                            </View>

                            <Text className="text-zinc-500 text-sm mb-2" numberOfLines={2}>
                                {p.data?.content}
                            </Text>

                            {/* Tags display */}
                            {p.tags && p.tags.length > 0 && (
                                <View className="flex-row flex-wrap">
                                    {p.tags.map(tag => (
                                        <View key={tag} className="bg-zinc-800/50 px-2 py-0.5 rounded mr-2 mt-1">
                                            <Text className="text-zinc-500 text-[10px]">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Floating Help Button */}
            <FloatingHelpButton />
        </View>
    );
}
