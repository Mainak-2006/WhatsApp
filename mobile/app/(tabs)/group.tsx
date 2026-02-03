import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, DeviceEventEmitter } from 'react-native'
import React, { useState, useEffect } from 'react'
import { groups } from '../../data/DemoChat'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'

const GroupScreen = () => {
    const colors = useThemeColors();
    const router = useRouter();
    const [localGroups, setLocalGroups] = useState(groups.filter(g => g.members.includes('me')));
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const createSub = DeviceEventEmitter.addListener('groupCreated', (newGroup) => {
            setLocalGroups(prev => {
                // Check if group already exists to avoid duplicates
                if (prev.some(g => g.id === newGroup.id)) {
                    return prev;
                }
                // Only add if I am a member (usually always true for new groups)
                if (newGroup.members.includes('me')) {
                    return [newGroup, ...prev];
                }
                return prev;
            });
        });
        const updateSub = DeviceEventEmitter.addListener('groupUpdated', (updatedGroup) => {
            setLocalGroups(prev => {
                if (!updatedGroup.members.includes('me')) {
                    return prev.filter(g => g.id !== updatedGroup.id);
                }
                return prev.map(g => g.id === updatedGroup.id ? updatedGroup : g);
            });
        });
        return () => {
            createSub.remove();
            updateSub.remove();
        };
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Sync with the global groups array
        setLocalGroups(groups.filter(g => g.members.includes('me')));
        setTimeout(() => {
            setRefreshing(false);
        }, 800);
    }, []);

    return (
        <View style={{ backgroundColor: colors.background }} className='flex-1'>
            <FlatList
                data={localGroups}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className='p-4 ml-2 border-b flex-row items-center'
                        style={{ borderColor: colors.border }}
                        onPress={() => {/* Navigate to group chat */ }}
                    >
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/group-info/[id]', params: { id: item.id } })}
                            activeOpacity={0.7}
                            className='relative'
                        >
                            <Image source={{ uri: item.image }} className='w-14 h-14 rounded-full' />
                            <View className='absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-[#0B141A]' />
                        </TouchableOpacity>

                        <View className='ml-3 flex-1'>
                            <View className='flex-row justify-between items-center'>
                                <Text style={{ color: colors.text }} className='font-bold text-lg'>{item.name}</Text>
                                <Text style={{ color: colors.secondaryText }} className='text-sm'>{item.time}</Text>
                            </View>
                            <Text
                                style={{ color: colors.secondaryText }}
                                className='text-base truncate'
                                numberOfLines={1}
                            >
                                {item.message}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className='flex-1 justify-center items-center p-10'>
                        <MaterialIcons name="group-off" size={64} color={colors.secondaryText} />
                        <Text style={{ color: colors.text }} className='text-lg font-bold mt-4'>No groups yet</Text>
                        <Text style={{ color: colors.secondaryText }} className='text-center mt-2'>
                            Tap the menu and select "New group" to create one.
                        </Text>
                    </View>
                }
            />

            {/* FAB to create new group */}
            <TouchableOpacity
                className='absolute bottom-6 right-6 w-14 h-14 rounded-full justify-center items-center shadow-lg'
                style={{ backgroundColor: '#00A884', elevation: 5 }}
                onPress={() => router.push('/new-group' as any)}
            >
                <MaterialIcons name="group-add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default GroupScreen;