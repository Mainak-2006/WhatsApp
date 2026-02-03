export interface ColorScheme {
    background: string;
    text: string;
    secondaryText: string;
    border: string;
    tabBarBackground: string;
    primary: string;
}

export interface ColorsType {
    light: ColorScheme;
    dark: ColorScheme;
}

declare const Colors: ColorsType;
export default Colors;
