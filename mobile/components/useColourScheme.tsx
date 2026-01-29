import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';


export default function useColourScheme() {
    const colorScheme = useColorScheme() ?? 'light';

    return {
        colorScheme,
        colors: Colors[colorScheme],
        isDark: colorScheme === 'dark',
    };
}
