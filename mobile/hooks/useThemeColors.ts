import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export function useThemeColors() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    return Colors[theme];
}
