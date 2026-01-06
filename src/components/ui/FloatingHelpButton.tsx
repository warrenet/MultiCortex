import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { HelpCircle, X, Lightbulb, MessageCircle, Upload, FolderOpen, Settings } from 'lucide-react-native';
import { TipService, Tip } from '../../services/TipService';

interface FloatingHelpButtonProps {
    /** Position from bottom of screen */
    bottom?: number;
}

/**
 * Floating action button for help/tips
 * Shows a modal with categorized tips when pressed
 */
export function FloatingHelpButton({ bottom = 100 }: FloatingHelpButtonProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Tip['feature'] | null>(null);

    const categories = [
        { id: 'capture' as const, label: 'Capture', icon: Upload, color: '#22d3ee' },
        { id: 'chat' as const, label: 'Chat', icon: MessageCircle, color: '#22d3ee' },
        { id: 'projects' as const, label: 'Projects', icon: FolderOpen, color: '#22d3ee' },
        { id: 'export' as const, label: 'Export', icon: Settings, color: '#22d3ee' },
    ];

    const tips = selectedCategory
        ? TipService.getTipsForFeature(selectedCategory)
        : TipService.getOnboardingTips();

    return (
        <>
            {/* Floating Button */}
            <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                className="absolute right-4 bg-cyan-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{
                    bottom,
                    shadowColor: '#22d3ee',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
                accessibilityLabel="Help and Tips"
                accessibilityRole="button"
            >
                <View className="relative">
                    <HelpCircle size={24} color="#ffffff" />
                    {/* Animated pulse indicator */}
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
                </View>
            </TouchableOpacity>

            {/* Tips Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-zinc-900 rounded-t-3xl max-h-[80%] border-t border-zinc-800">
                        {/* Header */}
                        <View className="flex-row justify-between items-center p-4 border-b border-zinc-800">
                            <View className="flex-row items-center gap-3">
                                <View className="bg-cyan-600/20 p-2 rounded-full">
                                    <Lightbulb size={20} color="#22d3ee" />
                                </View>
                                <Text className="text-zinc-100 font-bold text-lg">Help & Tips</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                className="p-2"
                            >
                                <X size={24} color="#71717a" />
                            </TouchableOpacity>
                        </View>

                        {/* Category Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="p-4 pb-0"
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === null
                                    ? 'bg-cyan-600'
                                    : 'bg-zinc-800'
                                    }`}
                            >
                                <Text className={selectedCategory === null ? 'text-white font-bold' : 'text-zinc-400'}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${selectedCategory === cat.id
                                        ? 'bg-cyan-600'
                                        : 'bg-zinc-800'
                                        }`}
                                >
                                    <cat.icon size={14} color={selectedCategory === cat.id ? '#fff' : '#71717a'} />
                                    <Text className={`ml-2 ${selectedCategory === cat.id
                                        ? 'text-white font-bold'
                                        : 'text-zinc-400'
                                        }`}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Tips List */}
                        <ScrollView className="p-4">
                            {tips.map((tip, index) => (
                                <View
                                    key={tip.id}
                                    className="bg-zinc-800 rounded-xl p-4 mb-3 border border-zinc-700"
                                >
                                    <Text className="text-zinc-100 font-bold mb-2">{tip.title}</Text>
                                    <Text className="text-zinc-400 text-sm leading-5">{tip.message}</Text>
                                </View>
                            ))}

                            {/* Bottom padding */}
                            <View className="h-8" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
