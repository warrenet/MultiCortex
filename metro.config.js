const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure proper platform-specific file resolution
config.resolver.sourceExts = ['web.ts', 'web.tsx', 'web.js', 'web.jsx', ...config.resolver.sourceExts];

// Block expo-sqlite from being bundled on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'expo-sqlite') {
        return {
            type: 'empty',
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
