import { useState } from 'react'
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { VendorStore } from '@/types'
import { TickIcon, AddIcon, MessageIcon, ShareIcon } from '@/constants/icons'

interface Props {
  vendor: VendorStore
  onMessage: () => void
}

export default function VendorActionRow({ vendor, onMessage }: Props) {
  const [following, setFollowing] = useState(vendor.isFollowing)

  function handleShare() {
    Share.share({ message: `Check out ${vendor.name} on our app! ${vendor.tagline}` })
  }

  return (
    <View style={styles.row}>
      {/* Follow */}
      <TouchableOpacity
        onPress={() => setFollowing(f => !f)}
        activeOpacity={0.85}
        style={styles.followWrapper}
      >
        {following ? (
          <View style={[styles.followBtn, { borderColor: vendor.color, borderWidth: 1.5 }]}>
            <HugeiconsIcon icon={TickIcon} size={15} color={vendor.color} strokeWidth={2} />
            <Text style={[styles.followingText, { color: vendor.color }]}>Following</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[vendor.color, vendor.color + 'cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.followBtn}
          >
            <HugeiconsIcon icon={AddIcon} size={15} color='#fff' strokeWidth={2} />
            <Text style={styles.followText}>Follow</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Message */}
      <TouchableOpacity onPress={onMessage} style={[styles.iconBtn, { backgroundColor: vendor.color + '15' }]} activeOpacity={0.8}>
        <HugeiconsIcon icon={MessageIcon} size={18} color={vendor.color} strokeWidth={1.5} />
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity onPress={handleShare} style={[styles.iconBtn, { backgroundColor: '#F3F4F6' }]} activeOpacity={0.8}>
        <HugeiconsIcon icon={ShareIcon} size={18} color='#374151' strokeWidth={1.5} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  followWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  followText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  followingText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
