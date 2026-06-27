import { useEffect, useState } from 'react'
import {
  Linking, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SubscriptionSkeleton } from '@/components/skeletons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getSubscriptionPrices } from '@/api/subscription'
import { useAuthStore } from '@/store/auth.store'
import { ADMIN_PHONE } from '@/constants/config'
import { CrownIcon, PhoneIcon, CheckCircleIcon } from '@/constants/icons'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import type { AppTheme } from '@/hooks/use-theme'
import type { SubscriptionPlan } from '@/types'

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = useThemeStyles(getStyles)

  const PLAN_FEATURES = [
    t('subscription.features.browse'),
    t('subscription.features.orders'),
    t('subscription.features.quotations'),
    t('subscription.features.accept_reject'),
    t('subscription.features.history'),
    t('subscription.features.notifications'),
  ]

  const profile = useAuthStore(s => s.profile)
  const sub = profile?.subscription

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-prices'],
    queryFn:  getSubscriptionPrices,
  })

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)

  useEffect(() => {
    if (plans?.length) setSelectedPlanId(plans[0].id)
  }, [plans])

  const isExpired = !sub?.is_active
  const daysLeft  = sub?.days_remaining ?? 0

  function handleSubscribe() {
    Linking.openURL(`tel:${ADMIN_PHONE.replace(/\s/g, '')}`)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Gradient hero ── */}
        <LinearGradient
          colors={['#8C2800', '#CE4002', '#E8621A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHero}
        >
          <View style={styles.crownWrap}>
            <HugeiconsIcon icon={CrownIcon} size={32} color='#FCD34D' strokeWidth={1.5} />
          </View>
          <Text style={styles.heroTitle}>{t('subscription.title')}</Text>
          <Text style={styles.heroSubtitle}>
            {isExpired
              ? t('subscription.subtitle_expired')
              : t(daysLeft !== 1 ? 'subscription.subtitle_trial_other' : 'subscription.subtitle_trial_one', { count: daysLeft })}
          </Text>
        </LinearGradient>

        {/* ── Status banner (floats below gradient) ── */}
        {sub && (
          <View style={styles.statusWrap}>
            <View style={[styles.statusBanner, isExpired ? styles.statusExpired : styles.statusTrial]}>
              <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextTrial]}>
                {isExpired
                  ? t('subscription.status_expired')
                  : t(daysLeft !== 1 ? 'subscription.status_trial_other' : 'subscription.status_trial_one', { count: daysLeft })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.body}>
          {/* ── Plan cards ── */}
          <Text style={styles.sectionTitle}>{t('subscription.choose_plan')}</Text>
          {isLoading ? (
            <SubscriptionSkeleton />
          ) : (
            <View style={styles.plansGrid}>
              {(plans ?? []).map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id)}
                  theme={theme}
                />
              ))}
            </View>
          )}

          {/* ── Features ── */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>{t('subscription.whats_included')}</Text>
            {PLAN_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkWrap}>
                  <HugeiconsIcon icon={CheckCircleIcon} size={14} color={theme.colors.success} strokeWidth={2} />
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* ── CTA ── */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaNote}>{t('subscription.cta_note')}</Text>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleSubscribe}
              activeOpacity={0.88}
            >
              <HugeiconsIcon icon={PhoneIcon} size={20} color='#fff' strokeWidth={2} />
              <Text style={styles.callBtnText}>{t('subscription.call_admin')}</Text>
            </TouchableOpacity>
            <Text style={styles.adminPhone}>{ADMIN_PHONE}</Text>
          </View>

          {/* ── Continue on trial ── */}
          {!isExpired && (
            <TouchableOpacity
              style={styles.skipLink}
              onPress={() => router.push('/(tabs)')}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text style={styles.skipLinkText}>{t('subscription.continue_trial')}</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

function PlanCard({ plan, selected, onSelect, theme }: {
  plan: SubscriptionPlan
  selected: boolean
  onSelect: () => void
  theme: AppTheme
}) {
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      style={[
        {
          width: '47.5%' as const,
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          gap: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0 : 0.04,
          shadowRadius: 5,
          elevation: 2,
          position: 'relative' as const,
        },
        selected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {selected && (
        <View style={{
          position: 'absolute', top: 12, right: 12,
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: theme.colors.primary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <HugeiconsIcon icon={CheckCircleIcon} size={14} color='#fff' strokeWidth={2.5} />
        </View>
      )}
      <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: selected ? theme.colors.primary : theme.colors.text }}>
        {plan.name}
      </Text>
      <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: selected ? theme.colors.primary : theme.colors.textSub }}>
        {t(plan.duration_months !== 1 ? 'subscription.plan_month_other' : 'subscription.plan_month_one', { count: plan.duration_months })}
      </Text>
      <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', marginTop: 8, color: selected ? theme.colors.primary : theme.colors.text }}>
        TZS {plan.price.toLocaleString()}
      </Text>
    </TouchableOpacity>
  )
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingBottom: 40 },

    gradientHero: {
      alignItems:        'center',
      paddingTop:        44,
      paddingBottom:     40,
      paddingHorizontal: 24,
      gap:               10,
    },
    crownWrap: {
      width:           72,
      height:          72,
      borderRadius:    22,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth:     1,
      borderColor:     'rgba(255,255,255,0.25)',
      alignItems:      'center',
      justifyContent:  'center',
      marginBottom:    6,
    },
    heroTitle: {
      fontSize:   22,
      fontFamily: 'Poppins-Bold',
      color:      '#fff',
      textAlign:  'center',
    },
    heroSubtitle: {
      fontSize:   14,
      fontFamily: 'Poppins-Regular',
      color:      'rgba(255,255,255,0.85)',
      textAlign:  'center',
      lineHeight: 22,
      maxWidth:   280,
    },

    statusWrap:    { paddingHorizontal: 16, marginTop: -18 },
    statusBanner: {
      borderRadius:      12,
      paddingHorizontal: 18,
      paddingVertical:   12,
      alignItems:        'center',
      shadowColor:       '#000',
      shadowOffset:      { width: 0, height: 3 },
      shadowOpacity:     0.10,
      shadowRadius:      8,
      elevation:         4,
    },
    statusExpired: { backgroundColor: theme.colors.dangerBg },
    statusTrial:   { backgroundColor: theme.colors.warningBg },
    statusText:        { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
    statusTextExpired: { color: theme.colors.danger },
    statusTextTrial:   { color: theme.colors.warning },

    body: { paddingHorizontal: 16, paddingTop: 28 },

    sectionTitle: {
      fontSize:     16,
      fontFamily:   'Poppins-Bold',
      color:        theme.colors.text,
      marginBottom: 14,
    },

    plansGrid: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           10,
      marginBottom:  24,
    },

    featuresCard: {
      backgroundColor: theme.colors.card,
      borderRadius:    16,
      padding:         18,
      borderWidth:     1,
      borderColor:     theme.colors.border,
      gap:             12,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   theme.isDark ? 0 : 0.04,
      shadowRadius:    5,
      elevation:       2,
    },
    featuresTitle: {
      fontSize:     15,
      fontFamily:   'Poppins-SemiBold',
      color:        theme.colors.text,
      marginBottom: 4,
    },
    featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
    checkWrap: {
      width:           26,
      height:          26,
      borderRadius:    8,
      backgroundColor: theme.colors.successBg,
      alignItems:      'center',
      justifyContent:  'center',
      flexShrink:      0,
    },
    featureText: {
      fontSize:   13,
      fontFamily: 'Poppins-Regular',
      color:      theme.colors.textSub,
      flex:       1,
    },

    ctaSection: { alignItems: 'center', marginTop: 28, gap: 14 },
    ctaNote: {
      fontSize:   14,
      fontFamily: 'Poppins-Regular',
      color:      theme.colors.textMuted,
      textAlign:  'center',
      lineHeight: 22,
    },
    callBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               10,
      backgroundColor:   theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical:   16,
      borderRadius:      14,
      width:             '100%',
      justifyContent:    'center',
      shadowColor:       theme.colors.primary,
      shadowOffset:      { width: 0, height: 4 },
      shadowOpacity:     0.30,
      shadowRadius:      10,
      elevation:         4,
    },
    callBtnText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },
    adminPhone: {
      fontSize:      16,
      fontFamily:    'Poppins-SemiBold',
      color:         theme.colors.text,
      letterSpacing: 0.5,
    },

    skipLink:     { alignItems: 'center', marginTop: 8 },
    skipLinkText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.colors.textMuted },
  })
}
