import { Redirect } from 'expo-router';

export default function Index() {
    // Redirect to tabs - the (tabs)/index.tsx handles onboarding logic
    return <Redirect href="/(tabs)" />;
}
