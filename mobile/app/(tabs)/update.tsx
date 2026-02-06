import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { currentUser } from '../../data/DemoChat'
import { statuses } from '../../data/StatusData'

const update = () => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [myStatus, setMyStatus] = useState(null);

  const recentStatuses = statuses.filter(s => s.isRecent);
  const viewedStatuses = statuses.filter(s => !s.isRecent);

  const renderStatusItem = ({ item, isMyStatus = false }: { item: any; isMyStatus?: boolean }) => {
    const hasMultipleStatuses = item.statuses && item.statuses.length > 1;

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/status-viewer/[id]', params: { id: item.id.toString() } } as any)}
        className="flex-row items-center py-3 px-4"
        activeOpacity={0.7}
      >
        <View className="relative">
          {/* Status Ring */}
          <View
            style={{
              borderColor: item.isRecent ? '#00A884' : colors.border,
              borderWidth: 2.5,
            }}
            className="w-16 h-16 rounded-full items-center justify-center"
          >
            <Image
              source={{ uri: item.image }}
              className="w-14 h-14 rounded-full"
            />
          </View>

          {/* Add Status Button for My Status */}
          {isMyStatus && (
            <View
              style={{ backgroundColor: '#00A884', borderColor: colors.background }}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center border-2"
            >
              <MaterialIcons name="add" size={16} color="white" />
            </View>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text style={{ color: colors.text }} className="font-semibold text-base">
            {item.name}
          </Text>
          <Text style={{ color: colors.secondaryText }} className="text-sm mt-0.5">
            {isMyStatus ? 'Tap to add status update' : item.time}
          </Text>
        </View>

        {hasMultipleStatuses && !isMyStatus && (
          <View className="items-center">
            <Text style={{ color: colors.secondaryText }} className="text-xs">
              {item.statuses.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Status Section */}
        <View style={{ borderBottomColor: colors.border }} className="border-b pb-2">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text style={{ color: colors.text }} className="font-semibold text-base">
              My status
            </Text>
          </View>

          {renderStatusItem({
            item: {
              id: 'my-status',
              name: 'My status',
              image: currentUser.image,
              time: myStatus ? (myStatus as any).time : 'Tap to add status update',
              isRecent: false,
              statuses: myStatus ? [myStatus] : []
            },
            isMyStatus: true
          })}
        </View>

        {/* Recent Updates */}
        {recentStatuses.length > 0 && (
          <View style={{ borderBottomColor: colors.border }} className="border-b pb-2">
            <View className="px-4 pt-4 pb-2">
              <Text style={{ color: colors.secondaryText }} className="text-sm font-medium">
                Recent updates
              </Text>
            </View>

            {recentStatuses.map((item) => (
              <View key={item.id}>
                {renderStatusItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Viewed Updates */}
        {viewedStatuses.length > 0 && (
          <View className="pb-4">
            <View className="px-4 pt-4 pb-2">
              <Text style={{ color: colors.secondaryText }} className="text-sm font-medium">
                Viewed updates
              </Text>
            </View>

            {viewedStatuses.map((item) => (
              <View key={item.id}>
                {renderStatusItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {recentStatuses.length === 0 && viewedStatuses.length === 0 && (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons name="images-outline" size={64} color={colors.secondaryText} />
            <Text style={{ color: colors.text }} className="text-lg font-semibold mt-4 text-center">
              No status updates
            </Text>
            <Text style={{ color: colors.secondaryText }} className="text-sm mt-2 text-center">
              Status updates from your contacts will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-6 right-6 items-end gap-3">
        {/* Text Status Button */}
        <TouchableOpacity
          className="w-12 h-12 rounded-full justify-center items-center shadow-lg"
          style={{ backgroundColor: colors.card, elevation: 5 }}
          onPress={() => router.push('/create-status' as any)}
        >
          <MaterialIcons name="edit" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Camera Status Button */}
        <TouchableOpacity
          className="w-14 h-14 rounded-full justify-center items-center shadow-lg"
          style={{ backgroundColor: '#00A884', elevation: 5 }}
          onPress={() => router.push('/create-status' as any)}
        >
          <MaterialIcons name="photo-camera" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default update