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
                router.replace('/(tabs)');
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
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        {!successfulCreation
                            ? "Enter your email address and we'll send you a code to reset your password."
                            : "Enter the code sent to your email and your new password."}
                    </Text>
                </View>

                {!successfulCreation ? (
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.secondaryText }]}>Email Address</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="mail-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="email@example.com"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#25D366' }]}
                            onPress={onRequestReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.secondaryText }]}>Verification Code</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="key-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                <TextInput
                                    value={code}
                                    placeholder="Code from email"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(code) => setCode(code)}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.secondaryText }]}>New Password</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                                <TextInput
                                    value={password}
                                    placeholder="New password"
                                    placeholderTextColor={colors.secondaryText}
                                    secureTextEntry
                                    onChangeText={(password) => setPassword(password)}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#25D366' }]}
                            onPress={onResetPress}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginTop: 40,
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#25D366",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
