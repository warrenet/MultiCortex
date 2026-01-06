import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useStore } from '../../store';

export const ActivityHeatmap = () => {
    const projects = useStore(state => state.projects);

    const heatmapData = useMemo(() => {
        const today = new Date();
        const data = new Map<string, number>();

        // Initialize last 11 weeks (approx 3 months)
        // 11 cols * 7 rows = 77 days
        for (let i = 0; i < 77; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            data.set(key, 0); // Init with 0
        }

        // Fill with actual data
        projects.forEach(p => {
            if (!p.createdAt) return;
            const date = new Date(p.createdAt).toISOString().split('T')[0];
            if (data.has(date)) {
                data.set(date, (data.get(date) || 0) + 1);
            }
        });

        // Convert to array for rendering (reverse to show oldest -> newest left to right)
        return Array.from(data.entries()).reverse();
    }, [projects]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-zinc-800/50';
        if (count === 1) return 'bg-cyan-900/40';
        if (count === 2) return 'bg-cyan-700/60';
        if (count >= 3) return 'bg-cyan-500';
        return 'bg-zinc-800';
    };

    return (
        <View className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 mb-6">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-zinc-100 font-bold text-base">Brain Activity</Text>
                <Text className="text-zinc-500 text-xs">Last 3 Months</Text>
            </View>

            <View className="flex-row flex-wrap gap-1 justify-center">
                {heatmapData.map(([date, count], index) => (
                    <View
                        key={date}
                        className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                        accessibilityLabel={`Activity on ${date}: ${count} captures`}
                    />
                ))}
            </View>

            <View className="flex-row items-center justify-end mt-2 gap-1">
                <Text className="text-zinc-600 text-[10px] mr-1">Less</Text>
                <View className="w-2 h-2 rounded-sm bg-zinc-800/50" />
                <View className="w-2 h-2 rounded-sm bg-cyan-900/40" />
                <View className="w-2 h-2 rounded-sm bg-cyan-700/60" />
                <View className="w-2 h-2 rounded-sm bg-cyan-500" />
                <Text className="text-zinc-600 text-[10px] ml-1">More</Text>
            </View>
        </View>
    );
};
