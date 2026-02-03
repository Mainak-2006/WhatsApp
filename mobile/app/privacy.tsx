import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

const PrivacyItem = ({ title, value, description, onPress, icon }: any) => {
    const colors = useThemeColors();
    return (
        <TouchableOpacity
            className="px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={onPress}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <Text style={{ color: colors.text }} className="text-[17px] font-normal">{title}</Text>
                    {description ? (
                        <Text style={{ color: colors.secondaryText }} className="text-[14px] mt-1">{description}</Text>
                    ) : value ? (
                        <Text style={{ color: colors.primary }} className="text-[14px] mt-1">{value}</Text>
                    ) : null}
                </View>
                {icon ? icon : <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />}
            </View>
        </TouchableOpacity>
    );
};

export default function PrivacyScreen() {
    const colors = useThemeColors();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerTitle: 'Privacy',
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

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    <Text style={{ color: colors.secondaryText }} className="text-sm font-medium uppercase text-[12px] tracking-wider mb-2">Who can see my personal info</Text>
                </View>

                <PrivacyItem title="Last seen and online" value="Everyone" />
                <PrivacyItem title="Profile photo" value="Everyone" />
                <PrivacyItem title="About" value="Everyone" />
                <PrivacyItem title="Status" value="My contacts" />

                <View className="px-4 py-4 flex-row items-center justify-between border-b" style={{ borderBottomColor: colors.border }}>
                    <View className="flex-1 mr-4">
                        <Text style={{ color: colors.text }} className="text-[17px]">Read receipts</Text>
                        <Text style={{ color: colors.secondaryText }} className="text-[14px] mt-1">If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.</Text>
                    </View>
                    <View className="w-12 h-6 bg-[#00A884]/20 rounded-full items-end justify-center px-1">
                        <View className="w-4 h-4 rounded-full bg-[#00A884]" />
                    </View>
                </View>

                <View className="h-5" />

                <View className="p-4">
                    <Text style={{ color: colors.secondaryText }} className="text-sm font-medium uppercase text-[12px] tracking-wider mb-2">Disappearing messages</Text>
                </View>
                <PrivacyItem title="Default message timer" description="Start new chats with disappearing messages set to your timer" value="Off" />

                <View className="h-5" />

                <PrivacyItem
                    title="Blocked contacts"
                    value="None"
                    onPress={() => router.push('/blocked-contacts' as any)}
                />
                <PrivacyItem title="Fingerprint lock" value="Disabled" />

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
