import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { authenticateUser, getCurrentUser } from '@/lib/database';
import { requestNotificationPermissions } from '@/lib/notifications';

import { AuthScreenShell } from './auth-screen-shell';
import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function redirectAuthenticatedUser() {
      const user = await getCurrentUser();

      if (user && isMounted) {
        router.replace('/home');
      }
    }

    redirectAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLoginPress() {
    if (!email.trim() || !password) {
      setErrorMessage('Informe e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await authenticateUser(email, password);
      // Request notification permission after login — user has context at this point.
      // Non-blocking: navigation proceeds regardless of permission outcome.
      await requestNotificationPermissions();
      router.replace('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenShell>
      <LoginHero />
      <LoginForm
        email={email}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onCreateAccountPress={() => router.replace('/signup')}
        onLoginPress={handleLoginPress}
        password={password}
      />
    </AuthScreenShell>
  );
}
