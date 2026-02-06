import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useThemeColors } from '../hooks/useThemeColors'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'

const STATUS_COLORS = [
    { name: 'Purple Dream', colors: ['#667eea', '#764ba2'] },
    { name: 'Pink Sunset', colors: ['#f093fb', '#f5576c'] },
    { name: 'Ocean Blue', colors: ['#4facfe', '#00f2fe'] },
    { name: 'Sunset', colors: ['#fa709a', '#fee140'] },
    { name: 'Green Energy', colors: ['#43e97b', '#38f9d7'] },
    { name: 'Fire', colors: ['#f857a6', '#ff5858'] },
    { name: 'Night Sky', colors: ['#2c3e50', '#3498db'] },
    { name: 'Peach', colors: ['#ffecd2', '#fcb69f'] },
] as const;

const CreateStatus = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [statusType, setStatusType] = useState<'text' | 'image'>('text');
    const [textContent, setTextContent] = useState('');
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setStatusType('image');
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setStatusType('image');
        }
    };

    const handlePost = () => {
        if (statusType === 'text' && !textContent.trim()) {
            Alert.alert('Empty status', 'Please enter some text for your status.');
            return;
        }

        if (statusType === 'image' && !selectedImage) {
            Alert.alert('No image', 'Please select an image for your status.');
            return;
        }

        // Here you would typically save the status to your backend
        Alert.alert(
            'Status posted!',
            'Your status has been posted successfully.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View
                style={{
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                }}
                className="border-b"
            >
                <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text }} className="text-xl font-semibold">
                            Create Status
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handlePost}
                        className="px-4 py-2 rounded-full"
                        style={{ backgroundColor: '#00A884' }}
                    >
                        <Text className="text-white font-semibold">Post</Text>
                    </TouchableOpacity>
                </View>

                {/* Type Selector */}
                <View className="flex-row px-4 pb-4 gap-3">
                    <TouchableOpacity
                        onPress={() => setStatusType('text')}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={{
                            backgroundColor: statusType === 'text' ? '#00A884' : colors.card,
                        }}
                    >
                        <Text
                            style={{ color: statusType === 'text' ? 'white' : colors.text }}
                            className="font-semibold"
                        >
                            Text
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setStatusType('image')}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={{
                            backgroundColor: statusType === 'image' ? '#00A884' : colors.card,
                        }}
                    >
                        <Text
                            style={{ color: statusType === 'image' ? 'white' : colors.text }}
                            className="font-semibold"
                        >
                            Image
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {statusType === 'text' ? (
                    <View className="flex-1">
                        {/* Preview */}
                        <View className="aspect-[9/16] mx-4 mt-4 rounded-2xl overflow-hidden">
                            <LinearGradient
                                colors={STATUS_COLORS[selectedColorIndex].colors}
                                className="flex-1 items-center justify-center p-8"
                            >
                                <Text className="text-white text-2xl font-bold text-center">
                                    {textContent || 'Type your status...'}
                                </Text>
                            </LinearGradient>
                        </View>

                        {/* Text Input */}
                        <View className="px-4 mt-6">
                            <Text style={{ color: colors.text }} className="font-semibold mb-2">
                                Your Status
                            </Text>
                            <TextInput
                                value={textContent}
                                onChangeText={setTextContent}
                                placeholder="What's on your mind?"
                                placeholderTextColor={colors.secondaryText}
                                multiline
                                maxLength={200}
                                style={{
                                    color: colors.text,
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                }}
                                className="border rounded-xl p-4 min-h-[120px] text-base"
                            />
                            <Text style={{ color: colors.secondaryText }} className="text-xs mt-1 text-right">
                                {textContent.length}/200
                            </Text>
                        </View>

                        {/* Color Picker */}
                        <View className="px-4 mt-6">
                            <Text style={{ color: colors.text }} className="font-semibold mb-3">
                                Background Color
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-3">
                                    {STATUS_COLORS.map((color, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setSelectedColorIndex(index)}
                                            className="items-center"
                                        >
                                            <LinearGradient
                                                colors={color.colors}
                                                className="w-16 h-16 rounded-full items-center justify-center"
                                            >
                                                {selectedColorIndex === index && (
                                                    <Ionicons name="checkmark" size={32} color="white" />
                                                )}
                                            </LinearGradient>
                                            <Text
                                                style={{ color: colors.secondaryText }}
                                                className="text-xs mt-1 text-center w-20"
                                                numberOfLines={1}
                                            >
                                                {color.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                ) : (
                    <View className="flex-1">
                        {/* Image Preview */}
                        {selectedImage ? (
                            <View className="aspect-[9/16] mx-4 mt-4 rounded-2xl overflow-hidden">
                                <Image
                                    source={{ uri: selectedImage }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="aspect-[9/16] mx-4 mt-4 rounded-2xl overflow-hidden">
                                <View
                                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                    className="flex-1 items-center justify-center border-2 border-dashed"
                                >
                                    <Ionicons name="images-outline" size={64} color={colors.secondaryText} />
                                    <Text style={{ color: colors.text }} className="text-lg font-semibold mt-4">
                                        No image selected
                                    </Text>
                                    <Text style={{ color: colors.secondaryText }} className="text-sm mt-2">
                                        Choose an option below
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Image Options */}
                        <View className="px-4 mt-6 gap-3">
                            <TouchableOpacity
                                onPress={takePhoto}
                                className="flex-row items-center p-4 rounded-xl"
                                style={{ backgroundColor: colors.card }}
                            >
                                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#00A884' }}>
                                    <MaterialIcons name="photo-camera" size={24} color="white" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text style={{ color: colors.text }} className="font-semibold text-base">
                                        Take Photo
                                    </Text>
                                    <Text style={{ color: colors.secondaryText }} className="text-sm">
                                        Use your camera to capture a moment
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={pickImage}
                                className="flex-row items-center p-4 rounded-xl"
                                style={{ backgroundColor: colors.card }}
                            >
                                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#00A884' }}>
                                    <Ionicons name="images" size={24} color="white" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text style={{ color: colors.text }} className="font-semibold text-base">
                                        Choose from Gallery
                                    </Text>
                                    <Text style={{ color: colors.secondaryText }} className="text-sm">
                                        Select an image from your photos
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default CreateStatus;
