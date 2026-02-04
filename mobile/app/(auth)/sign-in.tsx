import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SignIn() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const colors = useThemeColors();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            await setActive({ session: completeSignIn.createdSessionId });
            router.replace('/(tabs)' as any);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'An error occurred during sign in');
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
            <View className="flex-1 p-6 justify-center">
                <View className="items-center mb-10">
                    <View
                        className="w-20 h-20 rounded-2xl justify-center items-center mb-5 elevation-8"
                        style={{ backgroundColor: '#25D366', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }}
                    >
                        <Ionicons name="chatbubbles" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Welcome Back</Text>
                    <Text className="text-base text-center" style={{ color: colors.secondaryText }}>
                        Sign in to continue your conversations
                    </Text>
                </View>

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
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Password</Text>
                        <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} className="mr-3" />
                            <TextInput
                                value={password}
                                placeholder="Your password"
                                placeholderTextColor={colors.secondaryText}
                                secureTextEntry={!showPassword}
                                onChangeText={(password) => setPassword(password)}
                                className="flex-1 text-base"
                                style={{ color: colors.text }}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.secondaryText}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Link href={"/forgot-password" as any} asChild>
                        <TouchableOpacity className="self-end">
                            <Text className="text-sm font-semibold" style={{ color: '#25D366' }}>Forgot password?</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        className="h-14 rounded-xl justify-center items-center mt-2 elevation-5"
                        style={{ backgroundColor: '#25D366', shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                        onPress={onSignInPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-5">
                        <Text className="text-sm" style={{ color: colors.secondaryText }}>Don't have an account? </Text>
                        <Link href={"/(auth)/sign-up" as any} asChild>
                            <TouchableOpacity>
                                <Text className="text-sm font-bold" style={{ color: '#25D366' }}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}