import { useEffect, useState } from 'react'
import {
  Linking, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { SubscriptionSkeleton } from '@/components/skeletons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getSubscriptionPrices, getSubscriptionStatus } from '@/api/subscription'
import { useAuthStore } from '@/store/auth.store'
import { ADMIN_PHONE } from '@/constants/config'
import { CrownIcon, PhoneIcon, CheckCircleIcon } from '@/constants/icons'
import type { SubscriptionPlan } from '@/types'

export default function SubscriptionScreen() {
  const { t } = useTranslation()

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

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <HugeiconsIcon icon={CrownIcon} size={36} color='#D97706' strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>{t('subscription.title')}</Text>
          <Text style={styles.subtitle}>
            {isExpired
              ? t('subscription.subtitle_expired')
              : t(daysLeft !== 1 ? 'subscription.subtitle_trial_other' : 'subscription.subtitle_trial_one', { count: daysLeft })
            }
          </Text>
        </View>

        {/* Status banner */}
        {sub && (
          <View style={[styles.statusBanner, isExpired ? styles.statusBannerExpired : styles.statusBannerTrial]}>
            <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextTrial]}>
              {isExpired
                ? t('subscription.status_expired')
                : t(daysLeft !== 1 ? 'subscription.status_trial_other' : 'subscription.status_trial_one', { count: daysLeft })
              }
            </Text>
          </View>
        )}

        {/* Plan cards */}
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
              />
            ))}
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>{t('subscription.whats_included')}</Text>
          {PLAN_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <HugeiconsIcon icon={CheckCircleIcon} size={16} color='#059669' strokeWidth={2} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Subscribe CTA */}
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

        {/* Continue in read-only mode */}
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

      </ScrollView>
    </SafeAreaView>
  )
}

function PlanCard({ plan, selected, onSelect }: {
  plan: SubscriptionPlan
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {selected && (
        <View style={styles.planSelectedDot}>
          <HugeiconsIcon icon={CheckCircleIcon} size={14} color='#fff' strokeWidth={2.5} />
        </View>
      )}
      <Text style={[styles.planName, selected && styles.planNameSelected]}>{plan.name}</Text>
      <Text style={[styles.planDuration, selected && styles.planTextSelected]}>
        {t(plan.duration_months !== 1 ? 'subscription.plan_month_other' : 'subscription.plan_month_one', { count: plan.duration_months })}
      </Text>
      <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
        TZS {plan.price.toLocaleString()}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
    gap: 10,
  },
  crownWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  statusBanner: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBannerExpired: { backgroundColor: '#FEE2E2' },
  statusBannerTrial:   { backgroundColor: '#FEF3C7' },
  statusText:        { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  statusTextExpired: { color: '#DC2626' },
  statusTextTrial:   { color: '#D97706' },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },

  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  planCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#CE4002',
    backgroundColor: '#FEF0E6',
  },
  planSelectedDot: {
    position: 'absolute',
    top: 12, right: 12,
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: '#CE4002',
    alignItems: 'center', justifyContent: 'center',
  },
  planName:         { fontSize: 14, fontFamily: 'Poppins-Bold',    color: '#111827' },
  planNameSelected: { color: '#CE4002' },
  planDuration:     { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  planPrice:        { fontSize: 15, fontFamily: 'Poppins-Bold',    color: '#111827', marginTop: 6 },
  planPriceSelected:{ color: '#CE4002' },
  planTextSelected: { color: '#CE4002' },

  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#111827', marginBottom: 4 },
  featureRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText:   { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#374151', flex: 1 },

  ctaSection: {
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  ctaNote: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CE4002',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
  },
  callBtnText:  { fontSize: 16, fontFamily: 'Poppins-Bold',    color: '#fff' },
  adminPhone:   { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#374151', letterSpacing: 0.5 },

  skipLink: { alignItems: 'center', marginTop: 16 },
  skipLinkText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#6B7280' },
})
