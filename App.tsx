import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from './src/hooks/useAuth';
import { LoadingScreen } from './src/components/LoadingScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { AppNavigator } from './src/navigation';

type AuthScreen = 'login' | 'signup';

export default function App() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        {authScreen === 'login' ? (
          <LoginScreen onSwitchToSignup={() => setAuthScreen('signup')} />
        ) : (
          <SignupScreen onSwitchToLogin={() => setAuthScreen('login')} />
        )}
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppNavigator user={user} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
