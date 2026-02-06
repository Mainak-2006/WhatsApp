import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

interface DropDownMenuProps {
    visible: boolean;
    onClose: () => void;
    onReadAll: () => void;
}

const DropDownMenu: React.FC<DropDownMenuProps> = ({ visible, onClose, onReadAll }) => {
    const colors = useThemeColors();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const isDark = colorScheme === 'dark';

    const menuItems = [
        { label: "New group", onPress: () => { router.push('/new-group' as any) } },
        { label: "Status privacy", onPress: () => { router.push('/status-privacy' as any) } },
        { label: "Linked devices", onPress: () => { } },
        { label: "Starred", onPress: () => { } },
        { label: "Read all", onPress: () => { onReadAll(); } },
        { label: "Settings", onPress: () => { router.push('/settings' as any) } },
    ];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1">
                    <View
                        className="absolute top-12 right-4 rounded-xl py-2 w-56 shadow-2xl"
                        style={{
                            backgroundColor: isDark ? '#233138' : '#FFFFFF',
                            elevation: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                        }}
                    >
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                className="px-5 py-3.5 active:bg-black/10 dark:active:bg-white/10"
                                onPress={() => {
                                    item.onPress();
                                    onClose();
                                }}
                            >
                                <Text
                                    className="text-[17px] font-normal"
                                    style={{ color: colors.text }}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default DropDownMenu;
