// Snapcart "Shop by Category" — circle-based category card.
// Snapcart renders category icons inside coloured circles with the name below;
// the active item fills the circle with the brand colour.
import { memo, useRef } from 'react'
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { CATEGORY_ICON_MAP, DEFAULT_CATEGORY_ICON } from '@/constants/icons'
import { C, F, R, S, TS, shadowStyles } from '@/theme'
import { Category } from '@/types'

interface Props {
  category: Category
  isActive?: boolean
  onPress?: (category: Category) => void
  /** Product count shown in small chip */
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

const CIRCLE_SIZE = { sm: 56, md: 68, lg: 80 } as const
const ICON_SIZE   = { sm: 22, md: 26, lg: 32 } as const

function CategoryCard({ category, isActive = false, onPress, count, size = 'md' }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const icon      = CATEGORY_ICON_MAP[category.icon] ?? DEFAULT_CATEGORY_ICON
  const circleD   = CIRCLE_SIZE[size]
  const iconSz    = ICON_SIZE[size]

  function onPressIn() {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start()
  }
  function onPressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start()
  }

  const circleStyle = {
    width:        circleD,
    height:       circleD,
    borderRadius: circleD / 2,
    backgroundColor: isActive ? category.color : category.bg,
    // Snapcart: active circle gets a 2px coloured ring
    borderWidth:  isActive ? 0 : 1.5,
    borderColor:  isActive ? 'transparent' : category.color + '30',
  }

  return (
    <TouchableOpacity
      onPress={() => onPress?.(category)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={styles.wrapper}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        {/* ── Circle ── */}
        <Animated.View style={[styles.circle, circleStyle, shadowStyles.card]}>
          {category.image ? (
            <>
              <Image
                source={category.image}
                style={[styles.catImage, { borderRadius: circleD / 2, opacity: isActive ? 0.7 : 1 }]}
                resizeMode='cover'
              />
              {isActive && (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', borderRadius: circleD / 2 }]}>
                  <HugeiconsIcon icon={icon} size={iconSz} color='#fff' strokeWidth={2} />
                </View>
              )}
            </>
          ) : (
            <HugeiconsIcon
              icon={icon}
              size={iconSz}
              color={isActive ? '#fff' : category.color}
              strokeWidth={isActive ? 2 : 1.5}
            />
          )}

          {/* count chip — top-right of circle */}
          {count !== undefined && count > 0 && (
            <Animated.View style={[styles.countChip, { backgroundColor: isActive ? '#fff' : category.color }]}>
              <Text style={[styles.countText, { color: isActive ? category.color : '#fff' }]}>
                {count > 99 ? '99+' : count}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Label ── */}
        <Text
          style={[
            styles.label,
            { color: isActive ? category.color : C.text, fontFamily: isActive ? F.semiBold : F.medium },
          ]}
          numberOfLines={2}
        >
          {category.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

export default memo(CategoryCard)

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 80,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.xs,
  },
  countChip: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  countText: {
    fontSize: TS.xs,
    fontFamily: F.bold,
    lineHeight: 13,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: TS.sm,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: S.xxs,
  },
})
