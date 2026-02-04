import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ForgotPassword() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const colors = useThemeColors();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [loading, setLoading] = useState(false);

    const onRequestReset = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: emailAddress,
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const onResetPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/(tabs)' as any);
            } else {
                console.log(result);
                Alert.alert('Error', 'Something went wrong. Please try again.');
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.background }}
        >
            <View className="flex-1 p-6">
                <TouchableOpacity className="mt-10 mb-5" onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View className="mb-10">
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Reset Password</Text>
                    <Text className="text-base leading-6" style={{ color: colors.secondaryText }}>
                        {!successfulCreation
                            ? "Enter your email address and we'll send you a code to reset your password."
                            : "Enter the code sent to your email and your new password."}
                    </Text>
                </View>

                {!successfulCreation ? (
                    <View className="gap-5">
                        <View className="gap-2">
                            <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Email Address</Text>
                            <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <Ionicons name="mail-outline" size={20} color={colors.secondaryText} className="mr-3" />
                                <TextInput
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="email@example.com"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                                    className="flex-1 text-base"
                                    style={{ color: colors.text }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            className="h-14 rounded-xl justify-center items-center mt-2 elevation-5"
                            style={{ backgroundColor: '#25D366', shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                            onPress={onRequestReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg font-bold">Send Reset Code</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-5">
                        <View className="gap-2">
                            <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Verification Code</Text>
                            <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <Ionicons name="key-outline" size={20} color={colors.secondaryText} className="mr-3" />
                                <TextInput
                                    value={code}
                                    placeholder="Code from email"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(code) => setCode(code)}
                                    className="flex-1 text-base text-center text-2xl tracking-[8px]"
                                    style={{ color: colors.text }}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        <View className="gap-2">
                            <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>New Password</Text>
                            <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} className="mr-3" />
                                <TextInput
                                    value={password}
                                    placeholder="New password"
                                    placeholderTextColor={colors.secondaryText}
                                    secureTextEntry
                                    onChangeText={(password) => setPassword(password)}
                                    className="flex-1 text-base"
                                    style={{ color: colors.text }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            className="h-14 rounded-xl justify-center items-center mt-2 elevation-5"
                            style={{ backgroundColor: '#25D366', shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                            onPress={onResetPress}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg font-bold">Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
