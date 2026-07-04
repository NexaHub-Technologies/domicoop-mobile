# DOMICOOP - Dominion Co-operative Society

<p align="center">
  <img src="./assets/images/logos/domicoop-logo.png" alt="DOMICOOP Logo" width="120" />
</p>

<p align="center">
  <strong>Born to Dominate</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#design-system">Design System</a>
</p>

---

## 📱 Overview

DOMICOOP is the official **digital passbook** for members of **Dominion Co-operative Society**. It replaces the paper passbook with a secure, always-available record of each member's savings, contributions, and loans — letting members see their standing, apply for loans, and track transactions from their phone.

### Key Features

- **💰 Savings Management**: Track contributions, view transaction history, and monitor savings growth
- **💳 Loan Services**: Apply for loans, view loan details, and make payments
- **🌙 Dark Mode Support**: Full dark mode implementation with system preference detection
- **🔒 Secure Authentication**: Multi-factor authentication with biometric support
- **📊 Financial Dashboard**: Visual overview of savings, loans, and recent activities
- **🔔 Smart Notifications**: Real-time alerts for transactions, payments, and community updates
- **📱 Cross-Platform**: Built with React Native and Expo for iOS and Android

---

## 🎨 Design System

DOMICOOP follows the **"Blue Cobalt Archive"** design system — see [DESIGN.md](./DESIGN.md) for the full spec (tokens, typography, elevation rules, primitives).

- **Primary Color**: Blue Cobalt (#0b50da)
- **Typography**: Plus Jakarta Sans (display, money) + Inter (body), natively embedded
- **Elevation discipline**: flat/hairline surfaces by default; cobalt glow reserved for hero money cards and primary CTAs
- **Theme Support**: Light ("Blue Cobalt Archive"), Dark ("Nocturnal Cobalt"), and System Default

### Color Palette

Token source of truth: `constants/theme/colors.ts`.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Primary | #0b50da | #1e55be |
| Primary (interactive/text) | #0b50da | #5b8bff |
| Background | #f5f6f8 | #0b1326 |
| Surface | #ffffff | #0b1326 |
| On Surface | #0f172a | #dae2fd |
| Success | #22c55e | #4ade80 |
| Warning | #f59e0b | #fbbf24 |
| Error | #ef4444 | #ba1a1a |

---

## 🛠 Tech Stack

### Core
- **Framework**: [Expo](https://expo.dev) ~54.0.33
- **React**: 19.1.0
- **React Native**: 0.81.5
- **Router**: [Expo Router](https://docs.expo.dev/router/introduction/) ~6.0.23

### UI & Styling
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) ~4.1.1
- **Gestures**: [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) ~2.28.0
- **Icons**: [@expo/vector-icons](https://docs.expo.dev/guides/icons/) ^15.0.3
- **Linear Gradient**: [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) ~55.0.9

### State Management & Storage
- **Persistent State**: AsyncStorage with custom hooks
- **Theme State**: React Context API with AsyncStorage persistence

### Utilities
- **TypeScript**: ~5.9.2
- **Linting**: ESLint with Expo config
- **Safe Areas**: [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) ~5.6.0

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nexahub-tech/domicoop-mobile.git
   cd domicoop-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

### Build for Production

```bash
# Create native builds
npx expo prebuild

# Build for iOS
npx expo run:ios

# Build for Android  
npx expo run:android
```

---

## 📁 Project Structure

```
domicoop/
├── app/                          # Main application code (Expo Router)
│   ├── (auth)/                   # Auth group routes
│   │   ├── _layout.tsx          # Auth layout with SafeAreaProvider
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── splash.tsx
│   │   └── welcome.tsx
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── step-1.tsx           # Grow Your Savings
│   │   ├── step-2.tsx           # Instant Access to Loans
│   │   └── step-3.tsx           # Join Community
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Dashboard
│   │   ├── loans.tsx
│   │   ├── profile.tsx
│   │   └── savings.tsx
│   ├── loans/
│   │   └── [id].tsx             # Loan detail screen
│   ├── savings/
│   │   └── [id].tsx             # Savings detail screen
│   ├── settings/
│   │   ├── change-password.tsx
│   │   ├── edit-profile.tsx
│   │   ├── notification-preferences.tsx
│   │   ├── security.tsx
│   │   └── theme-preference.tsx
│   ├── transactions/
│   │   ├── add-contribution.tsx
│   │   ├── apply-for-loan.tsx
│   │   ├── contribution-details.tsx
│   │   ├── contribution-details-info.tsx
│   │   └── make-payment.tsx
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry point
│   ├── notifications/
│   │   └── index.tsx
│   ├── success/
│   │   └── index.tsx
│   └── support/
│       └── index.tsx
├── components/                   # Reusable components
│   ├── auth/                    # Auth-related components
│   ├── common/                  # Shared UI components
│   ├── dashboard/               # Dashboard-specific
│   ├── forms/                   # Form inputs & controls
│   ├── loans/                   # Loan components
│   ├── modals/                  # Modal dialogs
│   ├── notifications/           # Notification components
│   ├── profile/                 # Profile components
│   ├── savings/                 # Savings components
│   ├── settings/                # Settings components
│   ├── support/                 # Support components
│   └── tabs/                    # Tab bar component
├── constants/                    # App constants
│   ├── colors.ts
│   └── typography.ts
├── contexts/                     # React Contexts
│   └── ThemeContext.tsx         # Theme management
├── data/                         # Mock data & types
│   └── mockData.ts
├── hooks/                        # Custom React hooks
│   └── usePersistentState.ts
├── styles/                       # Global styles
│   └── theme.ts
├── assets/                       # Static assets
│   └── images/
│       ├── auth/                # Hero images
│       └── logos/               # App logos
└── types/                        # TypeScript types
    └── index.ts
```

---

## 🎭 Available Screens

### Authentication
- **Splash Screen** - App launch with logo animation
- **Welcome Screen** - Entry point with social login options
- **Sign In** - Email/password login with "Remember me"
- **Sign Up** - Account creation with password strength indicator
- **Forgot Password** - Password reset flow
- **Reset Password** - New password creation

### Onboarding
- **Step 1** - Grow Your Savings
- **Step 2** - Instant Access to Loans  
- **Step 3** - Join a Thriving Community

### Main App (Tab Navigation)
- **Dashboard** - Overview of savings, loans, and recent transactions
- **Loans** - Active loans list with apply button
- **Savings** - Contribution history and portfolio
- **Profile** - Account settings and preferences

### Transaction Flows
- **Make Payment** - Pay outstanding loans
- **Add Contribution** - Add to savings
- **Apply for Loan** - Loan application form
- **Contribution Details** - Transaction breakdown

### Settings
- **Edit Profile** - Update personal information
- **Change Password** - Password management
- **Notification Preferences** - Alert settings
- **Security Settings** - 2FA and biometric auth
- **Theme Preference** - Light/Dark/System theme selection

---

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration (`npm run lint`)
- Use functional components with hooks
- Implement proper error handling

### Component Structure
```typescript
// Example component structure
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  title: string;
}

export const MyComponent: React.FC<Props> = ({ title }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.onSurface,
  },
});
```

### Theme Usage
Always use theme colors from the `useTheme()` hook:
```typescript
const { colors, isDarkMode } = useTheme();
```

### Safe Areas
Use `SafeAreaView` and `useSafeAreaInsets` for proper spacing:
```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
```

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🤝 Support

For support, email support@domicoop.com or join our community chat.

---

<p align="center">
  Built with ❤️ by the DOMICOOP Team
</p>
