import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert, DeviceEventEmitter } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { groups, chat, currentUser } from '../../data/DemoChat';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const GroupInfo = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Group state
    const group = groups.find((g) => g.id === id) || groups[0];
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.groupDescription || '');
    const [image, setImage] = useState(group.image);
    const [isEditing, setIsEditing] = useState(false);
    const [groupAdmins, setGroupAdmins] = useState<any[]>(group.admins || []);
    const [members, setMembers] = useState(group.members);

    // Find members details including current user
    const memberDetails = [
        ...chat.filter(c => members.includes(c.id)),
        ...(members.includes('me') ? [currentUser] : [])
    ];

    const handleImagePress = (uri: string) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const handleSelectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            setImage(newUri);
            // Auto save image
            group.image = newUri;
            DeviceEventEmitter.emit('groupUpdated', group);
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Name cannot be empty');
            return;
        }
        group.name = name;
        group.groupDescription = description;
        group.admins = groupAdmins;
        setIsEditing(false);
        DeviceEventEmitter.emit('groupUpdated', group);
    };

    const handlePromoteAdmin = (memberId: any) => {
        if (groupAdmins.includes(memberId)) {
            // Dismiss as admin
            const newAdmins = groupAdmins.filter(id => id !== memberId);
            setGroupAdmins(newAdmins);
            group.admins = newAdmins;
        } else {
            // Promote to admin
            const newAdmins = [...groupAdmins, memberId];
            setGroupAdmins(newAdmins);
            group.admins = newAdmins;
        }
        DeviceEventEmitter.emit('groupUpdated', group);
    };

    const handleRemoveMember = (memberId: any, memberName: string) => {
        Alert.alert(
            'Remove member',
            `Are you sure you want to remove ${memberName} from the group?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const newMembers = group.members.filter(id => id !== memberId);
                        const newAdmins = group.admins.filter(id => id !== memberId);
                        group.members = newMembers;
                        group.admins = newAdmins;
                        setMembers(newMembers);
                        setGroupAdmins(newAdmins);
                        DeviceEventEmitter.emit('groupUpdated', group);
                    }
                }
            ]
        );
    };

    const handleExitGroup = () => {
        Alert.alert(
            'Exit group',
            'Are you sure you want to exit this group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => {
                        const newMembers = group.members.filter(id => id !== 'me');
                        const newAdmins = group.admins.filter(id => id !== 'me');
                        group.members = newMembers;
                        group.admins = newAdmins;

                        // If no more admins left but members exist, promote the first member
                        if (newAdmins.length === 0 && newMembers.length > 0) {
                            group.admins.push(newMembers[0]);
                        }

                        DeviceEventEmitter.emit('groupUpdated', group);
                        router.dismissAll();
                        router.replace('/(tabs)/group' as any);
                    }
                }
            ]
        );
    };

    const handleReportGroup = () => {
        Alert.alert(
            'Report this group to WhatsApp?',
            'The group name and last 5 messages will be forwarded to WhatsApp. This group and its participants will not be notified.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Report',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
                        // Optionally offer to exit
                        Alert.alert(
                            'Exit group?',
                            'Do you also want to exit this group and delete its messages?',
                            [
                                { text: 'No', style: 'cancel' },
                                { text: 'Exit', style: 'destructive', onPress: handleExitGroup }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const isAdmin = groupAdmins.includes('me');

    const ListOption = ({ icon, label, subLabel, color, type = 'ion', onPress }: { icon: any, label: string, subLabel?: string, color?: string, type?: 'ion' | 'mc' | 'fa' | 'mat', onPress?: () => void }) => (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={onPress}
        >
            <View className="w-10">
                {type === 'ion' && <Ionicons name={icon} size={22} color={color || colors.secondaryText} />}
                {type === 'mc' && <MaterialCommunityIcons name={icon} size={22} color={color || colors.secondaryText} />}
                {type === 'fa' && <FontAwesome name={icon} size={20} color={color || colors.secondaryText} />}
                {type === 'mat' && <MaterialIcons name={icon} size={22} color={color || colors.secondaryText} />}
            </View>
            <View className="flex-1 ml-2">
                <Text style={{ color: color || colors.text }} className="text-[17px]">{label}</Text>
                {subLabel && <Text style={{ color: colors.secondaryText }} className="text-sm">{subLabel}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header / Top Bar */}
            <View
                className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-4"
                style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-black/20"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-row items-center">
                    {isEditing && (
                        <TouchableOpacity
                            onPress={handleSave}
                            className="w-10 h-10 items-center justify-center rounded-full bg-black/20 mr-2"
                        >
                            <Ionicons name="checkmark" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        className="w-10 h-10 items-center justify-center rounded-full bg-black/20"
                        onPress={() => setIsEditing(!isEditing)}
                    >
                        <Ionicons name={isEditing ? "close" : "ellipsis-vertical"} size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View className="relative">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleImagePress(image)}
                    >
                        <Image
                            source={{ uri: image }}
                            style={{ width: width, height: width }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSelectImage}
                        className="absolute bottom-4 right-4 bg-[#00A884] w-14 h-14 rounded-full items-center justify-center shadow-lg"
                    >
                        <MaterialIcons name="photo-camera" size={28} color="white" />
                    </TouchableOpacity>
                    <View className="absolute bottom-4 left-4 pointer-events-none">
                        {!isEditing ? (
                            <>
                                <Text className="text-white text-3xl font-bold drop-shadow-lg">{name}</Text>
                                <Text className="text-white/80 text-sm font-medium">Group · {members.length} participants</Text>
                            </>
                        ) : (
                            <View className="bg-black/40 p-2 rounded-lg" style={{ width: width - 80 }}>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    className="text-white text-2xl font-bold p-0"
                                    placeholder="Group Name"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    autoFocus
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Description Section */}
                <View className="p-4" style={{ backgroundColor: colors.background }}>
                    <View className="flex-row justify-between items-center mb-1">
                        <Text style={{ color: colors.secondaryText }} className="text-sm font-medium uppercase text-[12px] tracking-wider">Group description</Text>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <MaterialIcons name="edit" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditing ? (
                        <View className="border-b" style={{ borderBottomColor: colors.primary }}>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                className="text-base py-1"
                                style={{ color: colors.text }}
                                placeholder="Add group description..."
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>
                    ) : (
                        <Text style={{ color: colors.text }} className="text-base mb-1">
                            {description || "No description provided."}
                        </Text>
                    )}
                    <Text style={{ color: colors.secondaryText }} className="text-xs mt-2">Created by Mainak, 2/3/26</Text>
                </View>

                {/* Spacer */}
                <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                {/* Participants Section */}
                <View style={{ backgroundColor: colors.background }}>
                    <View className="p-4 flex-row justify-between items-center">
                        <Text style={{ color: colors.secondaryText }} className="text-sm font-medium uppercase text-[12px] tracking-wider">
                            {members.length} participants
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="search" size={20} color={colors.secondaryText} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="flex-row items-center px-4 py-3">
                        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#00A884' }}>
                            <Ionicons name="person-add" size={24} color="white" />
                        </View>
                        <Text style={{ color: colors.text }} className="ml-4 text-[17px]">Add participants</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center px-4 py-3">
                        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#00A884' }}>
                            <Ionicons name="link" size={24} color="white" />
                        </View>
                        <Text style={{ color: colors.text }} className="ml-4 text-[17px]">Invite via link</Text>
                    </TouchableOpacity>

                    {memberDetails.map((member) => (
                        <TouchableOpacity
                            key={member.id}
                            className="flex-row items-center px-4 py-3"
                            onPress={() => {
                                if (member.id === 'me') {
                                    // Maybe show own profile or settings
                                } else {
                                    router.push({ pathname: '/profile/[id]', params: { id: member.id.toString() } });
                                }
                            }}
                            onLongPress={() => {
                                if (isAdmin && member.id !== 'me') {
                                    Alert.alert(
                                        'Admin Options',
                                        `What would you like to do with ${member.name}?`,
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: groupAdmins.includes(member.id) ? 'Dismiss as admin' : 'Make group admin',
                                                onPress: () => handlePromoteAdmin(member.id)
                                            },
                                            { text: 'Remove from group', style: 'destructive', onPress: () => handleRemoveMember(member.id, member.name) }
                                        ]
                                    );
                                }
                            }}
                        >
                            <Image source={{ uri: member.image }} className="w-12 h-12 rounded-full" />
                            <View className="ml-4 flex-1">
                                <Text style={{ color: colors.text }} className="text-[17px] font-medium">
                                    {member.id === 'me' ? 'You' : member.name}
                                </Text>
                                <Text style={{ color: colors.secondaryText }} className="text-sm" numberOfLines={1}>{member.about}</Text>
                            </View>
                            {groupAdmins.includes(member.id) && (
                                <View className="border rounded px-1" style={{ borderColor: '#00A884' }}>
                                    <Text style={{ color: '#00A884' }} className="text-[10px]">Group Admin</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Spacer */}
                <View className="h-2" style={{ backgroundColor: colors.tabBarBackground }} />

                {/* Exit/Report Section */}
                <View style={{ backgroundColor: colors.background }}>
                    <ListOption
                        type="mat"
                        icon="exit-to-app"
                        label="Exit group"
                        color="#ff3b30"
                        onPress={handleExitGroup}
                    />
                    <ListOption
                        type="mat"
                        icon="thumb-down"
                        label="Report group"
                        color="#ff3b30"
                        onPress={handleReportGroup}
                    />
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Image Preview Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="bg-black flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="absolute top-0 right-4 z-30 "
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

export default GroupInfo;

