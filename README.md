# Ananke Mobile 📱

A React Native + Expo mobile app for the **Ananke Productivity Enforcement Engine** — connecting directly to the Ananke Supabase backend.

## Features

- ✅ **Tasks** — View, create, complete, and delete tasks with priorities, deadlines, modes (digital/physical), and tags
- ✅ **Notes** — Full notes editor with notebooks, pinning, and tags
- ✅ **Calendar** — Monthly calendar view with event creation
- ✅ **Notifications** — Real-time in-app notifications with read/unread management
- ✅ **Profile** — Account info, plan details, and sign out
- ✅ **Real-time sync** — All data syncs live via Supabase Realtime channels
- ✅ **Push notifications** — Expo push notifications with device registration in `mobile_sync`
- ✅ **Cross-platform** — iOS and Android

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native + Expo (SDK 51) |
| Backend | Supabase (same DB as web app) |
| Auth | Supabase Auth (email/password) |
| Navigation | React Navigation v6 (bottom tabs) |
| Real-time | Supabase Realtime channels |
| Push | Expo Notifications |
| Storage | AsyncStorage (Supabase session) |
| Language | TypeScript |

## Supabase Tables Used

| Table | Usage |
|-------|-------|
| `tasks` | Task list, create, complete, delete |
| `notes` | Notes CRUD |
| `notebooks` | Notebook organization |
| `calendar_events` | Calendar view & events |
| `notifications` | In-app notifications |
| `profiles` | User profile display |
| `mobile_sync` | Device registration + push token |
| `sync_queue` | Future: offline sync queue |

## Setup & Run

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for development)

### 1. Install dependencies
```bash
cd ananke-mobile
npm install
```

### 2. Configure environment
Create `.env` in the root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://mxzlvcmhxdsfhauujfko.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Start development server
```bash
npx expo start
```

Scan the QR code with **Expo Go** on your iOS or Android device.

### 4. Run on simulator
```bash
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
```

## Building for Production (EAS Build)

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Configure EAS
```bash
eas build:configure
```

### Build APK/IPA
```bash
eas build --platform android   # APK for Android
eas build --platform ios       # IPA for iOS
eas build --platform all       # Both
```

## Project Structure

```
ananke-mobile/
├── App.tsx                          # Root component, auth gate
├── app.json                         # Expo config
├── assets/                          # Icons, splash screen
└── src/
    ├── lib/
    │   ├── supabase.ts              # Supabase client (AsyncStorage session)
    │   └── notifications.ts         # Push notification setup + device registration
    ├── hooks/
    │   ├── useAuth.ts               # Auth state, sign in/up/out
    │   ├── useTasks.ts              # Tasks CRUD + real-time
    │   ├── useNotes.ts              # Notes + notebooks CRUD + real-time
    │   ├── useCalendarEvents.ts     # Calendar events + real-time
    │   ├── useNotifications.ts      # In-app notifications + real-time
    │   └── useProfile.ts            # User profile
    ├── navigation/
    │   └── index.tsx                # Bottom tab navigator
    ├── components/
    │   ├── TaskCard.tsx             # Task list item
    │   ├── EmptyState.tsx           # Empty list placeholder
    │   └── LoadingScreen.tsx        # Loading splash
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx      # Email/password login
    │   │   └── SignupScreen.tsx     # Account creation
    │   ├── tasks/
    │   │   ├── TasksScreen.tsx      # Task list with filters
    │   │   ├── AddTaskModal.tsx     # New task form
    │   │   └── TaskDetailModal.tsx  # Task detail view
    │   ├── notes/
    │   │   ├── NotesScreen.tsx      # Notes list + notebook filter
    │   │   └── NoteEditorModal.tsx  # Full-screen note editor
    │   ├── calendar/
    │   │   └── CalendarScreen.tsx   # Monthly calendar + events
    │   ├── notifications/
    │   │   └── NotificationsScreen.tsx
    │   └── profile/
    │       └── ProfileScreen.tsx
    └── theme/
        └── index.ts                 # Colors, typography, spacing
```

## Design System

Matches the Ananke web app aesthetic:
- **Background**: Warm beige `#FBF7F0`
- **Primary**: Deep navy `#1A1A2E`
- **Accent**: Warm gold `#E8A830`
- **Surface**: Pure white `#FFFFFF`
- **Border**: Tan `#E8DCC4`

## Connecting to Ananke Web App

This mobile app shares the **exact same Supabase database** as the web app at [ananke](https://github.com/aegis504/ananke). Any task created/completed on mobile instantly appears on the web app and vice versa — full bidirectional real-time sync.

## License

© Ananke. All rights reserved.
