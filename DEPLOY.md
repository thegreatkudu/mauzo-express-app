# Mauzo Express — Developer Setup & Deployment Guide

## Overview

**Mauzo Express** is a React Native mobile app built with [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) and [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing). It targets Android, iOS, and Web. The app currently ships with a built-in **demo mode** that bypasses the real backend, making it easy to run locally with zero API setup.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 18.x LTS+ | 20.x recommended |
| npm | 10.x+ | ships with Node 20 |
| Expo CLI | latest | installed via `npx` — no global install needed |
| Git | any recent | — |
| Expo Go (mobile) | latest | optional, for physical device testing |

For **native builds** (not required to run in demo mode):

| Tool | Purpose |
|------|---------|
| Android Studio + SDK | Android emulator / native build |
| Xcode 15+ (macOS only) | iOS simulator / native build |
| EAS CLI | Cloud builds and OTA updates |

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd multi-vendor-ecommerce-app
npm install
```

> The project uses `legacy-peer-deps=true` (set in `.npmrc`) to resolve React 19 peer conflicts — `npm install` handles this automatically.

---

## 2. Environment & Configuration

### Demo mode (default — no backend required)

The project ships with demo mode **on**. You can run the full app immediately without any API keys or backend.

Demo credentials are defined in `src/config/demo.ts`:

```
Phone:    0700000000
Password: password123
```

### Connecting to the real backend

When you are ready to point at the real API:

1. Open `src/config/demo.ts` and set:

   ```ts
   export const DEMO_MODE = false
   ```

2. Confirm the API base URL in `src/constants/config.ts`:

   ```ts
   export const API_BASE_URL = 'https://api.mauzo.co.tz/api/mobile'
   ```

   Change this value if you are targeting a staging or local server.

3. The app stores JWT tokens in `expo-secure-store` — no `.env` file or additional secrets are needed for the mobile client itself.

---

## 3. Run Locally

### Start the Metro bundler

```bash
npm start
# or
npx expo start
```

The terminal will show a QR code and menu options.

### Open on a device or simulator

| Target | Command | Requirement |
|--------|---------|-------------|
| Expo Go (physical device) | scan QR code | Expo Go app installed |
| Android emulator | press `a` | Android Studio + AVD set up |
| iOS simulator | press `i` | macOS + Xcode |
| Web browser | press `w` | none |

Dedicated scripts:

```bash
npm run android   # opens Android emulator
npm run ios       # opens iOS simulator
npm run web       # opens browser
```

---

## 4. Project Structure

```
src/
  api/          # Axios client + per-resource API calls
  app/          # Expo Router file-based routes
  components/   # Shared UI components
  config/       # demo.ts — toggle demo/production mode here
  constants/    # config.ts — API base URL, pagination, etc.
  hooks/        # Custom React hooks
  i18n/         # Internationalisation (i18next)
  screens/      # Full-screen components consumed by routes
  services/     # Business-logic services (auth, etc.)
  store/        # Zustand global state stores
  theme/        # Design tokens (colours, typography, shadows)
  types/        # TypeScript type definitions
  utils/        # Utility helpers
  validation/   # Zod schemas
```

---

## 5. Building for Production

Production builds require [EAS (Expo Application Services)](https://expo.dev/eas). You must have an Expo account and the EAS CLI installed.

```bash
npm install -g eas-cli
eas login
```

**Before building**, make sure demo mode is off (`DEMO_MODE = false` in `src/config/demo.ts`).

### Android APK / AAB

```bash
# APK (for direct install / testing)
eas build --platform android --profile preview

# AAB (for Play Store submission)
eas build --platform android --profile production
```

### iOS IPA

```bash
eas build --platform ios --profile production
```

> iOS builds require an Apple Developer account and valid provisioning profile/certificate. EAS handles credential management interactively on the first run.

### Web (static export)

```bash
npx expo export --platform web
```

Output is written to the `dist/` directory. Deploy to any static host (Netlify, Vercel, Cloudflare Pages, etc.).

---

## 6. OTA Updates (EAS Update)

After a production build is live you can ship JavaScript-only updates without going through the app stores:

```bash
eas update --branch production --message "describe the change"
```

---

## 7. Code Quality

```bash
npm run lint        # Expo's built-in ESLint check
```

TypeScript is checked as part of the build. Run a standalone type-check with:

```bash
npx tsc --noEmit
```

---

## 8. Sentry (Error Monitoring)

The app integrates `@sentry/react-native`. To enable it in production:

1. Create a project at [sentry.io](https://sentry.io).
2. Add your DSN to the Sentry configuration (follow [Sentry's Expo guide](https://docs.sentry.io/platforms/react-native/manual-setup/expo/)).
3. The `@sentry/react-native` plugin in `app.json` handles source-map uploads automatically during EAS builds.

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm install` peer-dep errors | Already handled by `.npmrc` — ensure you are not passing `--legacy-peer-deps=false` |
| Metro bundler cache issues | `npx expo start --clear` |
| `Unable to resolve module` after install | `npm install && npx expo start --clear` |
| App shows "No internet connection" in non-demo mode | Check `API_BASE_URL` in `src/constants/config.ts` |
| iOS simulator not opening | Ensure Xcode Command Line Tools are installed: `xcode-select --install` |
| Android emulator not found | Open Android Studio → AVD Manager → create/start a virtual device |

---

## 10. Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~56.0.11` | Core SDK |
| `expo-router ~56.2.10` | File-based navigation |
| `react-native 0.85.3` | Native runtime |
| `nativewind ^4.2.5` + `tailwindcss` | Utility-first styling |
| `@tanstack/react-query` | Server state / data fetching |
| `zustand` | Client state management |
| `axios` | HTTP client |
| `expo-secure-store` | Secure JWT storage |
| `react-hook-form` + `zod` | Forms and validation |
| `react-native-reanimated` | Animations |
| `i18next` + `react-i18next` | Internationalisation |
| `@sentry/react-native` | Error monitoring |
