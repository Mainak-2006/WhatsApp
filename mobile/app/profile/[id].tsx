import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Modal, Alert, DeviceEventEmitter } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { chat, currentUser, blockedIds } from '../../data/DemoChat';

const { width } = Dimensions.get('window');

const ProfileDetail = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBlocked, setIsBlocked] = useState(
        blockedIds.includes(id as any) || blockedIds.includes(id?.toString())
    );

    const handleImagePress = (uri: string) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const handleBlock = () => {
        const userId = id?.toString();
        if (isBlocked) {
            setIsBlocked(false);
            const index = blockedIds.findIndex(bid => bid === userId || bid === id);
            if (index > -1) blockedIds.splice(index, 1);
            Alert.alert('Unblocked', `${user.name} has been unblocked.`);
            DeviceEventEmitter.emit('userUnblocked', user.id);
        } else {
            Alert.alert(
                `Block ${user.name}?`,
                'Blocked contacts will no longer be able to call you or send you messages.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Block',
                        style: 'destructive',
                        onPress: () => {
                            setIsBlocked(true);
                            if (!blockedIds.includes(userId) && !blockedIds.includes(id as any)) {
                                blockedIds.push(userId);
                            }
                            Alert.alert('Blocked', `${user.name} has been blocked.`);
                            DeviceEventEmitter.emit('userBlocked', user.id);
                        }
                    }
                ]
            );
        }
    };

    const handleReport = () => {
        Alert.alert(
            `Report ${user.name}?`,
            'The last 5 messages from this contact will be forwarded to WhatsApp. This contact will not be notified.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Report',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
                        // Optionally block after reporting
                        Alert.alert(
                            'Block contact?',
                            'Do you also want to block this contact and delete this chat\'s messages?',
                            [
                                { text: 'No', style: 'cancel' },
                                { text: 'Block', style: 'destructive', onPress: () => setIsBlocked(true) }
                            ]
                        );
                    }
                }
            ]
        );
    };

    // Find the user from mock data
    const user = id === 'me' ? currentUser : (chat.find((u) => u.id.toString() === id) || chat[0]);

    // Status/About placeholder
    const about = user.about || "Hey there! I am using WhatsApp.";
    const phoneNumber = user.phoneNumber || "+91 98765 43210";

    const isMe = user.id === 'me';

    const ActionButton = ({ icon, label, color }: { icon: any, label: string, color?: string }) => (
        <TouchableOpacity className="items-center justify-center py-2" style={{ width: width / 4 - 20 }}>
            <View className="mb-1">
                <Ionicons name={icon} size={24} color={color || colors.primary} />
            </View>
            <Text style={{ color: color || colors.primary }} className="text-xs font-medium">{label}</Text>
        </TouchableOpacity>
    );

    const ListOption = ({ icon, label, subLabel, color, type = 'ion', onPress }: { icon: any, label: string, subLabel?: string, color?: string, type?: 'ion' | 'mc' | 'fa', onPress?: () => void }) => (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={onPress}
        >
            <View className="w-10">
                {type === 'ion' && <Ionicons name={icon} size={22} color={color || colors.secondaryText} />}
                {type === 'mc' && <MaterialCommunityIcons name={icon} size={22} color={color || colors.secondaryText} />}
                {type === 'fa' && <FontAwesome name={icon} size={20} color={color || colors.secondaryText} />}
            </View>
            <View className="flex-1 ml-2">
                <Text style={{ color: colors.text }} className="text-[17px]">{label}</Text>
                {subLabel && <Text style={{ color: colors.secondaryText }} className="text-sm">{subLabel}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header / Top Bar */}
            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4"
                style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-black/20"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-10 h-10 items-center justify-center rounded-full bg-black/20"
                >
                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleImagePress(user.image)}
                    className="relative"
                >
                    <Image
                        source={{ uri: user.image }}
                        style={{ width: width, height: width }}
                        resizeMode="cover"
                    />
                    <View
                        className="absolute bottom-4 left-4"
                    >
                        <Text className="text-white text-3xl font-bold drop-shadow-lg">{user.name}</Text>
                    </View>
                </TouchableOpacity>

                {/* Status/About Section */}
                <View className="p-4" style={{ backgroundColor: colors.background }}>
                    <Text style={{ color: colors.secondaryText }} className="text-sm font-medium mb-1">About and phone number</Text>
                    <Text style={{ color: colors.text }} className="text-lg mb-1">{about}</Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm">September 24, 2023</Text>
                    <View className="h-[1px] my-3" style={{ backgroundColor: colors.border }} />
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text style={{ color: colors.text }} className="text-lg">{phoneNumber}</Text>
                            <Text style={{ color: colors.secondaryText }} className="text-sm">Mobile</Text>
                        </View>
                        {!isMe && (
                            <View className="flex-row items-center" style={{ gap: 20 }}>
                                <TouchableOpacity className="p-2">
                                    <Ionicons name="chatbubble" size={22} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity className="p-2">
                                    <Ionicons name="call" size={22} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity className="p-2">
                                    <Ionicons name="videocam" size={22} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Spacer */}
                <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                {/* Media Section */}
                <TouchableOpacity
                    className="p-4 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.background }}
                >
                    <View>
                        <Text style={{ color: colors.secondaryText }} className="text-sm font-medium mb-3">Media, links, and docs</Text>
                        <View className="flex-row items-center">
                            {/* Dummy media blocks */}
                            {[1, 2, 3].map((i) => {
                                const mediaUri = `https://picsum.photos/seed/${user.id.toString() + i}/800`;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => handleImagePress(mediaUri)}
                                        className="w-16 h-16 rounded-md mr-2 bg-gray-200 overflow-hidden"
                                    >
                                        <Image
                                            source={{ uri: mediaUri }}
                                            className="w-full h-full"
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <Text style={{ color: colors.secondaryText }} className="mr-1">42</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                    </View>
                </TouchableOpacity>

                {/* Options Sections - Only for other users */}
                {!isMe && (
                    <>
                        {/* Spacer */}
                        <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                        <View style={{ backgroundColor: colors.background }}>
                            <ListOption icon="notifications" label="Mute notifications" />
                            <ListOption icon="musical-notes" label="Custom notifications" />
                            <ListOption icon="image" label="Media visibility" />
                        </View>

                        {/* Spacer */}
                        <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                        <View style={{ backgroundColor: colors.background }}>
                            <ListOption
                                icon="lock-closed"
                                label="Encryption"
                                subLabel="Messages and calls are end-to-end encrypted. Tap to verify."
                            />
                            <ListOption
                                icon="timer-outline"
                                label="Disappearing messages"
                                subLabel="Off"
                            />
                        </View>

                        {/* Spacer */}
                        <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                        <View style={{ backgroundColor: colors.background }}>
                            <ListOption
                                type="mc"
                                icon="block-helper"
                                label={isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                                color="#ff3b30"
                                onPress={handleBlock}
                            />
                            <ListOption
                                type="mc"
                                icon="thumb-down"
                                label={`Report ${user.name}`}
                                color="#ff3b30"
                                onPress={handleReport}
                            />
                        </View>
                    </>
                )}

                <View className="h-10" />
            </ScrollView>

            {/* Image Preview Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="bg-black items-center justify-center">
                    <TouchableOpacity
                        className="absolute top-0 right-4 z-20 "
                        onPress={() => setModalVisible(false)}
                        style={{ paddingTop: insets.top + 10 }}
                    >
                        <Ionicons name="close" size={36} color="white" />
                    </TouchableOpacity>

                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default ProfileDetail;