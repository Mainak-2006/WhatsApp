import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const APP_LOCK_SETTINGS_KEY = 'app_lock_settings';
const APP_PIN_KEY = 'app_pin';

export interface AppLockSettings {
    isEnabled: boolean;
    lockType: 'biometric' | 'pin';
    lockTime: 'immediately' | '1min' | '30min';
}

export const getAppLockSettings = async (): Promise<AppLockSettings> => {
    const settings = await SecureStore.getItemAsync(APP_LOCK_SETTINGS_KEY);
    if (settings) {
        return JSON.parse(settings);
    }
    return {
        isEnabled: false,
        lockType: 'biometric',
        lockTime: 'immediately',
    };
};

export const saveAppLockSettings = async (settings: AppLockSettings) => {
    await SecureStore.setItemAsync(APP_LOCK_SETTINGS_KEY, JSON.stringify(settings));
};

export const setAppPin = async (pin: string) => {
    await SecureStore.setItemAsync(APP_PIN_KEY, pin);
};

export const getAppPin = async () => {
    return await SecureStore.getItemAsync(APP_PIN_KEY);
};

export const authenticateBiometric = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
        return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock WhatsApp',
        fallbackLabel: 'Use PIN',
    });

    return result.success;
};

export const checkBiometricsAvailable = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        isAvailable: hasHardware && isEnrolled
    };
};
