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
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#25D366" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
