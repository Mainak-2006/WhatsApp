import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Settings from '../components/Settings';
import { useThemeColors } from '../hooks/useThemeColors';

export default function SettingsScreen() {
    const colors = useThemeColors();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerTitle: 'Settings',
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: colors.text,
                    },
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                }}
            />
            <Settings />
        </View>
    );
}
