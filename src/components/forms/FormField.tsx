import { StyleSheet, Text, View } from 'react-native'
import { useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'

interface Props {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export default function FormField({ label, error, children, required }: Props) {
  const styles = useThemeStyles(getStyles)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper:  { gap: 6 },
    label:    { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: theme.colors.text },
    required: { color: theme.colors.danger },
    error:    { fontFamily: 'Poppins-Regular', fontSize: 12, color: theme.colors.danger },
  })
}
