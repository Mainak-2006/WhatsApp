import { View, Text, Image, TouchableOpacity, TextInput, Modal, Alert, DeviceEventEmitter } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { chat, blockedIds, reportedIds } from '../../data/DemoChat'
import { useThemeColors } from '../../hooks/useThemeColors'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ChatScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const [menuVisible, setMenuVisible] = useState(false)

  const contact = chat.find(c => c.id.toString() === id)

  const handleReport = () => {
    setMenuVisible(false)
    Alert.alert(
      `Report ${contact?.name}?`,
      'The last 5 messages from this contact will be forwarded to WhatsApp. This contact will not be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            const userId = id?.toString()
            if (!reportedIds.includes(userId) && !reportedIds.includes(id as any)) {
              reportedIds.push(userId)
            }
            Alert.alert('Reported', 'Thank you for your report. We will review it shortly.')
            // Optionally block after reporting
            Alert.alert(
              'Block contact?',
              'Do you also want to block this contact and delete this chat\'s messages?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    if (!blockedIds.includes(userId) && !blockedIds.includes(id as any)) {
                      blockedIds.push(userId)
                    }
                    DeviceEventEmitter.emit('userBlocked', contact?.id)
                    Alert.alert('Blocked', `${contact?.name} has been blocked.`)
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleBlock = () => {
    setMenuVisible(false)
    const userId = id?.toString()
    const isBlocked = blockedIds.includes(userId) || blockedIds.includes(id as any)

    if (isBlocked) {
      const index = blockedIds.findIndex(bid => bid === userId || bid === id)
      if (index > -1) blockedIds.splice(index, 1)
      DeviceEventEmitter.emit('userUnblocked', contact?.id)
      Alert.alert('Unblocked', `${contact?.name} has been unblocked.`)
    } else {
      Alert.alert(
        `Block ${contact?.name}?`,
        'Blocked contacts will no longer be able to call you or send you messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => {
              if (!blockedIds.includes(userId) && !blockedIds.includes(id as any)) {
                blockedIds.push(userId)
              }
              DeviceEventEmitter.emit('userBlocked', contact?.id)
              Alert.alert('Blocked', `${contact?.name} has been blocked.`)
            }
          }
        ]
      )
    }
  }

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
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
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

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View className="absolute top-16 right-4 rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: colors.background, minWidth: 200 }}>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => {
                setMenuVisible(false)
                router.push({ pathname: '/profile/[id]', params: { id: contact.id.toString() } })
              }}
            >
              <Ionicons name="person-circle-outline" size={20} color={colors.text} />
              <Text style={{ color: colors.text }} className="ml-3 text-base">View contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={handleBlock}
            >
              <MaterialCommunityIcons name="block-helper" size={20} color="#ff3b30" />
              <Text style={{ color: '#ff3b30' }} className="ml-3 text-base">
                {blockedIds.includes(id?.toString()) || blockedIds.includes(id as any) ? 'Unblock' : 'Block'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={handleReport}
            >
              <MaterialCommunityIcons name="thumb-down" size={20} color="#ff3b30" />
              <Text style={{ color: '#ff3b30' }} className="ml-3 text-base">Report contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default ChatScreen