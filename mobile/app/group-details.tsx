import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, DeviceEventEmitter } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { chat, groups } from '../data/DemoChat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const GroupDetails = () => {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { participants } = useLocalSearchParams<{ participants: string }>();
    const selectedIds: number[] = participants ? JSON.parse(participants) : [];

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupImage, setGroupImage] = useState<string | null>(null);
    const selectedContacts = chat.filter(c => selectedIds.includes(c.id));

    const handleSelectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setGroupImage(result.assets[0].uri);
        }
    };

    const handleCreate = () => {
        if (!groupName.trim()) {
            Alert.alert('Please provide a group subject');
            return;
        }

        const newGroup = {
            id: 'g' + Date.now(),
            name: groupName,
            groupDescription: groupDescription,
            message: 'You created this group',
            image: groupImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
            time: 'Now',
            members: [...selectedIds, 'me'],
            admins: ['me'],
        };

        // Persist the new group to the global state
        groups.unshift(newGroup as any);

        // Notify Group screen to update via event emitter
        DeviceEventEmitter.emit('groupCreated', newGroup);

        // Return to the group tab
        router.dismissAll();
        router.replace('/(tabs)/group' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-xl font-bold">New group</Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm">Add subject</Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* Group Info Input Section */}
                <View className="p-6 flex-row items-center border-b" style={{ borderColor: colors.border }}>
                    <TouchableOpacity
                        onPress={handleSelectImage}
                        className="w-20 h-20 rounded-full items-center justify-center overflow-hidden shadow-sm"
                        style={{ backgroundColor: colors.border + '50' }}
                    >
                        {groupImage ? (
                            <Image source={{ uri: groupImage }} className="w-full h-full" />
                        ) : (
                            <View className="items-center justify-center">
                                <View className="bg-[#00A884] p-3 rounded-full absolute z-10 opacity-80">
                                    <MaterialIcons name="photo-camera" size={24} color="white" />
                                </View>
                                <View className="w-full h-full bg-gray-200 dark:bg-gray-800 items-center justify-center">
                                    <Ionicons name="people" size={40} color={colors.secondaryText} />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="ml-5 flex-1">
                        <View className="flex-row items-center border-b-2 pb-1" style={{ borderBottomColor: '#00A884' }}>
                            <TextInput
                                placeholder="Group subject..."
                                placeholderTextColor={colors.secondaryText}
                                className="flex-1 text-lg font-semibold"
                                style={{ color: colors.text }}
                                value={groupName}
                                onChangeText={setGroupName}
                                maxLength={25}
                            />
                            <Text style={{ color: colors.secondaryText }} className="text-[10px] ml-2">
                                {25 - groupName.length}
                            </Text>
                            <TouchableOpacity className="ml-2">
                                <MaterialIcons name="insert-emoticon" size={24} color={colors.secondaryText} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={{ color: '#00A884' }} className="px-6 text-xs font-semibold mb-4 uppercase">
                    Provide a group subject and optional group icon
                </Text>

                {/* Group Description Input */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center border-b" style={{ borderBottomColor: colors.border }}>
                        <TextInput
                            placeholder="Add group description (optional)"
                            placeholderTextColor={colors.secondaryText}
                            className="flex-1 text-base py-3"
                            style={{ color: colors.text }}
                            value={groupDescription}
                            onChangeText={setGroupDescription}
                            multiline
                            maxLength={100}
                        />
                    </View>
                </View>

                {/* Participants Summary */}
                <View className="mt-4 px-6 border-t pt-4" style={{ borderTopColor: colors.border }}>
                    <Text style={{ color: colors.secondaryText }} className="text-base font-semibold mb-4 uppercase text-[12px] tracking-wider">
                        Participants: {selectedIds.length}
                    </Text>
                    <View className="flex-row flex-wrap">
                        {selectedContacts.map(item => (
                            <View key={item.id} className="items-center mr-6 mb-6 w-16">
                                <Image source={{ uri: item.image }} className="w-14 h-14 rounded-full" />
                                <Text style={{ color: colors.text }} className="text-xs mt-1 text-center" numberOfLines={1}>
                                    {item.name.split(' ')[0]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-8 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                style={{ backgroundColor: '#00A884', elevation: 8 }}
                onPress={handleCreate}
            >
                <Ionicons name="checkmark" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default GroupDetails;

