import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from 'react-native';

import { ProfileForm } from './profile-form';
import { ProfileHero } from './profile-hero';
import { profilePalette } from './profile-theme';

export function ProfileScreen() {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.screen}>
        <ProfileHero onBackPress={goBack} />
        <ProfileForm onCancelPress={goBack} onSavePress={goBack} />
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
