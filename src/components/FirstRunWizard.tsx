import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { useStore } from '../store';
import { toast } from 'sonner-native';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { storage } from '../services/UniversalStorageAdapter';

// Web-compatible button style
const buttonStyle = Platform.OS === 'web' ? { cursor: 'pointer' as const } : {};

export default function FirstRunWizard() {
    const [step, setStep] = useState(1);
    const [keyInput, setKeyInput] = useState('');
    const { setApiKey, completeOnboarding } = useStore();

    const handleInitialize = () => {
        console.log('[FirstRunWizard] Initialize button pressed');
        setStep(2);
    };

    const handleSaveKey = () => {
        if (keyInput.length < 10) {
            toast.error('Invalid API Key format');
            return;
        }
        setApiKey(keyInput);
        toast.success('Secure channel established.');
        setStep(3);
    };

    const handleFinish = () => {
        completeOnboarding();
        toast.success('Protocol Initialized. Welcome to MultiCortex.');
    };

    const handleReset = async () => {
        await storage.clear();
        toast.info('System Reset. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
            <View className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-xl">
                {step === 1 && (
                    <View className="items-center">
                        <Text className="text-3xl font-bold text-zinc-100 mb-4 tracking-tighter">MULTICORTEX</Text>
                        <Text className="text-zinc-400 text-center mb-8 leading-6">
                            Tactical Second Brain Instrument.
                            {"\n"}Local-First. Secure. Zero Latency.
                        </Text>
                        <Pressable
                            role="button"
                            onPress={handleInitialize}
                            style={[buttonStyle, { backgroundColor: '#f4f4f5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 }]}
                        >
                            <Text style={{ color: '#09090b', fontWeight: 'bold' }}>INITIALIZE SYSTEM</Text>
                        </Pressable>

                        <Pressable
                            role="button"
                            onPress={handleReset}
                            style={[buttonStyle, { marginTop: 32, opacity: 0.3 }]}
                        >
                            <Text style={{ color: '#52525b', fontSize: 12 }}>EMERGENCY DATA WIPEOUT</Text>
                        </Pressable>
                    </View>
                )}

                {step === 2 && (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                            <ShieldCheck size={24} color="#e4e4e7" />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f4f4f5', marginLeft: 12 }}>Security Check</Text>
                        </View>
                        <Text style={{ color: '#a1a1aa', marginBottom: 16 }}>Enter your API Key to enable neural functions.</Text>
                        <TextInput
                            style={{ backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a', color: '#f4f4f5', padding: 16, borderRadius: 6, marginBottom: 24, fontFamily: 'monospace' }}
                            placeholder="sk-..."
                            placeholderTextColor="#52525b"
                            value={keyInput}
                            onChangeText={setKeyInput}
                            secureTextEntry
                        />
                        <Pressable
                            role="button"
                            onPress={handleSaveKey}
                            style={[buttonStyle, { backgroundColor: '#f4f4f5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6, alignItems: 'center' }]}
                        >
                            <Text style={{ color: '#09090b', fontWeight: 'bold' }}>ESTABLISH LINK</Text>
                        </Pressable>
                    </View>
                )}

                {step === 3 && (
                    <View style={{ alignItems: 'center' }}>
                        <ArrowRight size={48} color="#e4e4e7" style={{ marginBottom: 24 }} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f4f4f5', marginBottom: 16 }}>Systems Online</Text>
                        <Text style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: 32 }}>
                            Ingestion Engine: READY
                            {"\n"}Security Protocols: ACTIVE
                        </Text>
                        <Pressable
                            role="button"
                            onPress={handleFinish}
                            style={[buttonStyle, { backgroundColor: '#f4f4f5', width: '100%', paddingVertical: 16, borderRadius: 6, alignItems: 'center' }]}
                        >
                            <Text style={{ color: '#09090b', fontWeight: 'bold', letterSpacing: 2 }}>ENTER MULTICORTEX</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}
