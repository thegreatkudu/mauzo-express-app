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
import {
  PersonIcon, PhoneIcon, LocationIcon, EditIcon,
  KeyIcon, LogoutIcon, CrownIcon, ChevronRightIcon,
  BuildingIcon,
} from '@/constants/icons'

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

  const avatarSize = isTablet ? 80 : 64
  const avatarRadius = isTablet ? 24 : 20

  // On tablets in landscape, show a two-column profile layout
  const showSideBySide = isTablet && isLandscape

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: hp, paddingBottom: 40 },
        ]}
      >
        <View style={contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : undefined}>

          {/* Header */}
          <View style={[styles.header, { paddingTop: isTablet ? 24 : 20, gap: isTablet ? 16 : 14 }]}>
            <View style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarRadius,
              },
            ]}>
              <HugeiconsIcon icon={BuildingIcon} size={isTablet ? 40 : 32} color='#CE4002' strokeWidth={1.5} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.bizName, { fontSize: rf(18) }]} numberOfLines={1}>
                {profile?.business_name}
              </Text>
              <Text style={[styles.category, { fontSize: rf(13) }]}>{profile?.category.name}</Text>
            </View>
          </View>

          {/* Two-col layout on tablet landscape */}
          {showSideBySide ? (
            <View style={styles.sideRow}>
              <View style={styles.sideLeft}>
                <Section title={t('profile.section_business')} rf={rf}>
                  <BusinessInfoCard
                    profile={profile}
                    editMode={editMode}
                    bizName={bizName}
                    location={location}
                    setBizName={setBizName}
                    setLocation={setLocation}
                    savingProfile={savingProfile}
                    setEditMode={setEditMode}
                    handleSaveProfile={handleSaveProfile}
                    rf={rf}
                    isTablet={isTablet}
                  />
                </Section>
              </View>
              <View style={styles.sideRight}>
                <Section title={t('profile.section_subscription')} rf={rf}>
                  <SubscriptionCard sub={sub} daysLeft={daysLeft} rf={rf} />
                </Section>
                <Section title={t('profile.section_password')} rf={rf}>
                  <PasswordSection
                    pwVisible={pwVisible}
                    setPwVisible={setPwVisible}
                    curPw={curPw} setCurPw={setCurPw}
                    newPw={newPw} setNewPw={setNewPw}
                    confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                    changingPw={changingPw}
                    handleChangePassword={handleChangePassword}
                    rf={rf}
                    isTablet={isTablet}
                  />
                </Section>
              </View>
            </View>
          ) : (
            <>
              <Section title={t('profile.section_business')} rf={rf}>
                <BusinessInfoCard
                  profile={profile}
                  editMode={editMode}
                  bizName={bizName}
                  location={location}
                  setBizName={setBizName}
                  setLocation={setLocation}
                  savingProfile={savingProfile}
                  setEditMode={setEditMode}
                  handleSaveProfile={handleSaveProfile}
                  rf={rf}
                  isTablet={isTablet}
                />
              </Section>

              <Section title={t('profile.section_subscription')} rf={rf}>
                <SubscriptionCard sub={sub} daysLeft={daysLeft} rf={rf} />
              </Section>

              <Section title={t('profile.section_password')} rf={rf}>
                <PasswordSection
                  pwVisible={pwVisible}
                  setPwVisible={setPwVisible}
                  curPw={curPw} setCurPw={setCurPw}
                  newPw={newPw} setNewPw={setNewPw}
                  confirmPw={confirmPw} setConfirmPw={setConfirmPw}
                  changingPw={changingPw}
                  handleChangePassword={handleChangePassword}
                  rf={rf}
                  isTablet={isTablet}
                />
              </Section>
            </>
          )}

          {/* Language */}
          <Section title={t('profile.section_language')} rf={rf}>
            <LanguageSelector />
          </Section>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutBtn, { marginTop: isTablet ? 32 : 28, borderRadius: isTablet ? 18 : 16 }]}
            onPress={confirmLogout}
            activeOpacity={0.85}
          >
            <HugeiconsIcon icon={LogoutIcon} size={20} color='#EF4444' strokeWidth={1.5} />
            <Text style={[styles.logoutText, { fontSize: rf(15) }]}>{t('profile.sign_out')}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children, rf }: { title: string; children: React.ReactNode; rf: (s: number) => number }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: rf(11) }]}>{title}</Text>
      {children}
    </View>
  )
}

function InfoRow({ icon, label, children, rf }: { icon: any; label: string; children: React.ReactNode; rf: (s: number) => number }) {
  return (
    <View style={styles.infoRow}>
      <HugeiconsIcon icon={icon} size={16} color='#9CA3AF' strokeWidth={1.5} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { fontSize: rf(11) }]}>{label}</Text>
        {children}
      </View>
    </View>
  )
}

function PwField({
  label, value, onChange, rf, textContentType, autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rf: (s: number) => number
  textContentType?: TextInputProps['textContentType']
  autoComplete?: TextInputProps['autoComplete']
}) {
  return (
    <View style={styles.pwField}>
      <Text style={[styles.pwFieldLabel, { fontSize: rf(12) }]}>{label}</Text>
      <TextInput
        style={[styles.pwInput, { fontSize: rf(14) }]}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        placeholderTextColor='#9CA3AF'
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
  savingProfile, setEditMode, handleSaveProfile, rf, isTablet,
}: any) {
  const { t } = useTranslation()
  return (
    <View style={styles.card}>
      <InfoRow icon={PersonIcon} label={t('profile.field_business_name')} rf={rf}>
        {editMode ? (
          <TextInput
            style={[styles.editInput, { fontSize: rf(14) }]}
            value={bizName}
            onChangeText={setBizName}
            placeholderTextColor='#9CA3AF'
          />
        ) : (
          <Text style={[styles.infoValue, { fontSize: rf(14) }]}>{profile?.business_name}</Text>
        )}
      </InfoRow>
      <InfoRow icon={PhoneIcon} label={t('profile.field_phone')} rf={rf}>
        <Text style={[styles.infoValue, { fontSize: rf(14) }]}>{maskPhone(profile?.phone ?? '')}</Text>
        <Text style={[styles.infoHint, { fontSize: rf(11) }]}>{t('profile.contact_admin_to_change')}</Text>
      </InfoRow>
      <InfoRow icon={LocationIcon} label={t('profile.field_location')} rf={rf}>
        {editMode ? (
          <TextInput
            style={[styles.editInput, { fontSize: rf(14) }]}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor='#9CA3AF'
          />
        ) : (
          <Text style={[styles.infoValue, { fontSize: rf(14) }]}>{profile?.location}</Text>
        )}
      </InfoRow>
      <InfoRow icon={BuildingIcon} label={t('profile.field_category')} rf={rf}>
        <Text style={[styles.infoValue, { fontSize: rf(14) }]}>{profile?.category.name}</Text>
        <Text style={[styles.infoHint, { fontSize: rf(11) }]}>{t('profile.contact_admin_to_change')}</Text>
      </InfoRow>

      {editMode ? (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.cancelBtn, isTablet && styles.tallBtn]}
            onPress={() => {
              setBizName(profile?.business_name ?? '')
              setLocation(profile?.location ?? '')
              setEditMode(false)
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, { fontSize: rf(14) }]}>{t('profile.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, isTablet && styles.tallBtn, savingProfile && styles.saveBtnDisabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
            activeOpacity={0.88}
          >
            {savingProfile
              ? <ActivityIndicator color='#fff' size='small' />
              : <Text style={[styles.saveBtnText, { fontSize: rf(14) }]}>{t('profile.save_changes')}</Text>
            }
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)} activeOpacity={0.8}>
          <HugeiconsIcon icon={EditIcon} size={15} color='#CE4002' strokeWidth={1.5} />
          <Text style={[styles.editBtnText, { fontSize: rf(14) }]}>{t('profile.edit_profile')}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function SubscriptionCard({ sub, daysLeft, rf }: any) {
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      style={styles.subscriptionCard}
      onPress={() => router.push('/subscription')}
      activeOpacity={0.85}
    >
      <View style={styles.subLeft}>
        <View style={[styles.subIconWrap, { backgroundColor: sub?.is_active ? '#D1FAE5' : '#FEE2E2' }]}>
          <HugeiconsIcon
            icon={CrownIcon} size={20}
            color={sub?.is_active ? '#059669' : '#DC2626'}
            strokeWidth={1.5}
          />
        </View>
        <View>
          <Text style={[styles.subPlan, { fontSize: rf(15) }]}>
            {sub?.plan ?? (sub?.type === 'trial' ? t('profile.sub_trial') : t('profile.sub_no_plan'))}
          </Text>
          <Text style={[styles.subStatus, { fontSize: rf(12) }]}>
            {sub?.is_active
              ? t(daysLeft !== 1 ? 'profile.sub_active_plural' : 'profile.sub_active', { count: daysLeft })
              : t('profile.sub_expired')}
          </Text>
        </View>
      </View>
      <HugeiconsIcon icon={ChevronRightIcon} size={18} color='#9CA3AF' strokeWidth={1.5} />
    </TouchableOpacity>
  )
}

function PasswordSection({
  pwVisible, setPwVisible, curPw, setCurPw, newPw, setNewPw,
  confirmPw, setConfirmPw, changingPw, handleChangePassword, rf, isTablet,
}: any) {
  const { t } = useTranslation()
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.pwToggle}
        onPress={() => setPwVisible((v: boolean) => !v)}
        activeOpacity={0.8}
      >
        <HugeiconsIcon icon={KeyIcon} size={18} color='#6B7280' strokeWidth={1.5} />
        <Text style={[styles.pwToggleText, { fontSize: rf(14) }]}>{t('profile.change_password')}</Text>
        <HugeiconsIcon
          icon={ChevronRightIcon} size={18} color='#9CA3AF' strokeWidth={1.5}
          style={{ marginLeft: 'auto' } as any}
        />
      </TouchableOpacity>

      {pwVisible && (
        <View style={styles.pwForm}>
          <PwField label={t('profile.current_password')} value={curPw} onChange={setCurPw} rf={rf} textContentType='password'    autoComplete='current-password' />
          <PwField label={t('profile.new_password')}     value={newPw} onChange={setNewPw} rf={rf} textContentType='newPassword' autoComplete='new-password' />
          <PwField label={t('profile.confirm_password')} value={confirmPw} onChange={setConfirmPw} rf={rf} textContentType='newPassword' autoComplete='new-password' />
          <TouchableOpacity
            style={[styles.saveBtn, isTablet && styles.tallBtn, changingPw && styles.saveBtnDisabled]}
            onPress={handleChangePassword}
            disabled={changingPw}
            activeOpacity={0.88}
          >
            {changingPw
              ? <ActivityIndicator color='#fff' size='small' />
              : <Text style={[styles.saveBtnText, { fontSize: rf(14) }]}>{t('profile.update_password')}</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: {},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  avatar: {
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CE4002',
  },
  headerInfo: { flex: 1, gap: 2 },
  bizName:  { fontFamily: 'Poppins-Bold',    color: '#111827' },
  category: { fontFamily: 'Poppins-Regular', color: '#6B7280' },

  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
  },
  infoContent: { flex: 1, gap: 2 },
  infoLabel:   { fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  infoValue:   { fontFamily: 'Poppins-Medium',  color: '#111827' },
  infoHint:    { fontFamily: 'Poppins-Regular', color: '#D1D5DB' },

  editInput: {
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#CE4002',
    paddingBottom: 4,
    padding: 0,
  },

  editActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tallBtn: { height: 52, borderRadius: 14 },
  cancelBtnText: { fontFamily: 'Poppins-SemiBold', color: '#6B7280' },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
  },
  editBtnText: { fontFamily: 'Poppins-SemiBold', color: '#CE4002' },

  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CE4002',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#E8A07A' },
  saveBtnText: { fontFamily: 'Poppins-SemiBold', color: '#fff' },

  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  subLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subPlan:   { fontFamily: 'Poppins-SemiBold', color: '#111827' },
  subStatus: { fontFamily: 'Poppins-Regular',  color: '#6B7280', marginTop: 2 },

  pwToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  pwToggleText: { fontFamily: 'Poppins-Medium', color: '#374151', flex: 1 },

  pwForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F4',
    paddingTop: 16,
  },
  pwField: { gap: 6 },
  pwFieldLabel: { fontFamily: 'Poppins-Regular', color: '#6B7280' },
  pwInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    backgroundColor: '#F4F4F2',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontFamily: 'Poppins-SemiBold', color: '#EF4444' },

  // Tablet landscape side-by-side layout
  sideRow:   { flexDirection: 'row', gap: 20 },
  sideLeft:  { flex: 1 },
  sideRight: { flex: 1 },
})
