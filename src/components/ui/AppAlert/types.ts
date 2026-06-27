export type AlertVariant = 'default' | 'danger' | 'warning' | 'success' | 'info'

export interface AlertConfig {
  title: string
  message?: string
  variant?: AlertVariant
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  showCancel?: boolean
}

export interface AppAlertContextType {
  showAlert: (config: AlertConfig) => void
}
