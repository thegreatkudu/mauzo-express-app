import { create } from 'zustand'

/**
 * Minimal UI-state store for cross-screen coordination that doesn't
 * belong in the auth or cart stores.
 *
 * `homeReady` — set to true by HomeScreen once its critical queries
 * (summary + orders) have resolved. The root layout's SplashCover
 * watches this flag to know when it's safe to fade out and reveal
 * the home screen content.
 */
interface UiState {
  homeReady: boolean
  setHomeReady: (ready: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  homeReady: false,
  setHomeReady: (ready) => set({ homeReady: ready }),
}))
