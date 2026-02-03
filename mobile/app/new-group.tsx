import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { chat } from '../data/DemoChat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Contact {
    id: number;
    name: string;
    message: string;
    image: string;
    time: string;
    about: string;
    phoneNumber: string;
}

const NewGroup = () => {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = useMemo(() => {
        return chat.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phoneNumber.includes(searchQuery)
        );
    }, [searchQuery]);

    const toggleContact = (id: number) => {
        if (selectedContacts.includes(id)) {
            setSelectedContacts(prev => prev.filter(cId => cId !== id));
        } else {
            setSelectedContacts(prev => [...prev, id]);
        }
    };

    const handleNext = () => {
        if (selectedContacts.length > 0) {
            router.push({
                pathname: '/group-details',
                params: { participants: JSON.stringify(selectedContacts) }
            } as any);
        }
    };

    const renderContact = ({ item }: { item: Contact }) => {
        const isSelected = selectedContacts.includes(item.id);
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleContact(item.id)}
                className="flex-row items-center px-4 py-3"
            >
                <View className="relative">
                    <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
                    {isSelected && (
                        <View
                            className="absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-[#0B141A] p-0.5"
                            style={{ backgroundColor: '#00A884' }}
                        >
                            <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                    )}
                </View>
                <View className="ml-4 flex-1">
                    <Text style={{ color: colors.text }} className="text-lg font-semibold">{item.name}</Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm" numberOfLines={1}>{item.about}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSelectedContact = (id: number) => {
        const contact = chat.find(c => c.id === id);
        if (!contact) return null;
        return (
            <View key={id} className="items-center mr-4 w-16">
                <View className="relative">
                    <Image source={{ uri: contact.image }} className="w-12 h-12 rounded-full" />
                    <TouchableOpacity
                        onPress={() => toggleContact(id)}
                        className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-0.5 border-2 border-white dark:border-[#0B141A]"
                    >
                        <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={{ color: colors.text }} className="text-[11px] mt-1 text-center" numberOfLines={1}>
                    {contact.name.split(' ')[0]}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-xl font-bold">New group</Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm">
                        {selectedContacts.length === 0 ? 'Add participants' : `${selectedContacts.length} of ${chat.length} selected`}
                    </Text>
                </View>
                <TouchableOpacity className="ml-4">
                    <Ionicons name="search" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Selected Contacts List */}
            {selectedContacts.length > 0 && (
                <View className="border-b" style={{ borderColor: colors.border }}>
                    <FlatList
                        data={selectedContacts}
                        horizontal
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => renderSelectedContact(item)}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}

            {/* Search Input */}
            <View className="px-4 py-2">
                <View
                    className="flex-row items-center rounded-full px-4 py-1.5"
                    style={{ backgroundColor: colors.border + '40' }}
                >
                    <Ionicons name="search" size={18} color={colors.secondaryText} />
                    <TextInput
                        placeholder="Search name or number"
                        placeholderTextColor={colors.secondaryText}
                        className="ml-2 flex-1 text-base"
                        style={{ color: colors.text }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Contacts List */}
            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderContact}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* FAB */}
            {selectedContacts.length > 0 && (
                <TouchableOpacity
                    className="absolute bottom-8 right-8 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                    style={{ backgroundColor: '#00A884', elevation: 5 }}
                    onPress={handleNext}
                >
                    <Ionicons name="arrow-forward" size={28} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default NewGroup;
