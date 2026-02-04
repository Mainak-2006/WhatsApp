import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function OAuthCallback() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn) {
                router.replace('/(tabs)' as any);
            } else {
                router.replace('/(auth)/sign-in' as any);
            }
        }
    }, [isLoaded, isSignedIn]);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#25D366" />
        </View>
    );
}
