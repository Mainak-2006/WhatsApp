import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const colors = useThemeColors();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Email is now required for verification
    const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && countryCode.trim() !== '' && phoneNumber.trim() !== '' && password.trim() !== '' && emailAddress.trim() !== '';

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const signUpParams: any = {
                firstName,
                lastName,
                emailAddress,
                password,
                // Store phone number in metadata to avoid "unsupported country code" error
                unsafeMetadata: {
                    phoneNumber: `${countryCode}${phoneNumber}`,
                }
            };

            await signUp.create(signUpParams);
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'An error occurred during sign up');
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/(tabs)' as any);
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
                Alert.alert('Status', 'Sign up incomplete, please check your information');
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <View className="flex-1 p-6 justify-center" style={{ backgroundColor: colors.background }}>
                <View className="items-center mb-10">
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Verify Email</Text>
                    <Text className="text-base text-center" style={{ color: colors.secondaryText }}>
                        We've sent a verification code to {emailAddress}
                    </Text>
                </View>

                <View className="gap-4">
                    <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                        <TextInput
                            value={code}
                            placeholder="Verification Code"
                            placeholderTextColor={colors.secondaryText}
                            onChangeText={(code) => setCode(code)}
                            className="flex-1 text-center text-2xl tracking-[8px]"
                            style={{ color: colors.text }}
                            keyboardType="number-pad"
                        />
                    </View>

                    <TouchableOpacity
                        className="h-14 rounded-xl justify-center items-center mt-2 elevation-5"
                        style={{ backgroundColor: '#25D366', shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                        onPress={onPressVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Verify Email</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Create Account</Text>
                    <Text className="text-base text-center" style={{ color: colors.secondaryText }}>
                        Join the community and start chatting
                    </Text>
                </View>

                <View className="gap-4">
                    <View className="flex-row gap-3">
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>First Name</Text>
                            <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <TextInput
                                    value={firstName}
                                    placeholder="John"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(val) => setFirstName(val)}
                                    className="flex-1 text-base"
                                    style={{ color: colors.text }}
                                />
                            </View>
                        </View>
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Last Name</Text>
                            <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <TextInput
                                    value={lastName}
                                    placeholder="Doe"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(val) => setLastName(val)}
                                    className="flex-1 text-base"
                                    style={{ color: colors.text }}
                                />
                            </View>
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Phone Number</Text>
                        <View className="flex-row gap-3">
                            <View className="w-24 flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <TextInput
                                    value={countryCode}
                                    placeholder="+91"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={setCountryCode}
                                    className="flex-1 text-base text-center"
                                    style={{ color: colors.text }}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View className="flex-1 flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                                <Ionicons name="call-outline" size={20} color={colors.secondaryText} className="mr-3" />
                                <TextInput
                                    value={phoneNumber}
                                    placeholder="1234567890"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={setPhoneNumber}
                                    className="flex-1 text-base"
                                    style={{ color: colors.text }}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-semibold ml-1" style={{ color: colors.secondaryText }}>Email Address</Text>
                        <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ borderColor: colors.border }}>
                            <Ionicons name="mail-outline" size={20} color={colors.secondaryText} className="mr-3" />
                            <TextInput
                                autoCapitalize="none"
                                value={emailAddress}
                                placeholder="email@example.com"
                                placeholderTextColor={colors.secondaryText}
                                onChangeText={(val) => setEmailAddress(val)}
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
                                placeholder="Choose a password"
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
                        style={{
                            backgroundColor: isFormValid ? '#25D366' : '#A0A0A0',
                            shadowColor: isFormValid ? "#25D366" : "transparent",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            opacity: isFormValid ? 1 : 0.7
                        }}
                        onPress={onSignUpPress}
                        disabled={loading || !isFormValid}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-5">
                        <Text className="text-sm" style={{ color: colors.secondaryText }}>Already have an account? </Text>
                        <Link href={"/(auth)/sign-in" as any} asChild>
                            <TouchableOpacity>
                                <Text className="text-sm font-bold" style={{ color: '#25D366' }}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
