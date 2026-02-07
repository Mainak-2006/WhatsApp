import React from 'react';
import { View, Text, TouchableOpacity, DeviceEventEmitter, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MaterialTopTabs } from '../../components/MaterialTopTabs';
import DropDownMenu from '../../components/DropDownMenu';
import ReadAll from '../../components/ReadAll';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [readAllVisible, setReadAllVisible] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleReadAll = () => {
    setMenuVisible(false);
    setReadAllVisible(true);
  };

  const confirmReadAll = () => {
    DeviceEventEmitter.emit('readAll');
    setReadAllVisible(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    DeviceEventEmitter.emit('searchQueryChanged', text);
  };

  const toggleSearch = () => {
    if (isSearching) {
      handleSearchChange('');
    }
    setIsSearching(!isSearching);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* WhatsApp Header */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }} className="px-4 py-3 mt-4 flex-row justify-between items-center h-20">
        {isSearching ? (
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={toggleSearch} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.secondaryText}
              className="flex-1 text-lg"
              style={{ color: colors.text }}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <Text style={{ color: colors.text }} className="text-2xl font-bold">WhatsApp</Text>
            <View className="flex-row items-center gap-5">
              <TouchableOpacity activeOpacity={0.7}>
                <MaterialIcons name="photo-camera" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={toggleSearch}>
                <Ionicons name="search" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setMenuVisible(true)}>
                <MaterialIcons name="more-vert" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <DropDownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReadAll={handleReadAll}
      />

      <ReadAll
        visible={readAllVisible}
        onClose={() => setReadAllVisible(false)}
        onConfirm={confirmReadAll}
      />

      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondaryText,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            textTransform: 'none',
          },
        }}>
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Chats',
          }}
        />
        <MaterialTopTabs.Screen
          name="group"
          options={{
            title: 'Group',
          }}
        />
        <MaterialTopTabs.Screen
          name="update"
          options={{
            title: 'Update',
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}

