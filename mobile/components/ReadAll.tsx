import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useColorScheme } from 'react-native';

interface ReadAllProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ReadAll: React.FC<ReadAllProps> = ({ visible, onClose, onConfirm }) => {
    const colors = useThemeColors();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // WhatsApp's signature green color for actions
    const actionGreen = '#00A884';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-center items-center px-8 bg-black/50">
                    <TouchableWithoutFeedback>
                        <View
                            className="w-full max-w-[320px] rounded-[28px] p-6 shadow-2xl"
                            style={{
                                backgroundColor: isDark ? '#233138' : '#FFFFFF',
                                elevation: 24
                            }}
                        >
                            <Text
                                className="text-[17px] font-normal mb-8 leading-6"
                                style={{ color: colors.text }}
                            >
                                Mark all chats as read?
                            </Text>

                            <View className="flex-row justify-end gap-x-2">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="px-3 py-2 active:bg-black/5 dark:active:bg-white/5 rounded-lg"
                                >
                                    <Text className="text-sm font-semibold" style={{ color: actionGreen }}>
                                        CANCEL
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="px-3 py-2 active:bg-black/5 dark:active:bg-white/5 rounded-lg"
                                >
                                    <Text className="text-sm font-semibold" style={{ color: actionGreen }}>
                                        READ ALL
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ReadAll;
