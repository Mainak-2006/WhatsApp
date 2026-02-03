import { View, Text } from 'react-native'
import React from 'react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const update = () => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View  className="px-4 pt-4">
        <Text style={{ color: colors.text }} className="text-2xl font-bold">WhatsApp Status</Text>
    </View>
    </View>
  )
}

export default update