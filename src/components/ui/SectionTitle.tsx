import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HelpCircle, LucideIcon } from 'lucide-react-native';

interface SectionTitleProps {
    title: string;
    icon?: LucideIcon;
    count?: number;
    onHelpPress?: () => void;
    rightAction?: React.ReactNode;
}

/**
 * Section title with optional icon, count badge, and help button
 */
export function SectionTitle({
    title,
    icon: Icon,
    count,
    onHelpPress,
    rightAction
}: SectionTitleProps) {
    return (
        <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
                {Icon && <Icon size={14} color="#71717a" />}
                <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    {title}
                </Text>
                {count !== undefined && (
                    <View className="bg-zinc-800 px-2 py-0.5 rounded-full">
                        <Text className="text-zinc-400 text-xs">{count}</Text>
                    </View>
                )}
            </View>
            <View className="flex-row items-center gap-2">
                {rightAction}
                {onHelpPress && (
                    <TouchableOpacity onPress={onHelpPress}>
                        <HelpCircle size={14} color="#52525b" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
