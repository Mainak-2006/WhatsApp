import { View, Text, Image, TouchableOpacity, Dimensions, Animated, PanResponder, StatusBar } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { statuses } from '../../data/StatusData'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

const StatusViewer = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const statusUpdate = statuses.find(s => s.id.toString() === id);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressAnims = useRef(statusUpdate?.statuses.map(() => new Animated.Value(0)) || []).current;
    const currentProgress = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (!statusUpdate) return;

        startProgress();

        return () => {
            currentProgress.current?.stop();
        };
    }, [currentIndex]);

    const startProgress = () => {
        if (!statusUpdate || isPaused) return;

        currentProgress.current = Animated.timing(progressAnims[currentIndex], {
            toValue: 1,
            duration: STORY_DURATION,
            useNativeDriver: false,
        });

        currentProgress.current.start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    };

    const pauseProgress = () => {
        setIsPaused(true);
        currentProgress.current?.stop();
    };

    const resumeProgress = () => {
        setIsPaused(false);
        startProgress();
    };

    const handleNext = () => {
        if (!statusUpdate) return;

        if (currentIndex < statusUpdate.statuses.length - 1) {
            progressAnims[currentIndex].setValue(1);
            setCurrentIndex(currentIndex + 1);
        } else {
            router.back();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            progressAnims[currentIndex].setValue(0);
            setCurrentIndex(currentIndex - 1);
        } else {
            router.back();
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pauseProgress();
            },
            onPanResponderRelease: (_, gestureState) => {
                resumeProgress();

                // Swipe down to close
                if (gestureState.dy > 100) {
                    router.back();
                }
                // Tap left/right to navigate
                else if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
                    if (gestureState.x0 < width / 2) {
                        handlePrevious();
                    } else {
                        handleNext();
                    }
                }
            },
        })
    ).current;

    if (!statusUpdate) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg">Status not found</Text>
            </View>
        );
    }

    const currentStatus = statusUpdate.statuses[currentIndex];

    return (
        <View className="flex-1 bg-black">
            <StatusBar hidden />

            {/* Status Content */}
            <View {...panResponder.panHandlers} className="flex-1">
                {currentStatus.type === 'image' ? (
                    <Image
                        source={{ uri: currentStatus.content }}
                        className="w-full h-full"
                        resizeMode="contain"
                    />
                ) : (
                    <LinearGradient
                        colors={[currentStatus.backgroundColor || '#667eea', '#764ba2']}
                        className="flex-1 items-center justify-center px-8"
                    >
                        <Text className="text-white text-3xl font-bold text-center">
                            {currentStatus.content}
                        </Text>
                    </LinearGradient>
                )}
            </View>

            {/* Top Overlay */}
            <View className="absolute top-0 left-0 right-0">
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    className="pt-12 pb-8 px-4"
                >
                    {/* Progress Bars */}
                    <View className="flex-row gap-1 mb-4">
                        {statusUpdate.statuses.map((_, index) => (
                            <View key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                <Animated.View
                                    style={{
                                        width: progressAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        height: '100%',
                                        backgroundColor: 'white',
                                    }}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <Image
                                source={{ uri: statusUpdate.image }}
                                className="w-10 h-10 rounded-full"
                            />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-semibold text-base">
                                    {statusUpdate.name}
                                </Text>
                                <Text className="text-white/80 text-xs">
                                    {statusUpdate.time}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-8 h-8 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Bottom Overlay - Reply */}
            <View className="absolute bottom-0 left-0 right-0">
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    className="pt-8 pb-8 px-4"
                >
                    <View className="flex-row items-center gap-3">
                        <View className="flex-1 flex-row items-center bg-white/20 rounded-full px-4 py-3">
                            <Text className="text-white/60 flex-1">Reply to status...</Text>
                            <Ionicons name="happy-outline" size={24} color="white" />
                        </View>
                        <TouchableOpacity
                            className="w-12 h-12 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="more-vert" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Tap Areas for Navigation (invisible) */}
            <View className="absolute inset-0 flex-row" pointerEvents="box-none">
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={handlePrevious}
                />
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={handleNext}
                />
            </View>
        </View>
    );
};

export default StatusViewer;
