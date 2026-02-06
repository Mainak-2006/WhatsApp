import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../hooks/useThemeColors'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type PrivacyOption = 'everyone' | 'contacts' | 'contacts-except' | 'only-share-with';

const StatusPrivacy = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [selectedOption, setSelectedOption] = useState<PrivacyOption>('contacts');
    const [exceptContacts, setExceptContacts] = useState<string[]>([]);
    const [shareWithContacts, setShareWithContacts] = useState<string[]>([]);

    const privacyOptions = [
        {
            id: 'everyone' as PrivacyOption,
            title: 'My contacts',
            description: 'Share with all your contacts',
            icon: 'people' as const,
        },
        {
            id: 'contacts-except' as PrivacyOption,
            title: 'My contacts except...',
            description: 'Share with contacts except selected ones',
            icon: 'person-remove' as const,
        },
        {
            id: 'only-share-with' as PrivacyOption,
            title: 'Only share with...',
            description: 'Share only with selected contacts',
            icon: 'person-add' as const,
        },
    ];

    const handleSave = () => {
        Alert.alert(
            'Privacy Updated',
            'Your status privacy settings have been updated.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    const handleSelectContacts = (type: 'except' | 'only') => {
        // Navigate to contact selection screen
        router.push({
            pathname: '/select-contact',
            params: {
                mode: type === 'except' ? 'status-except' : 'status-only',
            },
        } as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View
                style={{
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                }}
                className="border-b"
            >
                <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text }} className="text-xl font-semibold">
                            Status Privacy
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="px-4 py-2 rounded-full"
                        style={{ backgroundColor: '#00A884' }}
                    >
                        <Text className="text-white font-semibold">Save</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Info */}
                <View className="px-4 py-4">
                    <Text style={{ color: colors.secondaryText }} className="text-sm leading-5">
                        Changes to your privacy settings won't affect status updates that you've sent already.
                    </Text>
                </View>

                {/* Privacy Options */}
                <View className="px-4">
                    <Text style={{ color: colors.text }} className="font-semibold mb-3">
                        Who can see my status updates
                    </Text>

                    {privacyOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => setSelectedOption(option.id)}
                            className="flex-row items-center py-4 border-b"
                            style={{ borderBottomColor: colors.border }}
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: colors.card }}
                            >
                                <Ionicons name={option.icon} size={24} color={colors.text} />
                            </View>

                            <View className="flex-1">
                                <Text style={{ color: colors.text }} className="font-semibold text-base">
                                    {option.title}
                                </Text>
                                <Text style={{ color: colors.secondaryText }} className="text-sm mt-0.5">
                                    {option.description}
                                </Text>

                                {/* Show selected contacts count */}
                                {option.id === 'contacts-except' && exceptContacts.length > 0 && (
                                    <Text style={{ color: '#00A884' }} className="text-xs mt-1">
                                        {exceptContacts.length} contact{exceptContacts.length !== 1 ? 's' : ''} excluded
                                    </Text>
                                )}
                                {option.id === 'only-share-with' && shareWithContacts.length > 0 && (
                                    <Text style={{ color: '#00A884' }} className="text-xs mt-1">
                                        {shareWithContacts.length} contact{shareWithContacts.length !== 1 ? 's' : ''} selected
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row items-center gap-2">
                                {/* Edit button for exception lists */}
                                {((option.id === 'contacts-except' && selectedOption === 'contacts-except') ||
                                    (option.id === 'only-share-with' && selectedOption === 'only-share-with')) && (
                                        <TouchableOpacity
                                            onPress={() => handleSelectContacts(option.id === 'contacts-except' ? 'except' : 'only')}
                                            className="mr-2"
                                        >
                                            <MaterialIcons name="edit" size={20} color="#00A884" />
                                        </TouchableOpacity>
                                    )}

                                {/* Radio button */}
                                <View
                                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                                    style={{
                                        borderColor: selectedOption === option.id ? '#00A884' : colors.border,
                                    }}
                                >
                                    {selectedOption === option.id && (
                                        <View className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#00A884' }} />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Read Receipts */}
                <View className="px-4 mt-6">
                    <View className="flex-row items-center justify-between py-4 border-b" style={{ borderBottomColor: colors.border }}>
                        <View className="flex-1">
                            <Text style={{ color: colors.text }} className="font-semibold text-base">
                                Read receipts
                            </Text>
                            <Text style={{ color: colors.secondaryText }} className="text-sm mt-0.5">
                                If turned off, you won't see who viewed your status
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="w-12 h-7 rounded-full justify-center px-0.5"
                            style={{ backgroundColor: '#00A884' }}
                        >
                            <View className="w-6 h-6 rounded-full bg-white self-end" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional Info */}
                <View className="px-4 py-6">
                    <View className="p-4 rounded-xl" style={{ backgroundColor: colors.card }}>
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={24} color="#00A884" />
                            <View className="ml-3 flex-1">
                                <Text style={{ color: colors.text }} className="font-semibold mb-2">
                                    About status privacy
                                </Text>
                                <Text style={{ color: colors.secondaryText }} className="text-sm leading-5">
                                    Status updates are end-to-end encrypted and disappear after 24 hours. Only contacts you choose will be able to see your status updates.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default StatusPrivacy;
