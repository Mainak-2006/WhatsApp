import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, BackHandler, Alert, DeviceEventEmitter } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { chat, blockedIds } from '../data/DemoChat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SelectContact = () => {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { mode } = useLocalSearchParams();
    const isBlockMode = mode === 'block';
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const filteredContacts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return chat.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.phoneNumber.includes(query)
        );
    }, [searchQuery]);

    const handleBack = () => {
        if (isSearching) {
            setIsSearching(false);
            setSearchQuery('');
        } else {
            router.back();
        }
    };

    // Handle hardware back button for search state
    React.useEffect(() => {
        const backAction = () => {
            if (isSearching) {
                setIsSearching(false);
                setSearchQuery('');
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isSearching]);

    const renderHeader = () => (
        <View className="px-4 py-3 bg-white dark:bg-[#0B141A] shadow-sm">
            {isSearching ? (
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={handleBack} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Search..."
                        placeholderTextColor={colors.secondaryText}
                        className="flex-1 text-base ml-2"
                        style={{ color: colors.text }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close" size={24} color={colors.secondaryText} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {isBlockMode ? 'Select contact to block' : 'Select contact'}
                            </Text>
                            <Text style={{ color: colors.secondaryText }} className="text-xs">
                                {chat.length} contacts
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity onPress={() => setIsSearching(true)}>
                            <Ionicons name="search" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MaterialIcons name="more-vert" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    const renderListHeader = () => {
        if (isSearching || isBlockMode) return null;

        const options = [
            {
                id: 'new-group',
                icon: 'group',
                label: 'New group',
                onPress: () => router.push('/new-group')
            },
            {
                id: 'new-contact',
                icon: 'person-add',
                label: 'New contact',
                onPress: () => { } // Placeholder
            },
            {
                id: 'new-community',
                icon: 'groups',
                label: 'New community',
                onPress: () => { } // Placeholder
            }
        ];

        return (
            <View>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={opt.onPress}
                        className="flex-row items-center px-4 py-3"
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-full bg-[#00A884] justify-center items-center">
                            <MaterialIcons name={opt.icon as any} size={24} color="white" />
                        </View>
                        <Text style={{ color: colors.text }} className="ml-4 text-lg font-bold">
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}

                <View className="px-4 py-2 mt-2">
                    <Text style={{ color: colors.secondaryText }} className="font-bold text-sm">
                        Contacts on WhatsApp
                    </Text>
                </View>
            </View>
        );
    };

    const handleContactPress = (contact: any) => {
        if (isBlockMode) {
            // Check if already blocked
            if (blockedIds.includes(contact.id.toString()) || blockedIds.includes(contact.id)) {
                Alert.alert('Already blocked', `${contact.name} is already in your blocked contacts list.`);
                return;
            }

            Alert.alert(
                `Block ${contact.name}?`,
                'Blocked contacts will no longer be able to call you or send you messages.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Block',
                        style: 'destructive',
                        onPress: () => {
                            blockedIds.push(contact.id.toString());
                            DeviceEventEmitter.emit('userBlocked', contact.id);
                            Alert.alert('Blocked', `${contact.name} has been blocked.`, [
                                {
                                    text: 'OK',
                                    onPress: () => router.back()
                                }
                            ]);
                        }
                    }
                ]
            );
        } else {
            router.push(`/chat/${contact.id}`);
        }
    };

    const renderContact = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3"
            onPress={() => handleContactPress(item)}
        >
            <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
            <View className="ml-4 flex-1">
                <Text style={{ color: colors.text }} className="text-lg font-bold">{item.name}</Text>
                <Text style={{ color: colors.secondaryText }} className="text-sm" numberOfLines={1}>
                    {item.about}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            {renderHeader()}
            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderContact}
                ListHeaderComponent={renderListHeader}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default SelectContact;
