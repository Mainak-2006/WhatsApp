import { View, Text, FlatList, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { chat } from '../../data/DemoChat'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useRouter } from 'expo-router'

const index = () => {
  const insets = useSafeAreaInsets()
  // Add simulated unreadCount to some chats
  const [chats, setChats] = useState(
    chat.map((c, index) => ({ ...c, unreadCount: index < 3 ? index + 1 : 0, isBlocked: false }))
  );
  const colors = useThemeColors();
  const router = useRouter();

  React.useEffect(() => {
    const readAllSub = DeviceEventEmitter.addListener('readAll', () => {
      setChats(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
    });

    const blockSub = DeviceEventEmitter.addListener('userBlocked', (id) => {
      setChats(prev => prev.map(c => c.id === id ? { ...c, isBlocked: true } : c));
    });

    const unblockSub = DeviceEventEmitter.addListener('userUnblocked', (id) => {
      setChats(prev => prev.map(c => c.id === id ? { ...c, isBlocked: false } : c));
    });

    return () => {
      readAllSub.remove();
      blockSub.remove();
      unblockSub.remove();
    };
  }, []);

  return (
    <View style={{ backgroundColor: colors.background }} className='flex-1'>
      <FlatList
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        data={chats}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border
            }}
            className='p-4 ml-2 border-b flex-row items-center'
          >
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id.toString() } })}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.image }} className='w-14 h-14 rounded-full' />
            </TouchableOpacity>

            <TouchableOpacity
              className='ml-3 flex-1'
              onPress={() => {/* Navigate to chat room */ }}
            >
              <View className='flex-row justify-between items-center'>
                <Text style={{ color: colors.text }} className='font-bold text-lg'>{item.name}</Text>
                {item.isBlocked && (
                  <View className="bg-red-500/10 px-2 py-0.5 rounded">
                    <Text className="text-red-500 text-[10px] font-bold">BLOCKED</Text>
                  </View>
                )}
                <Text style={{ color: colors.secondaryText }} className='text-sm'>{item.time}</Text>
              </View>
              <View className='flex-row justify-between items-center'>
                <Text style={{ color: colors.secondaryText }} className='text-base truncate flex-1' numberOfLines={1}>
                  {item.isBlocked ? "🚫 You blocked this contact" : item.message}
                </Text>
                {item.unreadCount > 0 && (
                  <View
                    style={{ backgroundColor: '#00A884' }} // WhatsApp Green
                    className='rounded-full min-w-[22px] h-[22px] justify-center items-center ml-2'
                  >
                    <Text className='text-white text-[10px] font-bold px-1'>
                      {item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

export default index
