import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { storage } from '../services/UniversalStorageAdapter';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = async () => {
        try {
            await storage.clear();
            // Force reload if possible, or just reset state
            this.setState({ hasError: false, error: null });
            // In a real native app, might need RNRestart, here we rely on state reset or user manual reload
        } catch (e) {
            console.error("Failed to reset storage", e);
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 bg-zinc-950 items-center justify-center p-6">
                    <AlertTriangle size={48} color="#ef4444" className="mb-6" />
                    <Text className="text-red-500 font-bold text-xl mb-2">SYSTEM FAILURE</Text>
                    <Text className="text-zinc-400 text-center mb-8">
                        An unrecoverable error has occurred.
                        {"\n"}{this.state.error?.message}
                    </Text>

                    <TouchableOpacity
                        className="bg-red-900/20 border border-red-900/50 px-6 py-4 rounded flex-row items-center active:bg-red-900/40"
                        onPress={this.handleReset}
                    >
                        <RefreshCw size={20} color="#fca5a5" className="mr-3" />
                        <Text className="text-red-200 font-bold">EMERGENCY RESET</Text>
                    </TouchableOpacity>
                    <Text className="text-zinc-600 text-xs mt-4">
                        Warning: This will wipe local data to restore system integrity.
                    </Text>
                </View>
            );
        }

        return this.props.children;
    }
}
