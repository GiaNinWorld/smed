import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthScreenShell } from './auth-screen-shell';
import { LoginHero } from './login-hero';
import { SignupForm } from './signup-form';

const signupSubtitle = 'Crie sua conta para gerenciar medicamentos e pacientes no SMED.';

export function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleBackToLogin() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  return (
    <AuthScreenShell>
      <LoginHero onBackPress={handleBackToLogin} subtitle={signupSubtitle} />
      <SignupForm
        confirmPassword={confirmPassword}
        email={email}
        name={name}
        onBackToLoginPress={handleBackToLogin}
        onChangeConfirmPassword={setConfirmPassword}
        onChangeEmail={setEmail}
        onChangeName={setName}
        onChangePassword={setPassword}
        password={password}
      />
    </AuthScreenShell>
  );
}
