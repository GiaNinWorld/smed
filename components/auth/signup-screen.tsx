import { useRouter } from 'expo-router';
import { useState } from 'react';

import { createUserAccount } from '@/lib/database';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBackToLogin() {
    router.replace('/');
  }

  async function handleSignupPress() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createUserAccount({ email, fullName: name, password });
      router.replace('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenShell>
      <LoginHero onBackPress={handleBackToLogin} subtitle={signupSubtitle} />
      <SignupForm
        confirmPassword={confirmPassword}
        email={email}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        name={name}
        onBackToLoginPress={handleBackToLogin}
        onChangeConfirmPassword={setConfirmPassword}
        onChangeEmail={setEmail}
        onChangeName={setName}
        onChangePassword={setPassword}
        onSignupPress={handleSignupPress}
        password={password}
      />
    </AuthScreenShell>
  );
}
