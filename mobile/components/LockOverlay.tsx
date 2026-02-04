import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { authenticateBiometric, getAppPin, AppLockSettings } from '../utils/lock-utils';

interface LockOverlayProps {
    settings: AppLockSettings;
    onUnlock: () => void;
}

export default function LockOverlay({ settings, onUnlock }: LockOverlayProps) {
    const colors = useThemeColors();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [showPinInput, setShowPinInput] = useState(settings.lockType === 'pin');
    const shakeAnimation = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (settings.lockType === 'biometric' && !showPinInput) {
            handleBiometricAuth();
        }
    }, []);

    const handleBiometricAuth = async () => {
        const success = await authenticateBiometric();
        if (success) {
            onUnlock();
        } else {
            setShowPinInput(true);
        }
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const handlePinSubmit = async (enteredPin: string) => {
        const savedPin = await getAppPin();
        if (enteredPin === savedPin) {
            onUnlock();
        } else {
            setPin('');
            setError(true);
            shake();
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <View
            className="absolute inset-0 z-[9999] justify-center items-center"
            style={{ backgroundColor: colors.background }}
        >
            <View className="items-center mb-12">
                <View className="w-20 h-20 bg-[#00A884] rounded-full items-center justify-center mb-6">
                    <MaterialIcons name="lock" size={40} color="white" />
                </View>
                <Text style={{ color: colors.text }} className="text-2xl font-bold">WhatsApp Locked</Text>
            </View>

            {showPinInput ? (
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }], width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: colors.secondaryText }} className="mb-6">Enter PIN to unlock</Text>
                    <View className="flex-row gap-4 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <View
                                key={i}
                                className="w-4 h-4 rounded-full border-2"
                                style={{
                                    borderColor: error ? '#ef4444' : colors.primary,
                                    backgroundColor: pin.length > i ? (error ? '#ef4444' : colors.primary) : 'transparent'
                                }}
                            />
                        ))}
                    </View>

                    <View className="w-[300px] flex-row flex-wrap justify-center gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'empty', 0, 'back'].map((num, i) => {
                            if (num === 'empty') return <View key={i} className="w-16 h-16" />;
                            if (num === 'back') return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setPin(pin.slice(0, -1))}
                                    className="w-16 h-16 items-center justify-center"
                                >
                                    <Ionicons name="backspace-outline" size={28} color={colors.text} />
                                </TouchableOpacity>
                            );
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        if (pin.length < 4) {
                                            const newPin = pin + num;
                                            setPin(newPin);
                                            if (newPin.length === 4) handlePinSubmit(newPin);
                                        }
                                    }}
                                    style={{ backgroundColor: colors.border }}
                                    className="w-16 h-16 rounded-full items-center justify-center"
                                >
                                    <Text style={{ color: colors.text }} className="text-2xl font-semibold">{num}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {settings.lockType === 'biometric' && (
                        <TouchableOpacity
                            onPress={handleBiometricAuth}
                            className="mt-10"
                        >
                            <MaterialIcons name="fingerprint" size={40} color={colors.primary} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => Alert.alert("Forgot PIN?", "If you've forgotten your PIN, you'll need to log out and log back in to reset it. This will delete all your local settings.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Log Out", style: "destructive", onPress: () => {
                                    // We'd need to trigger logout here, but since this is an overlay, 
                                    // it might be better to just inform them for now.
                                }
                            }
                        ])}
                        className="mt-6"
                    >
                        <Text style={{ color: colors.secondaryText }} className="text-sm">Forgot PIN?</Text>
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <TouchableOpacity
                    onPress={handleBiometricAuth}
                    className="items-center"
                >
                    <MaterialIcons name="fingerprint" size={60} color={colors.primary} />
                    <Text style={{ color: colors.primary }} className="mt-4 text-lg font-medium">Tap to open</Text>

                    <TouchableOpacity
                        onPress={() => setShowPinInput(true)}
                        className="mt-8"
                    >
                        <Text style={{ color: colors.secondaryText }} className="text-base">Use PIN instead</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        </View>
    );
}
