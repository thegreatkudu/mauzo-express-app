/**
 * @file _layout.tsx  (tabs)
 * @description Root layout for the authenticated tab navigator.
 *
 * Renders the bottom tab bar with six tabs:
 *   Home → Suppliers → Cart → Orders → Analytics → Profile
 *
 * Key design decisions:
 * - All tab icons are wrapped in `TabIcon`, which drives a spring scale
 *   animation via Reanimated whenever the focused state changes.
 * - The Cart tab uses `CartTabIcon` (a superset of `TabIcon`) so it can
 *   overlay the live item-count badge from the Zustand cart store.
 * - On small phones (width < 375 px) label text is hidden entirely so that
 *   six icons fit comfortably without crowding.
 * - Tab bar height, icon size, and font size are sourced from `useResponsive`
 *   to scale correctly on tablets and large phones.
 *
 * Adding a new tab:
 *   1. Create the screen file under `src/app/(tabs)/`.
 *   2. Add a `<Tabs.Screen>` entry below with `name` matching the filename.
 *   3. Export the appropriate icon from `src/constants/icons.ts`.
 *   4. Add the `nav.<key>` translation key to both locale files.
 */

import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useCartStore } from '@/store/cart.store'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import { spring } from '@/constants/animations'
import {
  HomeIcon,
  SuppliersNavIcon,
  CartIcon,
  OrdersIcon,
  ProfileIcon,
  AnalyticsIcon,
} from '@/constants/icons'

/** Brand colour used for the active tab indicator and tint. */
const ACTIVE   = '#CE4002'
/** Neutral grey for inactive tab items. */
const INACTIVE = '#9CA3AF'

// ─── TabIcon ──────────────────────────────────────────────────────────────────

/**
 * Animated wrapper around a HugeiconsIcon that scales up when the tab is focused.
 *
 * The spring scale (1.0 → 1.12 on focus) provides tactile feedback that the
 * tab is active without shifting the icon's layout position.
 *
 * @param icon    - HugeIcons icon definition (imported from `@hugeicons/core-free-icons`).
 * @param focused - Whether this tab is currently selected; drives the scale spring.
 * @param size    - Base icon size in dp, provided by the Tabs navigator's `tabBarIcon` render prop.
 */
function TabIcon({ icon, focused, size }: { icon: any; focused: boolean; size: number }) {
  const scale = useSharedValue(1)

  // Re-run the spring whenever focus changes; Reanimated executes this on the UI thread.
  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, spring.press)
  }, [focused])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animStyle}>
      <HugeiconsIcon
        icon={icon}
        size={size}
        color={focused ? ACTIVE : INACTIVE}
        // Slightly heavier stroke on the active icon to reinforce selection state.
        strokeWidth={focused ? 2 : 1.5}
      />
    </Animated.View>
  )
}

// ─── CartTabIcon ──────────────────────────────────────────────────────────────

/**
 * Specialised tab icon for the Cart tab that renders a live item-count badge.
 *
 * Reads the cart item count directly from the Zustand `useCartStore` so the
 * badge stays in sync with cart mutations without any prop drilling.
 * The badge is hidden when the cart is empty to avoid visual noise.
 *
 * @param focused - Forwarded to the underlying `TabIcon`.
 * @param size    - Forwarded to the underlying `TabIcon`.
 */
function CartTabIcon({ focused, size }: { focused: boolean; size: number }) {
  // Subscribe only to the derived item count — avoids re-renders on unrelated store changes.
  const count = useCartStore(s => s.getItemCount())
  return (
    <View>
      <TabIcon icon={CartIcon} focused={focused} size={size} />
      {count > 0 && (
        <View style={styles.badge}>
          {/* Cap at "9+" to prevent the badge from overflowing its pill shape. */}
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  )
}

// ─── TabsLayout ───────────────────────────────────────────────────────────────

/**
 * Root navigator for the authenticated section of the app.
 *
 * Responsibilities:
 * - Configures the Expo Router `<Tabs>` shell with shared `screenOptions`.
 * - Registers all six tab screens, wiring each to its animated icon.
 * - Adapts the tab bar height and label visibility to the device form factor.
 *
 * Safe area:
 * The tab bar padding accounts for `insets.bottom` so content is never
 * obscured by the home indicator on notched / gesture-navigation devices.
 *
 * Small phone heuristic:
 * Phones narrower than 375 dp hide tab labels so that six icons fit without
 * truncation. `useResponsive` surfaces this via `isSmallPhone`.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { tabIconSize, tabFontSize, tabBarHeight, isTablet, isSmallPhone } = useResponsive()
  const { t } = useTranslation()

  // Hide labels on small phones to give the six icons enough horizontal breathing room.
  const showLabels = !isSmallPhone

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#EFEFEF',
          height: tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom + (isTablet ? 10 : 4),
          paddingTop: isTablet ? 10 : 6,
        },
        tabBarActiveTintColor:   ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarShowLabel: showLabels,
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Bold',
          fontSize: tabFontSize,
          marginTop: 2,
        },
      }}
    >
      {/* ── Home ── */}
      <Tabs.Screen
        name='index'
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ focused }) => <TabIcon icon={HomeIcon} focused={focused} size={tabIconSize} />,
        }}
      />

      {/* ── Suppliers ── */}
      <Tabs.Screen
        name='suppliers'
        options={{
          title: t('nav.suppliers'),
          tabBarIcon: ({ focused }) => <TabIcon icon={SuppliersNavIcon} focused={focused} size={tabIconSize} />,
        }}
      />

      {/* ── Cart — shows live badge ── */}
      <Tabs.Screen
        name='cart'
        options={{
          title: t('nav.cart'),
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} size={tabIconSize} />,
        }}
      />

      {/* ── Orders ── */}
      <Tabs.Screen
        name='orders'
        options={{
          title: t('nav.orders'),
          tabBarIcon: ({ focused }) => <TabIcon icon={OrdersIcon} focused={focused} size={tabIconSize} />,
        }}
      />

      {/* ── Analytics ── */}
      <Tabs.Screen
        name='analytics'
        options={{
          title: t('nav.analytics'),
          tabBarIcon: ({ focused }) => <TabIcon icon={AnalyticsIcon} focused={focused} size={tabIconSize} />,
        }}
      />

      {/* ── Profile ── */}
      <Tabs.Screen
        name='profile'
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ focused }) => <TabIcon icon={ProfileIcon} focused={focused} size={tabIconSize} />,
        }}
      />
    </Tabs>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Red notification badge overlaid on the cart icon. */
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    // White border creates separation from the icon below.
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
})
