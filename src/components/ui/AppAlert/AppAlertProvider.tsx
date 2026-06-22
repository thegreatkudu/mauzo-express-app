import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import AppAlert from './AppAlert'
import type { AlertConfig, AppAlertContextType } from './types'

export const AppAlertContext = createContext<AppAlertContextType>({
  showAlert: () => {},
})

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [config,  setConfig]  = useState<AlertConfig | null>(null)
  const [visible, setVisible] = useState(false)

  function showAlert(cfg: AlertConfig) {
    setConfig(cfg)
    setVisible(true)
  }

  function handleDismiss() {
    setVisible(false)
  }

  return (
    <AppAlertContext.Provider value={{ showAlert }}>
      {children}
      <AppAlert visible={visible} config={config} onDismiss={handleDismiss} />
    </AppAlertContext.Provider>
  )
}

export function useAppAlert(): AppAlertContextType {
  return useContext(AppAlertContext)
}
