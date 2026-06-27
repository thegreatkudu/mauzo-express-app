import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColors } from '@/theme/types';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof ThemeColors;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme.colors[type ?? 'background'] }, style]}
      {...otherProps}
    />
  );
}
