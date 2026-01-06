import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HelpCircle } from 'lucide-react-native';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    onHelpPress?: () => void;
}

/**
 * Consistent page header component used across all tabs
 */
export function PageHeader({ title, subtitle, rightAction, onHelpPress }: PageHeaderProps) {
    return (
        <View className="bg-zinc-900 border-b border-zinc-800 p-4 pt-12 flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="text-zinc-100 font-bold text-lg tracking-wider uppercase">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-zinc-500 text-xs mt-0.5">{subtitle}</Text>
                )}
            </View>
            <View className="flex-row items-center gap-3">
                {rightAction}
                {onHelpPress && (
                    <TouchableOpacity
                        onPress={onHelpPress}
                        className="p-2 rounded-full active:bg-zinc-800"
                        accessibilityLabel="Help"
                        accessibilityRole="button"
                    >
                        <HelpCircle size={20} color="#71717a" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
