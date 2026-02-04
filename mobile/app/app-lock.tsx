import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { getAppLockSettings, saveAppLockSettings, setAppPin, checkBiometricsAvailable, AppLockSettings } from '../utils/lock-utils';

export default function AppLockScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const [settings, setSettings] = useState<AppLockSettings>({
        isEnabled: false,
        lockType: 'biometric',
        lockTime: 'immediately',
    });
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [tempPin, setTempPin] = useState('');

    useEffect(() => {
        loadSettings();
        checkBiometrics();
    }, []);

    const loadSettings = async () => {
        const savedSettings = await getAppLockSettings();
        setSettings(savedSettings);
    };

    const checkBiometrics = async () => {
        const { isAvailable } = await checkBiometricsAvailable();
        setBiometricsAvailable(isAvailable);
    };

    const toggleLock = async (value: boolean) => {
        if (value) {
            // Enabling lock
            if (!biometricsAvailable) {
                // If biometrics not available, force PIN setup
                setPinModalVisible(true);
            } else {
                const newSettings = { ...settings, isEnabled: true, lockType: 'biometric' as const };
                setSettings(newSettings);
                await saveAppLockSettings(newSettings);
            }
        } else {
            // Disabling lock
            const newSettings = { ...settings, isEnabled: false };
            setSettings(newSettings);
            await saveAppLockSettings(newSettings);
        }
    };

    const handlePinSetup = async () => {
        if (tempPin.length < 4) {
            Alert.alert('Invalid PIN', 'PIN must be at least 4 digits.');
            return;
        }
        await setAppPin(tempPin);
        const newSettings = { ...settings, isEnabled: true, lockType: 'pin' as const };
        setSettings(newSettings);
        await saveAppLockSettings(newSettings);
        setPinModalVisible(false);
        setTempPin('');
    };

    const setLockTime = async (time: AppLockSettings['lockTime']) => {
        const newSettings = { ...settings, lockTime: time };
        setSettings(newSettings);
        await saveAppLockSettings(newSettings);
    };

    const setLockType = async (type: AppLockSettings['lockType']) => {
        if (type === 'pin') {
            setPinModalVisible(true);
        } else {
            const { isAvailable } = await checkBiometricsAvailable();
            if (!isAvailable) {
                Alert.alert('Biometrics Unavailable', 'Please set up biometrics in your device settings first.');
                return;
            }
            const newSettings = { ...settings, lockType: 'biometric' as const};
            setSettings(newSettings);
            await saveAppLockSettings(newSettings);
        }
    };

    return (
        <View style={{ flex: 1,paddingTop:60, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerTitle: 'App lock',
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: colors.text,
                    },
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-4 bg-transparent">
                    <Text style={{ color: colors.secondaryText }} className="text-[14px] leading-tight">
                        When enabled, you'll need to use biometrics (if available) or a PIN to open WhatsApp. You can still answer calls if WhatsApp is locked.
                    </Text>
                </View>

                <View className="px-4 py-4 flex-row items-center justify-between border-b" style={{ borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.text }} className="text-[17px]">Unlock with biometric/PIN</Text>
                    <Switch
                        value={settings.isEnabled}
                        onValueChange={toggleLock}
                        trackColor={{ false: colors.border, true: '#00A884' }}
                    />
                </View>

                {settings.isEnabled && (
                    <>
                        <View className="p-4 pb-2 mt-4">
                            <Text style={{ color: colors.primary }} className="text-sm font-medium uppercase text-[12px] tracking-wider">Lock type</Text>
                        </View>

                        <TouchableOpacity
                            className="px-4 py-4 flex-row items-center justify-between border-b"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => setLockType('biometric')}
                        >
                            <Text style={{ color: colors.text }} className="text-[17px]">Biometric (Fingerprint/Face)</Text>
                            {settings.lockType === 'biometric' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-4 py-4 flex-row items-center justify-between border-b"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => setLockType('pin')}
                        >
                            <Text style={{ color: colors.text }} className="text-[17px]">PIN Lock</Text>
                            {settings.lockType === 'pin' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <View className="p-4 pb-2 mt-4">
                            <Text style={{ color: colors.primary }} className="text-sm font-medium uppercase text-[12px] tracking-wider">Automatically lock</Text>
                        </View>

                        <TouchableOpacity
                            className="px-4 py-4 flex-row items-center justify-between border-b"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => setLockTime('immediately')}
                        >
                            <Text style={{ color: colors.text }} className="text-[17px]">Immediately</Text>
                            {settings.lockTime === 'immediately' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-4 py-4 flex-row items-center justify-between border-b"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => setLockTime('1min')}
                        >
                            <Text style={{ color: colors.text }} className="text-[17px]">After 1 minute</Text>
                            {settings.lockTime === '1min' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-4 py-4 flex-row items-center justify-between"
                            onPress={() => setLockTime('30min')}
                        >
                            <Text style={{ color: colors.text }} className="text-[17px]">After 30 minutes</Text>
                            {settings.lockTime === '30min' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <Modal
                visible={pinModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View style={{ backgroundColor: colors.background }} className="w-full rounded-2xl p-6">
                        <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Set PIN Lock</Text>
                        <Text style={{ color: colors.secondaryText }} className="mb-6">Enter a 4-digit PIN to lock your WhatsApp.</Text>

                        <TextInput
                            style={{
                                color: colors.text,
                                backgroundColor: colors.border,
                                textAlign: 'center',
                                fontSize: 24,
                                letterSpacing: 10
                            }}
                            className="w-full h-14 rounded-xl mb-6"
                            placeholder="0000"
                            placeholderTextColor={colors.secondaryText}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry={true}
                            value={tempPin}
                            onChangeText={setTempPin}
                            autoFocus={true}
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => {
                                    setPinModalVisible(false);
                                    setTempPin('');
                                    if (!settings.isEnabled) toggleLock(false);
                                }}
                                className="mr-6"
                            >
                                <Text style={{ color: colors.secondaryText }} className="text-base font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePinSetup}>
                                <Text style={{ color: colors.primary }} className="text-base font-bold">Save PIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
