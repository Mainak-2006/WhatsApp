import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { chat } from '../data/DemoChat';

export default function BlockedContactsScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    // In a real app, this would be fetched from a server or local storage
    // For this demo, we'll use a simulated state that listens to the block events
    const [blockedContacts, setBlockedContacts] = useState<any[]>([]);

    useEffect(() => {
        // Mock initial state - usually some would be blocked if we had persistence
        // For now let's just use the event emitter to keep it in sync while the app is running
        const blockSub = DeviceEventEmitter.addListener('userBlocked', (id) => {
            const user = chat.find(c => c.id === id);
            if (user && !blockedContacts.find(bc => bc.id === id)) {
                setBlockedContacts(prev => [...prev, user]);
            }
        });

        const unblockSub = DeviceEventEmitter.addListener('userUnblocked', (id) => {
            setBlockedContacts(prev => prev.filter(c => c.id !== id));
        });

        return () => {
            blockSub.remove();
            unblockSub.remove();
        };
    }, [blockedContacts]);

    const handleUnblock = (user: any) => {
        Alert.alert(
            'Unblock contact',
            `Are you sure you want to unblock ${user.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: () => {
                        DeviceEventEmitter.emit('userUnblocked', user.id);
                        Alert.alert('Unblocked', `${user.name} has been unblocked.`);
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerTitle: 'Blocked contacts',
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

            <View className="px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
                <Text style={{ color: colors.secondaryText }} className="text-sm">
                    {blockedContacts.length === 0
                        ? "No blocked contacts"
                        : `${blockedContacts.length} blocked contact${blockedContacts.length > 1 ? 's' : ''}`}
                </Text>
            </View>

            {blockedContacts.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                        <Ionicons name="person-remove" size={40} color="#ccc" />
                    </View>
                    <Text style={{ color: colors.text }} className="text-lg font-medium text-center">No blocked contacts yet</Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm text-center mt-2">
                        Blocked contacts will no longer be able to call you or send you messages.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={blockedContacts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => handleUnblock(item)}
                        >
                            <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
                            <View className="ml-4 flex-1">
                                <Text style={{ color: colors.text }} className="text-[17px] font-medium">{item.name}</Text>
                                <Text style={{ color: colors.secondaryText }} className="text-sm" numberOfLines={1}>{item.about}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity
                className="flex-row items-center px-4 py-4"
                onPress={() => {
                    // In a real app, show contact picker
                    Alert.alert('Feature incoming', 'Contact picker to block new people will be available in the next version.');
                }}
            >
                <View className="w-10 h-10 rounded-full items-center justify-center bg-[#00A884]">
                    <Ionicons name="add" size={24} color="white" />
                </View>
                <Text style={{ color: colors.primary }} className="ml-4 text-[17px] font-medium">Add new...</Text>
            </TouchableOpacity>
        </View>
    );
}
