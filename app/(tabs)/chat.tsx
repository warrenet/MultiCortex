import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore } from '../../src/store';
import { AIService, ChatMessage } from '../../src/services/AIService';
import { TipService } from '../../src/services/TipService';
import { toast } from 'sonner-native';
import { Send, Bot, User, Sparkles, HelpCircle, Trash2 } from 'lucide-react-native';

export default function ChatTab() {
    const { projects, apiKey } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    // Show welcome tip on first load
    useEffect(() => {
        if (messages.length === 0) {
            const tip = TipService.getRandomTip('chat');
            toast.info(tip.message, { duration: 5000 });
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim()) {
            toast.warning('Enter a message first');
            return;
        }

        if (!apiKey) {
            toast.error('API key required. Complete onboarding to add your key.');
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        // Build context from projects
        const projectContents = projects.map(p => p.data?.content || '').filter(Boolean);
        const systemPrompt = AIService.buildSystemPrompt(projectContents);

        const apiMessages: ChatMessage[] = [
            { id: 'system', role: 'system', content: systemPrompt, timestamp: 0 },
            ...newMessages
        ];

        try {
            toast.loading('Thinking...', { id: 'ai-thinking' });

            const response = await AIService.chat(
                apiMessages,
                { apiKey },
                (chunk) => {
                    setStreamingContent(prev => prev + chunk);
                }
            );

            toast.dismiss('ai-thinking');
            toast.success('Response received');

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };

            setMessages([...newMessages, assistantMessage]);
            setStreamingContent('');
        } catch (error) {
            toast.dismiss('ai-thinking');
            const message = error instanceof Error ? error.message : 'Chat failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCrystallize = async () => {
        if (projects.length === 0) {
            toast.warning('Capture some data first! Go to Command tab to add notes.');
            return;
        }

        toast.info('✨ Crystallizing your ideas into a prompt...');
        setInput('Transform my captured notes into a refined, actionable system prompt I can use with AI tools.');
    };

    const handleClear = () => {
        setMessages([]);
        toast.success('Chat cleared');
    };

    const handleShowTip = () => {
        const tip = TipService.getRandomTip('chat');
        toast.info(`${tip.title}\n${tip.message}`, { duration: 6000 });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-zinc-950"
        >
            {/* Header */}
            <View className="bg-zinc-900 border-b border-zinc-800 p-4 pt-12 flex-row justify-between items-center">
                <View>
                    <Text className="text-zinc-100 font-bold text-lg tracking-wider">NEURAL CHAT</Text>
                    <Text className="text-zinc-500 text-xs">{projects.length} data streams available for context</Text>
                </View>
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={handleShowTip} className="p-2">
                        <HelpCircle size={20} color="#71717a" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClear} className="p-2">
                        <Trash2 size={20} color="#71717a" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                className="flex-1 p-4"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <Bot size={48} color="#3f3f46" />
                        <Text className="text-zinc-500 text-center mt-4 max-w-xs">
                            Chat with AI about your captured data.{'\n'}
                            Your notes provide context for smarter responses.
                        </Text>
                        <TouchableOpacity
                            onPress={handleCrystallize}
                            className="mt-6 bg-zinc-800 px-4 py-3 rounded-lg flex-row items-center"
                        >
                            <Sparkles size={16} color="#fbbf24" />
                            <Text className="text-zinc-200 ml-2">Try: Crystallize My Ideas</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    messages.map((msg) => (
                        <View
                            key={msg.id}
                            className={`mb-4 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <View className={`max-w-[85%] p-4 rounded-lg ${msg.role === 'user'
                                    ? 'bg-zinc-800'
                                    : 'bg-zinc-900 border border-zinc-800'
                                }`}>
                                <View className="flex-row items-center mb-2">
                                    {msg.role === 'user'
                                        ? <User size={14} color="#a1a1aa" />
                                        : <Bot size={14} color="#22d3ee" />
                                    }
                                    <Text className="text-zinc-500 text-xs ml-2">
                                        {msg.role === 'user' ? 'You' : 'MultiCortex AI'}
                                    </Text>
                                </View>
                                <Text className="text-zinc-200 leading-6">{msg.content}</Text>
                            </View>
                        </View>
                    ))
                )}

                {/* Streaming response */}
                {isLoading && streamingContent && (
                    <View className="mb-4 flex-row justify-start">
                        <View className="max-w-[85%] p-4 rounded-lg bg-zinc-900 border border-cyan-900/50">
                            <View className="flex-row items-center mb-2">
                                <Bot size={14} color="#22d3ee" />
                                <Text className="text-cyan-500 text-xs ml-2">MultiCortex AI (typing...)</Text>
                            </View>
                            <Text className="text-zinc-200 leading-6">{streamingContent}</Text>
                        </View>
                    </View>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                    <View className="items-center py-4">
                        <ActivityIndicator size="small" color="#22d3ee" />
                        <Text className="text-zinc-500 text-xs mt-2">Analyzing your data...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input area */}
            <View className="bg-zinc-900 border-t border-zinc-800 p-4">
                <View className="flex-row items-end gap-3">
                    <TouchableOpacity
                        onPress={handleCrystallize}
                        className="bg-zinc-800 p-3 rounded-lg"
                    >
                        <Sparkles size={20} color="#fbbf24" />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-lg max-h-24"
                        placeholder="Ask about your data..."
                        placeholderTextColor="#52525b"
                        value={input}
                        onChangeText={setInput}
                        multiline
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`p-3 rounded-lg ${isLoading || !input.trim() ? 'bg-zinc-800' : 'bg-cyan-600'}`}
                    >
                        <Send size={20} color={isLoading || !input.trim() ? '#52525b' : '#ffffff'} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
