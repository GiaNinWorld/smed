import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from 'react-native';

import { getCurrentUserProfile, updateCurrentUserProfile } from '@/lib/database';

import { ProfileForm } from './profile-form';
import { ProfileHero } from './profile-hero';
import { profilePalette } from './profile-theme';

export function ProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const profile = await getCurrentUserProfile();

      if (!profile || !isMounted) {
        return;
      }

      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.email);
      setBirthDate(profile.birthDate);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function goBack() {
    router.replace('/home');
  }

  async function saveProfile() {
    await updateCurrentUserProfile({
      birthDate,
      email,
      firstName,
      lastName,
      password: password || undefined,
    });
    goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.screen}>
        <ProfileHero onBackPress={goBack} />
        <ProfileForm
          birthDate={birthDate}
          email={email}
          firstName={firstName}
          lastName={lastName}
          onCancelPress={goBack}
          onChangeBirthDate={setBirthDate}
          onChangeEmail={setEmail}
          onChangeFirstName={setFirstName}
          onChangeLastName={setLastName}
          onChangePassword={setPassword}
          onSavePress={saveProfile}
          password={password}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: profilePalette.hero,
  },
  screen: {
    flex: 1,
    backgroundColor: profilePalette.background,
  },
});
