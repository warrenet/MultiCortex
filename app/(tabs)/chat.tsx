import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore, ChatMessage } from '../../src/store';
import { AIService } from '../../src/services/AIService';
import { TipService } from '../../src/services/TipService';
import { toast } from 'sonner-native';
import { Send, Bot, User, Sparkles, Trash2, MessageCircle, BookmarkPlus } from 'lucide-react-native';
import { PageHeader, EmptyState, FloatingHelpButton } from '../../src/components/ui';

export default function ChatTab() {
    const {
        projects,
        apiKey,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        saveChatAsProject
    } = useStore();

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef<ScrollView>(null);
    const hasShownTipRef = useRef(false);

    // Show welcome tip once per session
    useEffect(() => {
        if (hasShownTipRef.current) return;
        hasShownTipRef.current = true;
        const tip = TipService.getRandomTip('chat');
        toast.info(tip.message, { duration: 5000 });
    }, []);

    // Memoized context building
    const projectContents = useMemo(() =>
        projects
            .slice(-10)
            .map(p => (p.data?.content || '').slice(0, 500))
            .filter(Boolean),
        [projects]
    );

    const handleSend = useCallback(async () => {
        if (!inputValue.trim()) {
            toast.warning('Enter a message first');
            return;
        }

        if (!apiKey) {
            toast.error('API key required. Go to Settings to add your key.');
            return;
        }

        const userMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            role: 'user',
            content: inputValue.trim(),
            timestamp: Date.now()
        };

        // Add to persistent store
        addChatMessage(userMessage);
        setInputValue('');
        setIsLoading(true);
        setStreamingContent('');

        const systemPrompt = AIService.buildSystemPrompt(projectContents);
        const apiMessages: ChatMessage[] = [
            { id: 'system', role: 'system', content: systemPrompt, timestamp: 0 },
            ...chatHistory,
            userMessage
        ];

        try {
            toast.loading('Thinking...', { id: 'ai-thinking' });

            const response = await AIService.chat(
                apiMessages,
                { apiKey },
                (chunk) => setStreamingContent(prev => prev + chunk)
            );

            toast.dismiss('ai-thinking');
            toast.success('Response received');

            const assistantMessage: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };

            // Add to persistent store
            addChatMessage(assistantMessage);
            setStreamingContent('');
        } catch (error) {
            toast.dismiss('ai-thinking');
            const message = error instanceof Error ? error.message : 'Chat failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, apiKey, chatHistory, projectContents, addChatMessage]);

    const handleCrystallize = useCallback(() => {
        if (projects.length === 0) {
            toast.warning('Capture some data first! Go to Command tab.');
            return;
        }
        toast.info('✨ Crystallizing your ideas into a prompt...');
        setInputValue('Transform my captured notes into a refined, actionable system prompt I can use with AI tools.');
    }, [projects.length]);

    const handleClear = useCallback(() => {
        clearChatHistory();
        toast.success('Chat history cleared');
    }, [clearChatHistory]);

    // NEW: Save AI response to Projects
    const handleSaveToProjects = useCallback((content: string) => {
        saveChatAsProject(content);
        toast.success('💾 Saved to Projects!');
    }, [saveChatAsProject]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-zinc-950"
        >
            {/* Header */}
            <PageHeader
                title="Neural Chat"
                subtitle={`${chatHistory.length} messages • ${projects.length} data streams`}
                rightAction={
                    <TouchableOpacity onPress={handleClear} className="p-2">
                        <Trash2 size={20} color="#71717a" />
                    </TouchableOpacity>
                }
            />

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                className="flex-1 p-4"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {chatHistory.length === 0 ? (
                    <EmptyState
                        icon={MessageCircle}
                        title="Start a Conversation"
                        description="Chat with AI about your captured data. Your conversation is automatically saved."
                        actionLabel="Crystallize Ideas"
                        onAction={handleCrystallize}
                    />
                ) : (
                    chatHistory.filter(m => m.role !== 'system').map((msg) => (
                        <View
                            key={msg.id}
                            className={`mb-4 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <View
                                className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-cyan-600/20 border border-cyan-600/30'
                                    : 'bg-zinc-900 border border-zinc-800'
                                    }`}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        {msg.role === 'user' ? (
                                            <User size={14} color="#22d3ee" />
                                        ) : (
                                            <Bot size={14} color="#22d3ee" />
                                        )}
                                        <Text className="text-zinc-400 text-xs ml-2 font-medium">
                                            {msg.role === 'user' ? 'You' : 'MultiCortex AI'}
                                        </Text>
                                    </View>

                                    {/* Save to Projects button (AI messages only) */}
                                    {msg.role === 'assistant' && (
                                        <TouchableOpacity
                                            onPress={() => handleSaveToProjects(msg.content)}
                                            className="ml-2 p-1.5 rounded-lg bg-zinc-800 active:bg-zinc-700"
                                        >
                                            <BookmarkPlus size={14} color="#71717a" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text className="text-zinc-100 leading-6">{msg.content}</Text>
                            </View>
                        </View>
                    ))
                )}

                {/* Streaming response */}
                {isLoading && streamingContent && (
                    <View className="mb-4 flex-row justify-start">
                        <View className="max-w-[85%] p-4 rounded-2xl bg-zinc-900 border border-cyan-800/50">
                            <View className="flex-row items-center mb-2">
                                <Bot size={14} color="#22d3ee" />
                                <Text className="text-cyan-400 text-xs ml-2">AI (typing...)</Text>
                            </View>
                            <Text className="text-zinc-100 leading-6">{streamingContent}</Text>
                        </View>
                    </View>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <Text className="text-zinc-500 text-sm mt-3">Analyzing your data...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input area */}
            <View className="bg-zinc-900 border-t border-zinc-800 p-4">
                <View className="flex-row items-end gap-3">
                    <TouchableOpacity
                        onPress={handleCrystallize}
                        className="bg-zinc-800 p-3 rounded-xl"
                    >
                        <Sparkles size={20} color="#fbbf24" />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 p-4 rounded-xl max-h-24"
                        placeholder="Ask about your data..."
                        placeholderTextColor="#52525b"
                        value={inputValue}
                        onChangeText={setInputValue}
                        multiline
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className={`p-3 rounded-xl ${isLoading || !inputValue.trim()
                            ? 'bg-zinc-800'
                            : 'bg-cyan-600 active:bg-cyan-700'
                            }`}
                    >
                        <Send size={20} color={isLoading || !inputValue.trim() ? '#52525b' : '#ffffff'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Floating Help */}
            <FloatingHelpButton bottom={120} />
        </KeyboardAvoidingView>
    );
}
