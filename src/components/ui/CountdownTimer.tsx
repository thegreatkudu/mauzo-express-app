import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
  endsAt: Date
  onExpire?: () => void
  variant?: 'compact' | 'blocks'
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getRemaining(end: Date) {
  const diff = Math.max(0, end.getTime() - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, done: diff === 0 }
}

export default function CountdownTimer({ endsAt, onExpire, variant = 'blocks' }: Props) {
  const [{ h, m, s, done }, setState] = useState(() => getRemaining(endsAt))

  useEffect(() => {
    if (done) { onExpire?.(); return }
    const id = setInterval(() => {
      const next = getRemaining(endsAt)
      setState(next)
      if (next.done) { onExpire?.(); clearInterval(id) }
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt, done, onExpire])

  if (variant === 'compact') {
    return (
      <Text style={styles.compact}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </Text>
    )
  }

  return (
    <View style={styles.row}>
      <TimeBlock value={pad(h)} label='HRS' />
      <Text style={styles.colon}>:</Text>
      <TimeBlock value={pad(m)} label='MIN' />
      <Text style={styles.colon}>:</Text>
      <TimeBlock value={pad(s)} label='SEC' />
    </View>
  )
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockValue}>{value}</Text>
      <Text style={styles.blockLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  block: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    minWidth: 44,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  blockValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  blockLabel: {
    fontSize: 8,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  colon: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  compact: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#EF4444',
  },
})
