// components/theme.ts
import { useColorScheme } from 'react-native';

type ThemeColors = {
  card: string;
  text: string;
  backdrop: string;
  // thêm màu khác nếu cần
};

const lightTheme: ThemeColors = {
  card: '#ffffff',
  text: '#000000',
  backdrop: 'rgba(0,0,0,0.5)',
};

const darkTheme: ThemeColors = {
  card: '#1f2937',
  text: '#ffffff',
  backdrop: 'rgba(0,0,0,0.7)',
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
): string {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return theme === 'dark' ? darkTheme[colorName] : lightTheme[colorName];
}
