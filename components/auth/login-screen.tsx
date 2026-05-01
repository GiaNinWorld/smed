import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthScreenShell } from './auth-screen-shell';
import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthScreenShell>
      <LoginHero />
      <LoginForm
        email={email}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onCreateAccountPress={() => router.push('/signup')}
        onLoginPress={() => router.replace('/home')}
        password={password}
      />
    </AuthScreenShell>
  );
}
