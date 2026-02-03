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
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: '#25D366' }]}>
                        <Ionicons name="chatbubbles" size={40} color="white" />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        Sign in to continue your conversations
                    </Text>
                </View>

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

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.secondaryText }]}>Password</Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                            <TextInput
                                value={password}
                                placeholder="Your password"
                                placeholderTextColor={colors.secondaryText}
                                secureTextEntry={!showPassword}
                                onChangeText={(password) => setPassword(password)}
                                style={[styles.input, { color: colors.text }]}
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
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: '#25D366' }]}>Forgot password?</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#25D366' }]}
                        onPress={onSignInPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.secondaryText }]}>Don't have an account? </Text>
                        <Link href={"/(auth)/sign-up" as any} asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: '#25D366' }]}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
