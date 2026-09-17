import React from 'react';
import { ThemeProvider } from '@/lib/theme-provider';
import AuthScreen from '@/app/sign-up-login/components/AuthScreen';

export default function SignUpLoginPage() {
  return (
    <ThemeProvider>
      <AuthScreen />
    </ThemeProvider>
  );
}