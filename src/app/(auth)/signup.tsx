import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable,
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

import { getCategories, register } from '@/api/auth'
import { isValidTanzaniaPhone, toApiPhone } from '@/utils/phone'
import { extractApiError } from '@/api/client'
import FormField from '@/components/forms/FormField'
import PasswordInput from '@/components/forms/PasswordInput'
import { StorefrontIcon, PhoneIcon, LocationIcon, ChevronDownIcon } from '@/constants/icons'
import type { Category } from '@/types'

const schema = z.object({
  business_name:     z.string().min(3, 'Business name must be at least 3 characters'),
  phone:             z.string().refine(isValidTanzaniaPhone, 'Enter a valid phone number (07XXXXXXXX)'),
  business_location: z.string().min(2, 'Location is required'),
  password:          z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password:  z.string(),
  category_id:       z.number().int().positive('Select a business category'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export default function SignUpScreen() {
  const { t } = useTranslation()
  const [categories, setCategories]       = useState<Category[]>([])
  const [catLoading, setCatLoading]       = useState(true)
  const [catError, setCatError]           = useState(false)
  const [catPickerOpen, setCatPickerOpen] = useState(false)
  const [loading, setLoading]             = useState(false)

  // Keyboard navigation refs — allows "Next" key to advance through fields
  const phoneRef    = useRef<TextInput>(null)
  const locationRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef  = useRef<TextInput>(null)

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { business_name: '', phone: '', business_location: '', password: '', confirm_password: '', category_id: 0 },
  })

  const selectedCatId = watch('category_id')
  const selectedCat   = categories.find(c => c.id === selectedCatId)

  function loadCategories() {
    setCatLoading(true)
    setCatError(false)
    getCategories()
      .then(setCategories)
      .catch(() => setCatError(true))
      .finally(() => setCatLoading(false))
  }

  useEffect(() => { loadCategories() }, [])

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await register({
        business_name:     data.business_name,
        phone:             toApiPhone(data.phone),
        password:          data.password,
        business_category: data.category_id,
        business_location: data.business_location,
      })
      toast.success(t('auth.signup.success'))
      router.replace('/(auth)/signin')
    } catch (err) {
      const { message, fieldErrors } = extractApiError(err)
      if (fieldErrors?.phone) toast.error(fieldErrors.phone)
      else toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps='handled'
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <HugeiconsIcon icon={StorefrontIcon} size={40} color='#CE4002' strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>{t('auth.signup.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <FormField label={t('auth.signup.business_name_label')} error={errors.business_name?.message} required>
              <Controller
                control={control}
                name='business_name'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputRow, errors.business_name && styles.inputError]}>
                    <HugeiconsIcon icon={StorefrontIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.signup.business_name_placeholder')}
                      placeholderTextColor='#9CA3AF'
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      textContentType='organizationName'
                      autoComplete='organization'
                      importantForAutofill='yes'
                      autoCapitalize='words'
                      returnKeyType='next'
                      onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                  </View>
                )}
              />
            </FormField>

            <FormField label={t('auth.signup.phone_label')} error={errors.phone?.message} required>
              <Controller
                control={control}
                name='phone'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputRow, errors.phone && styles.inputError]}>
                    <HugeiconsIcon icon={PhoneIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                    <Text style={styles.dialCode}>+255</Text>
                    <View style={styles.dialDivider} />
                    <TextInput
                      ref={phoneRef}
                      style={styles.input}
                      placeholder='07XXXXXXXX'
                      placeholderTextColor='#9CA3AF'
                      keyboardType='phone-pad'
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      textContentType='username'
                      autoComplete='username'
                      importantForAutofill='yes'
                      autoCapitalize='none'
                      autoCorrect={false}
                      returnKeyType='next'
                      onSubmitEditing={() => locationRef.current?.focus()}
                    />
                  </View>
                )}
              />
            </FormField>

            <FormField
              label={t('auth.signup.category_label')}
              error={catError ? t('auth.signup.category_load_error') : errors.category_id?.message}
              required
            >
              <TouchableOpacity
                style={[styles.inputRow, (catError || errors.category_id) && styles.inputError]}
                onPress={() => !catLoading && !catError && setCatPickerOpen(true)}
                activeOpacity={0.8}
              >
                {catLoading
                  ? <ActivityIndicator size='small' color='#9CA3AF' style={{ flex: 1 }} />
                  : catError
                  ? <>
                      <Text style={[styles.input, { color: '#EF4444' }]}>{t('auth.signup.category_not_loaded')}</Text>
                      <TouchableOpacity onPress={loadCategories} hitSlop={8}>
                        <Text style={styles.retryText}>{t('common.retry')}</Text>
                      </TouchableOpacity>
                    </>
                  : <>
                      <Text style={[styles.input, !selectedCat && { color: '#9CA3AF' }]}>
                        {selectedCat ? selectedCat.name : t('auth.signup.category_placeholder')}
                      </Text>
                      <HugeiconsIcon icon={ChevronDownIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                    </>
                }
              </TouchableOpacity>
            </FormField>

            <FormField label={t('auth.signup.location_label')} error={errors.business_location?.message} required>
              <Controller
                control={control}
                name='business_location'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputRow, errors.business_location && styles.inputError]}>
                    <HugeiconsIcon icon={LocationIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
                    <TextInput
                      ref={locationRef}
                      style={styles.input}
                      placeholder={t('auth.signup.location_placeholder')}
                      placeholderTextColor='#9CA3AF'
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      textContentType='addressCity'
                      autoComplete='address-line1'
                      importantForAutofill='yes'
                      autoCapitalize='words'
                      returnKeyType='next'
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                )}
              />
            </FormField>

            <FormField label={t('auth.signup.password_label')} error={errors.password?.message} required>
              <Controller
                control={control}
                name='password'
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    ref={passwordRef}
                    placeholder={t('auth.signup.password_placeholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    hasError={!!errors.password}
                    textContentType='newPassword'
                    autoComplete='new-password'
                    importantForAutofill='yes'
                    returnKeyType='next'
                    onSubmitEditing={() => confirmRef.current?.focus()}
                  />
                )}
              />
            </FormField>

            <FormField label={t('auth.signup.confirm_password_label')} error={errors.confirm_password?.message} required>
              <Controller
                control={control}
                name='confirm_password'
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    ref={confirmRef}
                    placeholder={t('auth.signup.confirm_password_placeholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    hasError={!!errors.confirm_password}
                    textContentType='newPassword'
                    autoComplete='new-password'
                    importantForAutofill='yes'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
            </FormField>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.88}
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            >
              {loading
                ? <ActivityIndicator color='#fff' />
                : <Text style={styles.submitBtnText}>{t('auth.signup.submit')}</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.signinRow}>
            <Text style={styles.signinPrompt}>{t('auth.signup.already_have_account')} </Text>
            <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
              <Text style={styles.signinLink}>{t('auth.signup.sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category picker bottom sheet */}
      <Modal visible={catPickerOpen} transparent animationType='slide' onRequestClose={() => setCatPickerOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setCatPickerOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('auth.signup.select_category_title')}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sheetItem, selectedCatId === cat.id && styles.sheetItemActive]}
                  onPress={() => { setValue('category_id', cat.id, { shouldValidate: true }); setCatPickerOpen(false) }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sheetItemText, selectedCatId === cat.id && styles.sheetItemTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, gap: 8 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#FEF0E6', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title:    { fontSize: 24, fontFamily: 'Poppins-Bold',    color: '#111827' },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center' },

  form: { gap: 14 },

  inputRow: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, borderRadius: 16, gap: 8,
    borderWidth: 1.5, borderColor: '#E8E8E8', backgroundColor: '#F9FAFB',
  },
  inputError:  { borderColor: '#EF4444' },
  dialCode:    { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#374151' },
  dialDivider: { width: 1, height: 20, backgroundColor: '#E8E8E8' },
  input:       { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#111827' },

  retryText:         { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#CE4002' },

  submitBtn:         { height: 56, borderRadius: 16, backgroundColor: '#CE4002', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  submitBtnDisabled: { backgroundColor: '#E8A07A' },
  submitBtnText:     { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },

  signinRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  signinPrompt: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  signinLink:   { fontSize: 14, fontFamily: 'Poppins-Bold',    color: '#CE4002' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, maxHeight: '70%',
  },
  sheetHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E8E8E8', alignSelf: 'center', marginBottom: 16 },
  sheetTitle:        { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#111827', marginBottom: 12 },
  sheetItem:         { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  sheetItemActive:   { backgroundColor: '#FEF0E6' },
  sheetItemText:     { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#374151' },
  sheetItemTextActive: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },
})
