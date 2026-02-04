import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { currentUser } from '../data/DemoChat';
import { useAuth, useUser } from '@clerk/clerk-expo';

const SettingsItem = ({ icon, title, description, onPress }: {
  icon: React.ReactNode,
  title: string,
  description?: string,
  onPress?: () => void
}) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5"
      activeOpacity={0.6}
    >
      <View className="w-10 items-center">
        {icon}
      </View>
      <View className="ml-3 flex-1">
        <Text style={{ color: colors.text }} className="text-[17px] font-normal leading-tight">{title}</Text>
        {description && (
          <Text style={{ color: colors.secondaryText }} className="text-[14px] mt-0.5 leading-tight" numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Settings = () => {
  const colors = useThemeColors();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const mainSettings = [
    {
      title: 'Account',
      description: 'Security notifications, change number',
      icon: <MaterialIcons name="key" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Privacy',
      description: 'Block contacts, disappearing messages',
      icon: <MaterialIcons name="lock" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Avatar',
      description: 'Create, edit, profile photo',
      icon: <MaterialCommunityIcons name="face-recognition" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Chats',
      description: 'Theme, wallpapers, chat history',
      icon: <MaterialIcons name="chat" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Notifications',
      description: 'Message, group & call tones',
      icon: <MaterialIcons name="notifications" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Storage and data',
      description: 'Network usage, auto-download',
      icon: <MaterialIcons name="data-usage" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'App language',
      description: "English (phone's language)",
      icon: <MaterialIcons name="language" size={24} color={colors.secondaryText} />,
    },
    {
      title: 'Help',
      description: 'Help center, contact us, privacy policy',
      icon: <MaterialIcons name="help-outline" size={24} color={colors.secondaryText} />,
    },
  ];

  const onLogoutPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in' as any);
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center px-4 py-5 mb-2"
        style={{ borderBottomWidth: 0.5, borderColor: colors.border }}
        onPress={() => router.push({ pathname: '/profile/[id]', params: { id: currentUser.id } })}
      >
        <View className="relative">
          <Image
            source={{ uri: user?.imageUrl || currentUser.image }}
            className="w-16 h-16 rounded-full"
          />
        </View>
        <View className="ml-4 flex-1">
          <Text style={{ color: colors.text }} className="text-xl font-semibold">{user?.fullName || currentUser.name}</Text>
          <Text style={{ color: colors.secondaryText }} className="text-[15px] mt-0.5" numberOfLines={1}>
            {user?.primaryEmailAddress?.emailAddress || currentUser.about}
          </Text>
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* List Items */}
      <View>
        {mainSettings.map((item, index) => (
          <SettingsItem
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onPress={() => {
              if (item.title === 'Privacy') {
                router.push('/privacy' as any);
              } else {
                Alert.alert('Feature incoming', `${item.title} settings will be available soon.`);
              }
            }}
          />
        ))}

        <SettingsItem
          title="Invite a friend"
          icon={<MaterialIcons name="group-add" size={24} color={colors.secondaryText} />}
        />

        <SettingsItem
          title="Log out"
          icon={<MaterialIcons name="logout" size={24} color="#ef4444" />}
          onPress={onLogoutPress}
        />
      </View>

      {/* Branding Footer */}
      <View className="items-center mt-10 pb-12">
        <Text style={{ color: colors.secondaryText }} className="text-[13px] font-medium opacity-100">from</Text>
        <View className="flex-row items-center mt-0.5">
          <MaterialCommunityIcons name="infinity" size={18} color={colors.text} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.text }} className="text-base font-bold tracking-widest">Meta</Text>
        </View>
      </View>

    </ScrollView>
  );
};

export default Settings;
