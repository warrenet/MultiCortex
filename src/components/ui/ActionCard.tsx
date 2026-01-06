import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActionCardProps {
    icon: LucideIcon;
    iconColor: string;
    title: string;
    description: string;
    onPress: () => void;
    disabled?: boolean;
}

/**
 * Action card with icon, title, and description
 * Used for quick actions in the command tab
 */
export function ActionCard({
    icon: Icon,
    iconColor,
    title,
    description,
    onPress,
    disabled = false
}: ActionCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`flex-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 
                ${disabled ? 'opacity-50' : 'active:bg-zinc-800 active:border-zinc-700'}`}
            style={{
                // Subtle shadow for depth
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            {/* Icon with glow background */}
            <View className="relative w-10 h-10 mb-3">
                <View
                    className="absolute inset-0 rounded-lg opacity-20 blur-sm"
                    style={{ backgroundColor: iconColor }}
                />
                <View className="bg-zinc-800 rounded-lg w-10 h-10 items-center justify-center">
                    <Icon size={22} color={iconColor} />
                </View>
            </View>

            <Text className="text-zinc-100 font-bold text-base">{title}</Text>
            <Text className="text-zinc-500 text-xs mt-1 leading-4">{description}</Text>
        </TouchableOpacity>
    );
}
