// hooks/useThemeColor.ts
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string } = {},
  colorName: keyof typeof Colors.light
): string {
  const theme = useColorScheme() ?? 'light';

  // Nếu component truyền props override light/dark → ưu tiên dùng
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Nếu không → lấy từ Colors theo theme
  return Colors[theme][colorName] || '#000'; // fallback nếu thiếu key
}