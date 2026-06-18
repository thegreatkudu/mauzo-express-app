// Tanzania phone number utilities (SRS §2.4 + §3.1.2)

/** Convert display format (07XXXXXXXX / 06XXXXXXXX) → API format (255XXXXXXXXX) */
export function toApiPhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('255')) return digits
  if (digits.startsWith('0')) return '255' + digits.slice(1)
  return '255' + digits
}

/** Convert 255XXXXXXXXX → display format 07XXXXXXXX */
export function toDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('255')) return '0' + digits.slice(3)
  return digits
}

/** Mask for non-critical display: 07XXXX1234 */
export function maskPhone(phone: string): string {
  const display = toDisplayPhone(phone)
  if (display.length < 6) return display
  return display.slice(0, 2) + 'XXXX' + display.slice(-4)
}

/** Validate Tanzanian phone number (07XXXXXXXX or 06XXXXXXXX, 10 digits) */
export function isValidTanzaniaPhone(input: string): boolean {
  const digits = input.replace(/\D/g, '')
  return /^(07|06)\d{8}$/.test(digits) || /^255(7|6)\d{8}$/.test(digits)
}
