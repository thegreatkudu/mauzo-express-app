import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BottomSheet, { BottomSheetView } from '@expo/ui/community/bottom-sheet'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useTheme, useThemeStyles } from '@/hooks/use-theme'
import { CartStoreItem } from '@/store/cart.store'
import { CATEGORY_META } from '@/data/mock'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON, TrashIcon } from '@/constants/icons'
import type { AppTheme } from '@/hooks/use-theme'

interface Props {
  item: CartStoreItem | null
  onConfirm: () => void
  onCancel: () => void
}

export default function RemoveConfirmSheet({ item, onConfirm, onCancel }: Props) {
  const { theme } = useTheme()
  const styles = useThemeStyles(makeStyles)
  const visible = item !== null

  const meta = item
    ? (CATEGORY_META[item.product.category] ?? { color: theme.colors.primary, icon: 'bag-outline', bg: theme.colors.primaryLight })
    : { color: theme.colors.primary, icon: 'bag-outline', bg: theme.colors.primaryLight }
  const categoryIcon = item
    ? (CATEGORY_ICON_MAP[meta.icon] ?? DEFAULT_CATEGORY_ICON)
    : DEFAULT_CATEGORY_ICON

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onCancel}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
    >
      <BottomSheetView style={styles.content}>
        {item && (
          <>
            {/* heading */}
            <View style={styles.headingRow}>
              <View style={[styles.warningIcon, { backgroundColor: theme.colors.dangerBg }]}>
                <HugeiconsIcon icon={TrashIcon} size={22} color={theme.colors.danger} strokeWidth={1.5} />
              </View>
              <View style={styles.headingText}>
                <Text style={styles.title}>Remove item?</Text>
                <Text style={styles.subtitle}>This item will be removed from your cart</Text>
              </View>
            </View>

            {/* item preview */}
            <View style={styles.itemPreview}>
              <View style={[styles.thumbWrap, { backgroundColor: meta.color + '18' }]}>
                <HugeiconsIcon icon={categoryIcon} size={24} color={meta.color} strokeWidth={1.5} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                {item.variant?.size && <Text style={styles.itemMeta}>Size: {item.variant.size}</Text>}
                {item.variant?.color && <Text style={styles.itemMeta}>Color: {item.variant.color}</Text>}
                <Text style={styles.itemPrice}>${item.product.price.toFixed(2)} × {item.quantity}</Text>
              </View>
            </View>

            {/* actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.75}>
                <Text style={styles.cancelText}>Keep item</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={onConfirm} activeOpacity={0.85}>
                <Text style={styles.removeText}>Yes, remove</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
}

function makeStyles({ colors }: AppTheme) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 8,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 20,
    },
    warningIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headingText: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontFamily: 'Poppins-Bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      color: colors.textMuted,
      marginTop: 2,
    },
    itemPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.cardAlt,
      borderRadius: 14,
      padding: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    thumbWrap: {
      width: 56,
      height: 56,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemInfo: {
      flex: 1,
      gap: 2,
    },
    itemName: {
      fontSize: 14,
      fontFamily: 'Poppins-SemiBold',
      color: colors.text,
      lineHeight: 20,
    },
    itemMeta: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: colors.textMuted,
    },
    itemPrice: {
      fontSize: 14,
      fontFamily: 'Poppins-Bold',
      color: colors.primary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelBtn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      fontSize: 15,
      fontFamily: 'Poppins-SemiBold',
      color: colors.textSub,
    },
    removeBtn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeText: {
      fontSize: 15,
      fontFamily: 'Poppins-SemiBold',
      color: '#FFFFFF',
    },
  })
}
