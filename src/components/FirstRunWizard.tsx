import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { useStore } from '../store';
import { toast } from 'sonner-native';
import { ShieldCheck, Zap, CheckCircle } from 'lucide-react-native';
import { storage } from '../services/UniversalStorageAdapter';

// Web-compatible button style
const buttonStyle = Platform.OS === 'web' ? { cursor: 'pointer' as const } : {};

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
            <View
                key={i}
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: i + 1 <= currentStep ? '#22d3ee' : '#3f3f46'
                }}
            />
        ))}
    </View>
);

export default function FirstRunWizard() {
    const [step, setStep] = useState(1);
    const [keyInput, setKeyInput] = useState('');
    const { setApiKey, completeOnboarding, resetStore } = useStore();
    const totalSteps = 3;

    const handleInitialize = () => {
        toast.info('🚀 Initializing secure protocols...');
        setTimeout(() => {
            setStep(2);
            toast.success('Systems ready! Now let\'s set up your API key.');
        }, 500);
    };

    const handleSaveKey = () => {
        if (keyInput.length < 10) {
            toast.error('⚠️ API key looks too short. Check and try again.');
            return;
        }
        setApiKey(keyInput);
        toast.success('🔐 Secure channel established!');
        setStep(3);
    };

    const handleSkipKey = () => {
        toast.info('⏭️ Skipping for now. You can add your key later in Settings.');
        setStep(3);
    };

    const handleFinish = () => {
        completeOnboarding();
        toast.success('🎉 Welcome to MultiCortex! Let\'s capture some ideas.');
    };

    const handleReset = async () => {
        await storage.clear();
        toast.info('🔄 System Reset. Reloading...');

        if (Platform.OS === 'web') {
            setTimeout(() => window.location.reload(), 1000);
        } else {
            setTimeout(() => resetStore(), 1000);
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
            <View className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-xl">
                <StepIndicator currentStep={step} totalSteps={totalSteps} />

                {step === 1 && (
                    <View className="items-center">
                        <Zap size={48} color="#22d3ee" style={{ marginBottom: 16 }} />
                        <Text className="text-3xl font-bold text-zinc-100 mb-2 tracking-tighter">MULTICORTEX</Text>
                        <Text className="text-cyan-500 text-sm mb-6">Tactical Second Brain</Text>
                        <Text className="text-zinc-400 text-center mb-8 leading-6">
                            Capture ideas. Chat with AI.{"\n"}
                            Crystallize thoughts into action.{"\n\n"}
                            <Text className="text-zinc-500 text-xs">Local-first • Secure • Zero Latency</Text>
                        </Text>
                        <Pressable
                            role="button"
                            onPress={handleInitialize}
                            style={[buttonStyle, {
                                backgroundColor: '#22d3ee',
                                paddingHorizontal: 32,
                                paddingVertical: 14,
                                borderRadius: 8,
                                width: '100%',
                                alignItems: 'center'
                            }]}
                        >
                            <Text style={{ color: '#09090b', fontWeight: 'bold', fontSize: 16 }}>
                                GET STARTED
                            </Text>
                        </Pressable>

                        <Pressable
                            role="button"
                            onPress={handleReset}
                            style={[buttonStyle, { marginTop: 32, opacity: 0.3 }]}
                        >
                            <Text style={{ color: '#52525b', fontSize: 12 }}>Reset Data</Text>
                        </Pressable>
                    </View>
                )}

                {step === 2 && (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <ShieldCheck size={24} color="#22d3ee" />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f4f4f5', marginLeft: 12 }}>
                                API Connection
                            </Text>
                        </View>
                        <Text style={{ color: '#a1a1aa', marginBottom: 8, lineHeight: 22 }}>
                            Enter your OpenRouter API key to enable AI chat features.
                        </Text>
                        <Text style={{ color: '#52525b', fontSize: 12, marginBottom: 16 }}>
                            💡 Get a free key at openrouter.ai - or skip for now
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#09090b',
                                borderWidth: 1,
                                borderColor: '#27272a',
                                color: '#f4f4f5',
                                padding: 16,
                                borderRadius: 6,
                                marginBottom: 16,
                                fontFamily: 'monospace'
                            }}
                            placeholder="sk-or-v1-..."
                            placeholderTextColor="#52525b"
                            value={keyInput}
                            onChangeText={setKeyInput}
                            secureTextEntry
                        />
                        <Pressable
                            role="button"
                            onPress={handleSaveKey}
                            style={[buttonStyle, {
                                backgroundColor: '#22d3ee',
                                paddingVertical: 14,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12
                            }]}
                        >
                            <Text style={{ color: '#09090b', fontWeight: 'bold' }}>SAVE KEY</Text>
                        </Pressable>
                        <Pressable
                            role="button"
                            onPress={handleSkipKey}
                            style={[buttonStyle, {
                                backgroundColor: '#27272a',
                                paddingVertical: 14,
                                borderRadius: 8,
                                alignItems: 'center'
                            }]}
                        >
                            <Text style={{ color: '#a1a1aa', fontWeight: 'bold' }}>SKIP FOR NOW</Text>
                        </Pressable>
                    </View>
                )}

                {step === 3 && (
                    <View style={{ alignItems: 'center' }}>
                        <CheckCircle size={48} color="#22c55e" style={{ marginBottom: 24 }} />
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#f4f4f5', marginBottom: 8 }}>
                            You&apos;re All Set!
                        </Text>
                        <Text style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                            Here&apos;s what you can do:{"\n\n"}
                            📥 <Text style={{ color: '#f4f4f5' }}>Capture</Text> - Save ideas & notes{"\n"}
                            💬 <Text style={{ color: '#f4f4f5' }}>Chat</Text> - Talk to AI about your data{"\n"}
                            ✨ <Text style={{ color: '#f4f4f5' }}>Crystallize</Text> - Generate smart prompts{"\n"}
                            📂 <Text style={{ color: '#f4f4f5' }}>Projects</Text> - Browse and edit captures
                        </Text>
                        <Pressable
                            role="button"
                            onPress={handleFinish}
                            style={[buttonStyle, {
                                backgroundColor: '#22c55e',
                                width: '100%',
                                paddingVertical: 16,
                                borderRadius: 8,
                                alignItems: 'center'
                            }]}
                        >
                            <Text style={{ color: '#052e16', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>
                                ENTER MULTICORTEX
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}
