import { StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCartStore } from '@/store/cart.store'
import { useResponsive } from '@/hooks/useResponsive'
import { useTranslation } from 'react-i18next'
import {
  HomeIcon,
  SuppliersNavIcon,
  CartIcon,
  OrdersIcon,
  ProfileIcon,
} from '@/constants/icons'

const ACTIVE   = '#CE4002'
const INACTIVE = '#9CA3AF'

function TabIcon({ icon, focused, size }: { icon: any; focused: boolean; size: number }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={focused ? ACTIVE : INACTIVE}
      strokeWidth={focused ? 2 : 1.5}
    />
  )
}

function CartTabIcon({ focused, size }: { focused: boolean; size: number }) {
  const count = useCartStore(s => s.getItemCount())
  return (
    <View>
      <TabIcon icon={CartIcon} focused={focused} size={size} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { tabIconSize, tabFontSize, tabBarHeight, isTablet } = useResponsive()
  const { t } = useTranslation()

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
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Bold',
          fontSize: tabFontSize,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ focused }) => <TabIcon icon={HomeIcon} focused={focused} size={tabIconSize} />,
        }}
      />
      <Tabs.Screen
        name='suppliers'
        options={{
          title: t('nav.suppliers'),
          tabBarIcon: ({ focused }) => <TabIcon icon={SuppliersNavIcon} focused={focused} size={tabIconSize} />,
        }}
      />
      <Tabs.Screen
        name='cart'
        options={{
          title: t('nav.cart'),
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} size={tabIconSize} />,
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: t('nav.orders'),
          tabBarIcon: ({ focused }) => <TabIcon icon={OrdersIcon} focused={focused} size={tabIconSize} />,
        }}
      />
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

const styles = StyleSheet.create({
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
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
})
