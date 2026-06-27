import { useRef, useState } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { toast } from 'sonner-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/store/auth.store'
import { useResponsive } from '@/hooks/useResponsive'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import { isValidTanzaniaPhone } from '@/utils/phone'
import { extractApiError } from '@/api/client'
import FormField from '@/components/forms/FormField'
import PasswordInput from '@/components/forms/PasswordInput'
import { StorefrontIcon, PhoneIcon } from '@/constants/icons'

const TEST_PHONE    = '0700000000'
const TEST_PASSWORD = 'password123'

const schema = z.object({
  phone:    z.string().refine(isValidTanzaniaPhone, 'Enter a valid phone number (07XXXXXXXX)'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function SignInScreen() {
  const login = useAuthStore(s => s.login)
  const [loading, setLoading] = useState(false)
  const { rf, isTablet, isLandscape } = useResponsive()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)

  const passwordRef = useRef<TextInput>(null)

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
  })

  async function onSubmit({ phone, password }: FormData) {
    setLoading(true)
    try {
      await login(phone, password)
    } catch (err) {
      const { message } = extractApiError(err)
      if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('client')) {
        toast.error(t('auth.signin.error_no_access'))
      } else {
        toast.error(message || t('auth.signin.error_wrong_creds'))
      }
    } finally {
      setLoading(false)
    }
  }

  const formMaxWidth       = isTablet ? 480 : isLandscape ? 400 : undefined
  const headerPaddingTop   = isLandscape ? 24 : isTablet ? 64 : 48
  const headerPaddingBottom = isLandscape ? 20 : 36

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: isTablet ? 0 : 24 }]}
          keyboardShouldPersistTaps='handled'
        >
          <View style={formMaxWidth
            ? { maxWidth: formMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: isTablet ? 32 : 24 }
            : undefined
          }>

            {/* Brand header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom }]}>
              <View style={[styles.logoWrap, isTablet && { width: 96, height: 96, borderRadius: 28 }]}>
                <HugeiconsIcon icon={StorefrontIcon} size={isTablet ? 48 : 40} color={theme.colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.title, { fontSize: rf(26) }]}>{t('auth.signin.title')}</Text>
              <Text style={[styles.subtitle, { fontSize: rf(14) }]}>{t('auth.signin.subtitle')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <FormField label={t('auth.signin.phone_label')} error={errors.phone?.message} required>
                <Controller
                  control={control}
                  name='phone'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[
                      styles.inputRow,
                      { height: isTablet ? 60 : 56 },
                      errors.phone && styles.inputError,
                    ]}>
                      <HugeiconsIcon icon={PhoneIcon} size={18} color={theme.colors.textMuted} strokeWidth={1.5} />
                      <Text style={[styles.dialCode, { fontSize: rf(14) }]}>+255</Text>
                      <View style={styles.dialDivider} />
                      <TextInput
                        style={[styles.input, { fontSize: rf(14) }]}
                        placeholder='07XXXXXXXX'
                        placeholderTextColor={theme.colors.placeholder}
                        keyboardType='phone-pad'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        textContentType='username'
                        autoComplete='username'
                        importantForAutofill='yes'
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false}
                        returnKeyType='next'
                        onSubmitEditing={() => passwordRef.current?.focus()}
                      />
                    </View>
                  )}
                />
              </FormField>

              <FormField label={t('auth.signin.password_label')} error={errors.password?.message} required>
                <Controller
                  control={control}
                  name='password'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      ref={passwordRef}
                      placeholder='••••••••'
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      hasError={!!errors.password}
                      textContentType='password'
                      autoComplete='current-password'
                      importantForAutofill='yes'
                      returnKeyType='go'
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
              </FormField>

              <View style={styles.forgotRow}>
                <TouchableOpacity
                  onPress={() => {
                    setValue('phone', TEST_PHONE, { shouldValidate: true })
                    setValue('password', TEST_PASSWORD, { shouldValidate: true })
                  }}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.testCredsLink, { fontSize: rf(13) }]}>{t('auth.signin.use_test_creds')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot')}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotLink, { fontSize: rf(13) }]}>{t('auth.signin.forgot_password')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                activeOpacity={0.88}
                style={[
                  styles.submitBtn,
                  { height: isTablet ? 60 : 56, borderRadius: isTablet ? 18 : 16 },
                  loading && styles.submitBtnDisabled,
                ]}
              >
                {loading
                  ? <ActivityIndicator color='#fff' />
                  : <Text style={[styles.submitBtnText, { fontSize: rf(16) }]}>{t('auth.signin.submit')}</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={styles.signupRow}>
              <Text style={[styles.signupPrompt, { fontSize: rf(14) }]}>{t('auth.signin.no_account')} </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} hitSlop={8} activeOpacity={0.7}>
                <Text style={[styles.signupLink, { fontSize: rf(14) }]}>{t('auth.signin.register')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: theme.colors.surface },
    scroll: { paddingBottom: 32 },

    header: { alignItems: 'center', gap: 8 },
    logoWrap: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    title:    { fontFamily: 'Poppins-Bold',    color: theme.colors.text },
    subtitle: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub, textAlign: 'center' },

    form: { gap: 16 },

    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, borderRadius: 16, gap: 8,
      borderWidth: 1.5, borderColor: theme.colors.inputBorder,
      backgroundColor: theme.colors.inputBg,
    },
    inputError:  { borderColor: theme.colors.danger },
    dialCode:    { fontFamily: 'Poppins-SemiBold', color: theme.colors.text },
    dialDivider: { width: 1, height: 20, backgroundColor: theme.colors.border },
    input:       { flex: 1, fontFamily: 'Poppins-Regular', color: theme.colors.text },

    forgotRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    testCredsLink: { fontFamily: 'Poppins-SemiBold', color: theme.colors.textSub },
    forgotLink:    { fontFamily: 'Poppins-SemiBold', color: theme.colors.primary },

    submitBtn:         { backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    submitBtnDisabled: { backgroundColor: theme.colors.primaryMuted },
    submitBtnText:     { fontFamily: 'Poppins-Bold', color: '#fff' },

    signupRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    signupPrompt: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub },
    signupLink:   { fontFamily: 'Poppins-Bold',    color: theme.colors.primary },
  })
}
