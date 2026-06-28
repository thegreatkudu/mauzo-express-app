import { useState } from 'react'
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, type TextInputProps, TouchableOpacity, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { toast } from 'sonner-native'

import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import { changePassword } from '@/api/auth'
import { extractApiError } from '@/api/client'
import { useResponsive } from '@/hooks/useResponsive'
import LanguageSelector from '@/components/LanguageSelector'
import { useAppAlert } from '@/components/ui/AppAlert/AppAlertProvider'
import { maskPhone } from '@/utils/phone'
import { daysRemaining } from '@/utils/date'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme, ThemeMode } from '@/hooks/use-theme'
import { shadows } from '@/theme'
import {
  PersonIcon, PhoneIcon, LocationIcon, EditIcon,
  KeyIcon, LogoutIcon, CrownIcon, ChevronRightIcon,
  BuildingIcon,
} from '@/constants/icons'
import {
  Sun01Icon,
  Moon02Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'

// ── Theme picker ──────────────────────────────────────────────────────────────

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: any }[] = [
  { mode: 'light',  label: 'Light',  icon: Sun01Icon },
  { mode: 'dark',   label: 'Dark',   icon: Moon02Icon },
  { mode: 'system', label: 'System', icon: SmartPhone01Icon },
]

function ThemePicker() {
  const { mode, setMode, theme } = useTheme()
  const styles = useThemeStyles(getThemePickerStyles)

  return (
    <View style={styles.pickerRow}>
      {THEME_OPTIONS.map(({ mode: opt, label, icon }) => {
        const active = mode === opt
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pickerOption, active && styles.pickerOptionActive]}
            onPress={() => setMode(opt)}
            activeOpacity={0.75}
          >
            <HugeiconsIcon
              icon={icon as any}
              size={16}
              color={active ? theme.colors.primary : theme.colors.textMuted}
              strokeWidth={active ? 2 : 1.5}
            />
            <Text style={[styles.pickerLabel, active && styles.pickerLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function getThemePickerStyles(theme: AppTheme) {
  return StyleSheet.create({
    pickerRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    pickerOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderWidth: 0,
    },
    pickerOptionActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    pickerLabel: {
      fontFamily: 'Poppins-Medium',
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    pickerLabelActive: {
      color: theme.colors.primary,
    },
  })
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const profile  = useAuthStore(s => s.profile)
  const logout   = useAuthStore(s => s.logout)
  const updateProfile = useAuthStore(s => s.updateProfile)

  const [editMode, setEditMode]       = useState(false)
  const [bizName, setBizName]         = useState(profile?.business_name ?? '')
  const [location, setLocation]       = useState(profile?.location ?? '')
  const [savingProfile, setSaving]    = useState(false)

  const [pwVisible, setPwVisible]     = useState(false)
  const [curPw, setCurPw]             = useState('')
  const [newPw, setNewPw]             = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [changingPw, setChangingPw]   = useState(false)

  const { hp, rf, isTablet, isLandscape, contentMaxWidth } = useResponsive()
  const { t } = useTranslation()
  const { showAlert } = useAppAlert()
  const styles = useThemeStyles(getStyles)
  const { theme } = useTheme()

  const sub      = profile?.subscription
  const daysLeft = daysRemaining(sub?.expires_at ?? null)

  async function handleSaveProfile() {
    if (!bizName.trim() || !location.trim()) {
      toast.error(t('profile.error_fields_required'))
      return
    }
    setSaving(true)
    try {
      await updateProfile({ business_name: bizName.trim(), business_location: location.trim() })
      setEditMode(false)
      toast.success(t('profile.profile_updated'))
    } catch (err) {
      toast.error(extractApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!curPw || !newPw || !confirmPw) { toast.error(t('profile.error_all_fields')); return }
    if (newPw.length < 6) { toast.error(t('profile.error_password_min')); return }
    if (newPw !== confirmPw) { toast.error(t('profile.error_passwords_mismatch')); return }
    setChangingPw(true)
    try {
      await changePassword({ current_password: curPw, new_password: newPw })
      setCurPw(''); setNewPw(''); setConfirmPw('')
      setPwVisible(false)
      toast.success(t('profile.password_changed'))
    } catch (err) {
      toast.error(extractApiError(err).message)
    } finally {
      setChangingPw(false)
    }
  }

  function confirmLogout() {
    showAlert({
      title:       t('profile.sign_out_confirm_title'),
      message:     t('profile.sign_out_confirm_message'),
      variant:     'danger',
      confirmText: t('profile.sign_out'),
      cancelText:  t('common.cancel'),
      onConfirm:   logout,
    })
  }

  const avatarSize   = isTablet ? 80 : 64
  const avatarRadius = isTablet ? 24 : 20
  const showSideBySide = isTablet && isLandscape

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hp, paddingBottom: 40 }]}
      >
        <View style={contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : undefined}>

          {/* Header */}
          <View style={[styles.header, { paddingTop: isTablet ? 24 : 20, gap: isTablet ? 16 : 14 }]}>
            <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarRadius }]}>
              <HugeiconsIcon icon={BuildingIcon} size={isTablet ? 40 : 32} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.bizName, { fontSize: rf(18) }]} numberOfLines={1}>
                {profile?.business_name}
              </Text>
              <Text style={[styles.category, { fontSize: rf(13) }]}>{profile?.category.name}</Text>
            </View>
          </View>

          {showSideBySide ? (
            <View style={styles.sideRow}>
              <View style={styles.sideLeft}>
                <Section title={t('profile.section_business')} rf={rf} theme={theme}>
                  <BusinessInfoCard
                    profile={profile} editMode={editMode} bizName={bizName} location={location}
                    setBizName={setBizName} setLocation={setLocation} savingProfile={savingProfile}
                    setEditMode={setEditMode} handleSaveProfile={handleSaveProfile}
                    rf={rf} isTablet={isTablet} theme={theme}
                  />
                </Section>
              </View>
              <View style={styles.sideRight}>
                <Section title={t('profile.section_subscription')} rf={rf} theme={theme}>
                  <SubscriptionCard sub={sub} daysLeft={daysLeft} rf={rf} theme={theme} />
                </Section>
                <Section title={t('profile.section_password')} rf={rf} theme={theme}>
                  <PasswordSection
                    pwVisible={pwVisible} setPwVisible={setPwVisible}
                    curPw={curPw} setCurPw={setCurPw}
                    newPw={newPw} setNewPw={setNewPw}
                    confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                    changingPw={changingPw} handleChangePassword={handleChangePassword}
                    rf={rf} isTablet={isTablet} theme={theme}
                  />
                </Section>
              </View>
            </View>
          ) : (
            <>
              <Section title={t('profile.section_business')} rf={rf} theme={theme}>
                <BusinessInfoCard
                  profile={profile} editMode={editMode} bizName={bizName} location={location}
                  setBizName={setBizName} setLocation={setLocation} savingProfile={savingProfile}
                  setEditMode={setEditMode} handleSaveProfile={handleSaveProfile}
                  rf={rf} isTablet={isTablet} theme={theme}
                />
              </Section>

              <Section title={t('profile.section_subscription')} rf={rf} theme={theme}>
                <SubscriptionCard sub={sub} daysLeft={daysLeft} rf={rf} theme={theme} />
              </Section>

              <Section title={t('profile.section_password')} rf={rf} theme={theme}>
                <PasswordSection
                  pwVisible={pwVisible} setPwVisible={setPwVisible}
                  curPw={curPw} setCurPw={setCurPw}
                  newPw={newPw} setNewPw={setNewPw}
                  confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                  changingPw={changingPw} handleChangePassword={handleChangePassword}
                  rf={rf} isTablet={isTablet} theme={theme}
                />
              </Section>
            </>
          )}

          {/* Appearance */}
          <Section title={t('profile.section_appearance', { defaultValue: 'Appearance' })} rf={rf} theme={theme}>
            <ThemePicker />
          </Section>

          {/* Language */}
          <Section title={t('profile.section_language')} rf={rf} theme={theme}>
            <LanguageSelector />
          </Section>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutBtn, { marginTop: isTablet ? 32 : 28, borderRadius: isTablet ? 18 : 16 }]}
            onPress={confirmLogout}
            activeOpacity={0.85}
          >
            <HugeiconsIcon icon={LogoutIcon} size={20} color={theme.colors.danger} strokeWidth={1.5} />
            <Text style={[styles.logoutText, { fontSize: rf(15) }]}>{t('profile.sign_out')}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title, children, rf, theme,
}: { title: string; children: React.ReactNode; rf: (s: number) => number; theme: AppTheme }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
        fontSize: rf(11),
      }}>
        {title}
      </Text>
      {children}
    </View>
  )
}

function InfoRow({
  icon, label, children, rf, theme,
}: { icon: any; label: string; children: React.ReactNode; rf: (s: number) => number; theme: AppTheme }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      paddingHorizontal: 16, paddingVertical: 13,
      borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    }}>
      <HugeiconsIcon icon={icon} size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textMuted, fontSize: rf(11) }}>
          {label}
        </Text>
        {children}
      </View>
    </View>
  )
}

function PwField({
  label, value, onChange, rf, theme, textContentType, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void
  rf: (s: number) => number; theme: AppTheme
  textContentType?: TextInputProps['textContentType']
  autoComplete?: TextInputProps['autoComplete']
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textSub, fontSize: rf(12) }}>
        {label}
      </Text>
      <TextInput
        style={{
          height: 48, borderRadius: 12, borderWidth: 1.5,
          borderColor: theme.colors.inputBorder, paddingHorizontal: 14,
          fontFamily: 'Poppins-Regular', color: theme.colors.text,
          backgroundColor: theme.colors.inputBg, fontSize: rf(14),
        }}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        placeholderTextColor={theme.colors.placeholder}
        placeholder='••••••••'
        textContentType={textContentType}
        autoComplete={autoComplete}
        importantForAutofill='yes'
        autoCapitalize='none'
        autoCorrect={false}
        spellCheck={false}
      />
    </View>
  )
}

function BusinessInfoCard({
  profile, editMode, bizName, location, setBizName, setLocation,
  savingProfile, setEditMode, handleSaveProfile, rf, isTablet, theme,
}: any) {
  const { t } = useTranslation()
  return (
    <View style={[cardStyle(theme)]}>
      <InfoRow icon={PersonIcon} label={t('profile.field_business_name')} rf={rf} theme={theme}>
        {editMode ? (
          <TextInput
            style={{ fontFamily: 'Poppins-Regular', color: theme.colors.text, fontSize: rf(14), borderBottomWidth: 1, borderBottomColor: theme.colors.primary, paddingBottom: 4, padding: 0 }}
            value={bizName} onChangeText={setBizName}
            placeholderTextColor={theme.colors.placeholder}
          />
        ) : (
          <Text style={{ fontFamily: 'Poppins-Medium', color: theme.colors.text, fontSize: rf(14) }}>
            {profile?.business_name}
          </Text>
        )}
      </InfoRow>
      <InfoRow icon={PhoneIcon} label={t('profile.field_phone')} rf={rf} theme={theme}>
        <Text style={{ fontFamily: 'Poppins-Medium', color: theme.colors.text, fontSize: rf(14) }}>
          {maskPhone(profile?.phone ?? '')}
        </Text>
        <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textDisabled, fontSize: rf(11) }}>
          {t('profile.contact_admin_to_change')}
        </Text>
      </InfoRow>
      <InfoRow icon={LocationIcon} label={t('profile.field_location')} rf={rf} theme={theme}>
        {editMode ? (
          <TextInput
            style={{ fontFamily: 'Poppins-Regular', color: theme.colors.text, fontSize: rf(14), borderBottomWidth: 1, borderBottomColor: theme.colors.primary, paddingBottom: 4, padding: 0 }}
            value={location} onChangeText={setLocation}
            placeholderTextColor={theme.colors.placeholder}
          />
        ) : (
          <Text style={{ fontFamily: 'Poppins-Medium', color: theme.colors.text, fontSize: rf(14) }}>
            {profile?.location}
          </Text>
        )}
      </InfoRow>
      <InfoRow icon={BuildingIcon} label={t('profile.field_category')} rf={rf} theme={theme}>
        <Text style={{ fontFamily: 'Poppins-Medium', color: theme.colors.text, fontSize: rf(14) }}>
          {profile?.category.name}
        </Text>
        <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textDisabled, fontSize: rf(11) }}>
          {t('profile.contact_admin_to_change')}
        </Text>
      </InfoRow>

      {editMode ? (
        <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
          <TouchableOpacity
            style={[{ flex: 1, height: isTablet ? 52 : 44, borderRadius: isTablet ? 14 : 12, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => { setBizName(profile?.business_name ?? ''); setLocation(profile?.location ?? ''); setEditMode(false) }}
            activeOpacity={0.8}
          >
            <Text style={{ fontFamily: 'Poppins-SemiBold', color: theme.colors.textSub, fontSize: rf(14) }}>
              {t('profile.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[{ flex: 1, height: isTablet ? 52 : 44, borderRadius: isTablet ? 14 : 12, backgroundColor: savingProfile ? theme.colors.primaryMuted : theme.colors.primary, alignItems: 'center', justifyContent: 'center' }]}
            onPress={handleSaveProfile} disabled={savingProfile} activeOpacity={0.88}
          >
            {savingProfile
              ? <ActivityIndicator color='#fff' size='small' />
              : <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#fff', fontSize: rf(14) }}>{t('profile.save_changes')}</Text>
            }
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14 }}
          onPress={() => setEditMode(true)} activeOpacity={0.8}
        >
          <HugeiconsIcon icon={EditIcon} size={15} color={theme.colors.primary} strokeWidth={1.5} />
          <Text style={{ fontFamily: 'Poppins-SemiBold', color: theme.colors.primary, fontSize: rf(14) }}>
            {t('profile.edit_profile')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function SubscriptionCard({ sub, daysLeft, rf, theme }: any) {
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      style={[cardStyle(theme), { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
      onPress={() => router.push('/subscription')}
      activeOpacity={0.85}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
          backgroundColor: sub?.is_active ? theme.colors.successBg : theme.colors.dangerBg,
        }}>
          <HugeiconsIcon
            icon={CrownIcon} size={20}
            color={sub?.is_active ? theme.colors.success : theme.colors.danger}
            strokeWidth={1.5}
          />
        </View>
        <View>
          <Text style={{ fontFamily: 'Poppins-SemiBold', color: theme.colors.text, fontSize: rf(15) }}>
            {sub?.plan ?? (sub?.type === 'trial' ? t('profile.sub_trial') : t('profile.sub_no_plan'))}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular', color: theme.colors.textSub, fontSize: rf(12), marginTop: 2 }}>
            {sub?.is_active
              ? t(daysLeft !== 1 ? 'profile.sub_active_plural' : 'profile.sub_active', { count: daysLeft })
              : t('profile.sub_expired')}
          </Text>
        </View>
      </View>
      <HugeiconsIcon icon={ChevronRightIcon} size={18} color={theme.colors.textMuted} strokeWidth={1.5} />
    </TouchableOpacity>
  )
}

function PasswordSection({
  pwVisible, setPwVisible, curPw, setCurPw, newPw, setNewPw,
  confirmPw, setConfirmPw, changingPw, handleChangePassword, rf, isTablet, theme,
}: any) {
  const { t } = useTranslation()
  return (
    <View style={cardStyle(theme)}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}
        onPress={() => setPwVisible((v: boolean) => !v)}
        activeOpacity={0.8}
      >
        <HugeiconsIcon icon={KeyIcon} size={18} color={theme.colors.textSub} strokeWidth={1.5} />
        <Text style={{ fontFamily: 'Poppins-Medium', color: theme.colors.text, flex: 1, fontSize: rf(14) }}>
          {t('profile.change_password')}
        </Text>
        <HugeiconsIcon icon={ChevronRightIcon} size={18} color={theme.colors.textMuted} strokeWidth={1.5} />
      </TouchableOpacity>

      {pwVisible && (
        <View style={{
          paddingHorizontal: 16, paddingBottom: 16, gap: 14,
          borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 16,
        }}>
          <PwField label={t('profile.current_password')} value={curPw} onChange={setCurPw} rf={rf} theme={theme} textContentType='password'    autoComplete='current-password' />
          <PwField label={t('profile.new_password')}     value={newPw} onChange={setNewPw} rf={rf} theme={theme} textContentType='newPassword' autoComplete='new-password' />
          <PwField label={t('profile.confirm_password')} value={confirmPw} onChange={setConfirmPw} rf={rf} theme={theme} textContentType='newPassword' autoComplete='new-password' />
          <TouchableOpacity
            style={{ height: isTablet ? 52 : 44, borderRadius: isTablet ? 14 : 12, backgroundColor: changingPw ? theme.colors.primaryMuted : theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
            onPress={handleChangePassword} disabled={changingPw} activeOpacity={0.88}
          >
            {changingPw
              ? <ActivityIndicator color='#fff' size='small' />
              : <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#fff', fontSize: rf(14) }}>{t('profile.update_password')}</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

function cardStyle(theme: AppTheme) {
  return {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    overflow: 'hidden' as const,
    ...shadows.subtle,
  }
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    scroll: {},

    header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
    avatar: {
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: theme.colors.primary,
    },
    headerInfo: { flex: 1, gap: 2 },
    bizName:  { fontFamily: 'Poppins-Bold',    color: theme.colors.text },
    category: { fontFamily: 'Poppins-Regular', color: theme.colors.textSub },

    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 16, backgroundColor: theme.colors.dangerBg,
      borderWidth: 1, borderColor: theme.colors.danger + '40',
    },
    logoutText: { fontFamily: 'Poppins-SemiBold', color: theme.colors.danger },

    sideRow:   { flexDirection: 'row', gap: 20 },
    sideLeft:  { flex: 1 },
    sideRight: { flex: 1 },
  })
}
