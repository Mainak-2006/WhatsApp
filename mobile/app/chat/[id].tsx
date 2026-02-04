import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { chat } from '../../data/DemoChat'
import { useThemeColors } from '../../hooks/useThemeColors'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ChatScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()

  const contact = chat.find(c => c.id.toString() === id)

  if (!contact) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>Contact not found</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.chatBackground || '#E5E5E5', paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center px-2 py-2 shadow-sm"
        style={{ backgroundColor: colors.background, elevation: 4 }}
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mr-1">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Image source={{ uri: contact.image }} className="w-9 h-9 rounded-full ml-1" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 ml-2" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: contact.id.toString() } })}>
            <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
              {contact.name}
            </Text>
            <Text style={{ color: colors.secondaryText }} className="text-xs" numberOfLines={1}>
              last seen {contact.time}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-4 mr-2">
          <TouchableOpacity>
            <Ionicons name="videocam" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="call" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Background / Messages Area */}
      <View className="flex-1 px-4">
        {/* Date bubble */}
        <View className="items-center my-4">
          <View className="bg-[#E9EDEF] dark:bg-[#1F2C34] px-3 py-1.5 rounded-lg shadow-sm">
            <Text className="text-xs text-[#54656F] dark:text-[#8696A0]">Today</Text>
          </View>
        </View>

        {/* Encryption notice */}
        <View className="items-center mb-6 px-8">
          <View className="bg-[#FAE69E] dark:bg-[#1F2C34] px-3 py-2 rounded-lg items-center">
            <Text style={{ color: colors.secondaryText, textAlign: 'center', fontSize: 11 }}>
              Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.
            </Text>
          </View>
        </View>

        {/* Dummy received message */}
        <View className="self-start max-w-[80%] mb-2">
          <View className="bg-white dark:bg-[#202C33] p-2 rounded-lg rounded-tl-none shadow-sm">
            <Text style={{ color: colors.text }} className="text-base">{contact.message}</Text>
            <Text style={{ color: colors.secondaryText }} className="text-[10px] self-end mt-1">{contact.time}</Text>
          </View>
        </View>
      </View>

      {/* Input Area */}
      <View className="flex-row items-end px-2 py-2" style={{ marginBottom: 4 }}>
        <View className="flex-1 flex-row items-center bg-white dark:bg-[#202C33] rounded-3xl px-3 py-2 shadow-sm mr-2 min-h-[45px]">
          <TouchableOpacity className="mr-2">
            <MaterialCommunityIcons name="emoticon-outline" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
          <TextInput
            placeholder="Message"
            placeholderTextColor={colors.secondaryText}
            style={{ color: colors.text, flex: 1, fontSize: 16, maxHeight: 100 }}
            multiline
          />
          <TouchableOpacity className="ml-2">
            <MaterialCommunityIcons name="paperclip" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity className="ml-3">
            <Ionicons name="camera" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="w-12 h-12 rounded-full justify-center items-center shadow-sm"
          style={{ backgroundColor: '#00A884' }}
        >
          <MaterialCommunityIcons name="microphone" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChatScreen