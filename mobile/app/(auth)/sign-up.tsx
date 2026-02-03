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
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress,
                password,
            });

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

            await setActive({ session: completeSignUp.createdSessionId });
            router.replace('/(tabs)' as any);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Alert.alert('Error', err.errors ? err.errors[0].message : 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, padding: 24, justifyContent: 'center' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Verify Email</Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        We've sent a verification code to {emailAddress}
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                        <TextInput
                            value={code}
                            placeholder="Verification Code"
                            placeholderTextColor={colors.secondaryText}
                            onChangeText={(code) => setCode(code)}
                            style={[styles.input, { color: colors.text, textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
                            keyboardType="number-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#25D366' }]}
                        onPress={onPressVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Verify Email</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                    <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        Join the community and start chatting
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.secondaryText }]}>First Name</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <TextInput
                                    value={firstName}
                                    placeholder="John"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(val) => setFirstName(val)}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.secondaryText }]}>Last Name</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <TextInput
                                    value={lastName}
                                    placeholder="Doe"
                                    placeholderTextColor={colors.secondaryText}
                                    onChangeText={(val) => setLastName(val)}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>
                        </View>
                    </View>

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
                                placeholder="Choose a password"
                                placeholderTextColor={colors.secondaryText}
                                secureTextEntry
                                onChangeText={(password) => setPassword(password)}
                                style={[styles.input, { color: colors.text }]}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#25D366' }]}
                        onPress={onSignUpPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.secondaryText }]}>Already have an account? </Text>
                        <Link href={"/(auth)/sign-in" as any} asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: '#25D366' }]}>Sign In</Text>
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
        gap: 16,
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
