import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Beautiful empty state component with optional CTA
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center py-16 px-8">
            {/* Icon with subtle glow effect */}
            <View className="relative mb-6">
                <View className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl scale-150" />
                <View className="bg-zinc-900 p-6 rounded-full border border-zinc-800">
                    <Icon size={40} color="#52525b" />
                </View>
            </View>

            {/* Title */}
            <Text className="text-zinc-300 font-bold text-lg text-center mb-2">
                {title}
            </Text>

            {/* Description */}
            <Text className="text-zinc-500 text-sm text-center max-w-xs leading-5">
                {description}
            </Text>

            {/* Optional CTA */}
            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="mt-6 bg-cyan-600 px-6 py-3 rounded-lg active:bg-cyan-700"
                >
                    <Text className="text-white font-bold">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
