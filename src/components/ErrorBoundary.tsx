import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleRestart = () => {
        // Attempt to recover by resetting error state. 
        // In a real app, you might want to reload the entire bundle.
        this.setState({ hasError: false, error: null });
    };

    handleHome = () => {
        // Basic navigation reset attempt (may not work if router is broken)
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 bg-zinc-950 justify-center items-center p-6">
                    <View className="bg-red-900/10 p-6 rounded-full border border-red-500/20 mb-6">
                        <AlertTriangle size={48} color="#ef4444" />
                    </View>

                    <Text className="text-white text-2xl font-bold mb-2 text-center">
                        Critical Systems Failure
                    </Text>

                    <Text className="text-zinc-400 text-center mb-8 bg-zinc-900 p-4 rounded-lg font-mono text-xs">
                        {this.state.error?.toString()}
                    </Text>

                    <View className="w-full gap-3">
                        <TouchableOpacity
                            onPress={this.handleRestart}
                            className="bg-emerald-600 py-4 px-6 rounded-xl flex-row justify-center items-center active:bg-emerald-700"
                        >
                            <RefreshCw size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Reboot System</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={this.handleHome}
                            className="bg-zinc-800 py-4 px-6 rounded-xl flex-row justify-center items-center active:bg-zinc-700"
                        >
                            <Home size={20} color="#a1a1aa" />
                            <Text className="text-zinc-300 font-bold ml-2">Return to Base</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}
