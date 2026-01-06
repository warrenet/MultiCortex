import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useStore } from '../store';
import { Sparkles, Upload, Send, FileText } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { CatalystService } from '../services/CatalystService';
import { SecurityService } from '../services/SecurityService';

export default function TacticalHUD() {
    const { projects, addProject } = useStore();
    const [quickInput, setQuickInput] = useState('');

    const handleIngest = () => {
        if (!quickInput.trim()) return;
        const sanitized = SecurityService.sanitizeInput(quickInput);
        addProject({
            id: Date.now().toString(),
            name: `Capture ${new Date().toLocaleTimeString()}`,
            data: { content: sanitized },
            createdAt: Date.now()
        });
        setQuickInput('');
        toast.success('Data Ingested Successfully');
    };

    const handleCrystallize = () => {
        // Logic to select projects would go here, for now just a demo
        CatalystService.crystallizeIdea(["Demo Context"]);
        // Copy to clipboard (mock)
        toast.success('Prompt Crystallized & Copied');
    };

    return (
        <View className="flex-1 bg-zinc-950">
            {/* Header */}
            <View className="bg-zinc-900 border-b border-zinc-800 p-4 pt-12 flex-row justify-between items-center">
                <Text className="text-zinc-100 font-bold text-lg tracking-wider">MULTICORTEX /// V1</Text>
                <View className="bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                    <Text className="text-emerald-500 text-xs font-bold">ONLINE</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Universal Ingestion Engine */}
                <View className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-6">
                    <Text className="text-zinc-400 text-xs font-bold mb-3 uppercase tracking-widest">Universal Ingestion</Text>
                    <View className="flex-row">
                        <TextInput
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded mr-3 font-mono"
                            placeholder="Input raw data stream..."
                            placeholderTextColor="#52525b"
                            value={quickInput}
                            onChangeText={setQuickInput}
                        />
                        <TouchableOpacity
                            className="bg-zinc-100 aspect-square justify-center items-center rounded"
                            onPress={handleIngest}
                        >
                            <Upload size={20} color="#09090b" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Action Grid */}
                <View className="flex-row gap-4 mb-6">
                    <TouchableOpacity
                        className="flex-1 bg-zinc-900 p-4 rounded-lg border border-zinc-800 active:bg-zinc-800"
                        onPress={handleCrystallize}
                    >
                        <Sparkles size={24} color="#e4e4e7" className="mb-2" />
                        <Text className="text-zinc-100 font-bold">Crystallize</Text>
                        <Text className="text-zinc-500 text-xs mt-1">Generate High-System Prompts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1 bg-zinc-900 p-4 rounded-lg border border-zinc-800 active:bg-zinc-800">
                        <Send size={24} color="#e4e4e7" className="mb-2" />
                        <Text className="text-zinc-100 font-bold">Commander</Text>
                        <Text className="text-zinc-500 text-xs mt-1">Uplink to Task System</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Projects */}
                <Text className="text-zinc-400 text-xs font-bold mb-3 uppercase tracking-widest">Recent Captures</Text>
                {projects.length === 0 ? (
                    <View className="p-8 items-center justify-center border border-zinc-800 border-dashed rounded-lg">
                        <Text className="text-zinc-600">No data streams active.</Text>
                    </View>
                ) : (
                    projects.map(p => (
                        <View key={p.id} className="bg-zinc-900 p-4 rounded border border-zinc-800 mb-2 flex-row items-center">
                            <FileText size={16} color="#71717a" className="mr-3" />
                            <View>
                                <Text className="text-zinc-200 font-bold">{p.name}</Text>
                                <Text className="text-zinc-500 text-xs">{new Date(p.createdAt).toLocaleString()}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
