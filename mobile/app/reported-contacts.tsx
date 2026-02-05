import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { chat, reportedIds } from '../data/DemoChat';

const ReportedContacts = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [reportedContacts, setReportedContacts] = useState<any[]>([]);

    useEffect(() => {
        // Filter contacts that are in the reportedIds array
        const reported = chat.filter(c =>
            reportedIds.includes(c.id.toString()) || reportedIds.includes(c.id)
        );
        setReportedContacts(reported);
    }, []);

    const handleUnreport = (contactId: any, contactName: string) => {
        Alert.alert(
            'Remove from reported?',
            `Do you want to remove ${contactName} from your reported contacts list?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const userId = contactId.toString();
                        const index = reportedIds.findIndex(id => id === userId || id === contactId);
                        if (index > -1) {
                            reportedIds.splice(index, 1);
                            setReportedContacts(prev => prev.filter(c => c.id !== contactId));
                            Alert.alert('Removed', `${contactName} has been removed from reported contacts.`);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            {/* Header */}
            <View
                className="flex-row items-center px-4 py-3 shadow-sm"
                style={{ backgroundColor: colors.background, elevation: 2 }}
            >
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-xl font-bold">
                        Reported Contacts
                    </Text>
                    <Text style={{ color: colors.secondaryText }} className="text-sm">
                        {reportedContacts.length} {reportedContacts.length === 1 ? 'contact' : 'contacts'}
                    </Text>
                </View>
            </View>

            {/* Info Banner */}
            <View className="px-4 py-3 border-b" style={{ backgroundColor: colors.tabBarBackground, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.secondaryText }} className="text-sm text-center">
                    These contacts have been reported to WhatsApp. They can still send you messages unless you block them.
                </Text>
            </View>

            {/* Reported Contacts List */}
            {reportedContacts.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="shield-checkmark-outline" size={80} color={colors.secondaryText} />
                    <Text style={{ color: colors.text }} className="text-xl font-bold mt-4 text-center">
                        No Reported Contacts
                    </Text>
                    <Text style={{ color: colors.secondaryText }} className="text-base mt-2 text-center">
                        Contacts you report will appear here. You can report contacts from their profile or chat.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={reportedContacts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            className="flex-row items-center px-4 py-3 border-b"
                            style={{ borderBottomColor: colors.border }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id.toString() } })}
                                className="flex-row items-center flex-1"
                            >
                                <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
                                <View className="ml-3 flex-1">
                                    <Text style={{ color: colors.text }} className="text-base font-medium">
                                        {item.name}
                                    </Text>
                                    <View className="flex-row items-center mt-0.5">
                                        <Ionicons name="warning" size={12} color="#ff3b30" />
                                        <Text style={{ color: '#ff3b30' }} className="text-xs ml-1">
                                            Reported
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleUnreport(item.id, item.name)}
                                className="px-3 py-1.5 rounded-md"
                                style={{ backgroundColor: colors.tabBarBackground }}
                            >
                                <Text style={{ color: colors.primary }} className="text-sm font-medium">
                                    Remove
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default ReportedContacts;
