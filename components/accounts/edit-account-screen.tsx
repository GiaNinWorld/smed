import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { profilePalette } from '@/components/profile/profile-theme';

const sectionTitle = 'Informa\u00e7\u00f5es';
const bannerSvg = encodeURIComponent(`
<svg width="269" height="219" viewBox="0 0 269 219" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M269 210.882C269 214.776 211.833 219 143.383 219C74.9324 219 19.0005 215.488 19.0005 211.587C19.0005 207.687 269 206.982 269 210.882Z" fill="#ACD0D6"/>
  <path d="M216.298 71.9855C211.92 73.9663 207.73 76.3414 203.78 79.0815C193.743 86.1897 184.748 95.0122 177.277 106.303C169.33 118.538 154.985 137.555 151.186 152.373L170.897 160.519C194.276 162.858 201.906 154.877 204.799 148.911C211.353 135.067 214.526 127.278 217.267 119.333C220.632 111.586 221.531 90.9129 216.298 71.9855Z" fill="#ED7390"/>
  <path d="M184.478 139.707L216.327 71.9928C216.327 71.9928 209.335 89.1785 202.89 104.176C200.147 110.574 199.365 112.15 197.161 116.979C191.225 129.811 186.373 139.21 184.478 139.707Z" fill="#D95474"/>
  <path d="M43.5353 52.137C48.9512 55.2043 54.0804 58.7546 58.8606 62.745C71.2067 73.3458 77.272 80.4375 82.5484 88.1062C91.6116 101.228 101.046 121.794 103.049 142.852C104.434 155.734 103.049 154.899 103.049 154.899C101.664 154.064 66.4407 182.419 66.4407 182.419C61.7318 174.798 56.1257 164.924 52.1347 157.965C46.4783 147.645 40.7789 136.324 38.4962 128.919C34.6159 113.233 33.7178 103.793 34.0817 94.3601C34.7277 86.2926 36.064 74.552 43.5353 52.137Z" fill="#F7AB61"/>
  <path d="M43.5353 52.137C48.9512 55.2043 54.0804 58.7546 58.8606 62.745C71.2067 73.3459 77.272 80.4376 82.5484 88.1062C89.6116 108.228 101.046 121.837 103.049 142.873C104.434 155.755 103.049 154.92 103.049 154.92L71.7309 134.496L43.5353 52.137Z" fill="#FFC68D"/>
  <path d="M100.91 204.736C96.2945 209.133 80.8615 206.895 69.2042 202.268C55.7022 196.136 46.81 190.031 41.5541 185.19C33.5471 176.481 26.416 163.947 21.843 152.308C18.3091 141.735 17.6079 136.907 17.6079 136.907C18.5698 138.987 20.8165 151.164 20.9314 151.48C22.9067 157.782 25.63 163.822 29.0427 169.472C33.5471 176.481 37.3129 181.068 41.5541 185.19C46.81 190.031 55.7022 196.136 68.9817 202.858C77.5955 206.262 96.1509 207.723 101.341 205.197L100.91 204.736Z" fill="#45B3CB"/>
  <path d="M170.739 168.083C174.5 171.617 186.983 169.695 196.393 165.924C207.311 160.901 214.47 155.902 218.696 151.919C225.127 144.826 230.836 134.646 234.473 125.198C237.262 116.634 237.811 112.719 237.811 112.719C237.05 114.389 235.27 124.284 235.191 124.543C233.632 129.651 231.463 134.552 228.731 139.138C225.127 144.826 222.103 148.558 218.696 151.919C214.47 155.902 207.311 160.901 196.601 166.421C189.66 169.22 174.636 170.494 170.416 168.508L170.739 168.083Z" fill="#F7AB61"/>
  <path d="M243.719 155.158H169.906C165.371 155.158 161.694 158.844 161.694 163.391V203.354C161.694 207.901 165.371 211.587 169.906 211.587H243.719C248.254 211.587 251.93 207.901 251.93 203.354V163.391C251.93 158.844 248.254 155.158 243.719 155.158Z" fill="#45B3CB"/>
  <path d="M161.694 166.406C161.694 163.353 162.904 160.424 165.058 158.264C167.212 156.105 170.133 154.892 173.179 154.892H244.889C251.213 154.892 252.354 159.447 251.966 166.406H161.694Z" fill="#4FC6E0"/>
  <path d="M219.234 183.276H209.658V175.201C209.658 173.401 208.398 171.942 206.812 171.942C205.226 171.942 203.966 173.401 203.966 175.201V183.276H194.391C192.805 183.276 191.519 184.565 191.519 186.154C191.519 187.743 192.805 189.033 194.391 189.033H203.966V200.152C203.966 201.741 205.226 202.651 206.812 202.651C208.398 202.651 209.658 201.741 209.658 200.152V188.99H219.234C220.82 188.99 222.105 187.7 222.105 186.111C222.105 184.522 220.82 183.276 219.234 183.276Z" fill="white"/>
  <path d="M166.791 -12H79.6843C71.1371 -12 64.2083 -5.0532 64.2083 3.51611V195.963C64.2083 204.533 71.1371 211.479 79.6843 211.479H166.791C175.338 211.479 182.267 204.533 182.267 195.963V3.51611C182.267 -5.0532 175.338 -12 166.791 -12Z" fill="#0D9FBF"/>
  <rect x="68.1921" y="-7.68195" width="110.543" height="214.462" rx="16" fill="#DDF8E0"/>
  <path d="M246.296 25.9411C244.666 10.0292 216.004 5.62478 188.548 8.89209C161.091 12.1594 160.022 18.3917 160.725 37.1752C160.962 43.3427 162.649 48.2293 165.391 52.0867C163.704 57.8441 156.935 59.046 157.876 59.9528C162.714 64.609 171.234 60.3342 173.287 59.1899C186.538 66.9911 207.541 65.854 222.694 63.7094C242.836 60.8595 248.076 43.4147 246.296 25.9411Z" fill="#45B3CB"/>
  <circle cx="188.548" cy="36.0381" r="2.9" fill="white"/>
  <circle cx="202.94" cy="36.0381" r="2.9" fill="white"/>
  <circle cx="216.786" cy="36.0381" r="2.9" fill="white"/>
  <path d="M114.017 79.5709C114.312 79.1032 125.466 84.7166 137.999 77.4119C150.532 70.1073 143.211 147.371 143.211 147.371L140.756 206.866H109.531L103.121 145.889C103.121 145.889 109.667 86.487 114.017 79.5709Z" fill="#45B3CB"/>
  <path d="M170.416 90.9778C165.312 86.5806 141.832 77.6495 141.832 77.6495L137.999 84.5151C137.999 84.5151 139.241 169.659 138.602 187.198V206.83H167.25L167.401 162.491C175.684 160.383 182.051 156.885 185.554 153.042C189.524 148.681 190.479 146.22 190.479 140.426C190.479 134.633 175.512 95.375 170.416 90.9778Z" fill="white"/>
  <path d="M111.44 154.482L111.857 153.805V78.4123C111.857 78.4123 88.377 87.3146 83.2662 91.7406C78.1554 96.1666 63.3326 136.792 63.1675 142.585C62.6076 165.579 82.5484 194.596 82.5484 194.596C83.2037 194.277 83.8284 193.899 84.4147 193.466C84.0271 198.828 83.3667 206.83 83.3667 206.83H114.484C114.484 206.83 114.592 183.002 114.484 181.915C114.469 181.268 112.79 166.428 111.44 154.482Z" fill="white"/>
  <path d="M136.987 80.1179C136.987 80.1179 135.437 84.2129 125.682 84.2129C115.927 84.2129 114.527 80.3626 114.527 80.3626V67.9339H136.829L136.987 80.1179Z" fill="#F0BA92"/>
  <path d="M139.543 62.7307C135.832 74.9651 125.682 75.181 125.682 75.181C125.682 75.181 114.958 75.181 111.756 62.4356C109.639 54.0443 104.578 41.1981 110.651 31.6697C114.103 26.2866 139.191 24.1276 142.148 31.6697C145.106 39.2119 141.725 55.5484 139.543 62.7307Z" fill="#FFCCA9"/>
  <path d="M137.705 35.4478C137.705 35.4478 131.819 36.3834 127.864 34.5267C126.708 33.9797 121.095 36.3762 118.532 35.894C116.005 35.6107 112.06 31.912 111.354 30.5253C111.074 29.309 109.919 27.5818 113.457 24.8975C118.396 21.184 124.49 22.0835 125.509 20.9968C126.606 19.9523 127.782 19.3248 129.529 19.4424C134.819 19.9749 135.078 23.0911 138.057 23.5517C141.926 24.1634 143.232 25.7107 143.483 28.9852C143.921 35.1888 137.705 35.4478 137.705 35.4478Z" fill="#2A445D"/>
  <circle cx="119.652" cy="50.6222" r="1.9" fill="#210601"/>
  <circle cx="132.006" cy="50.7122" r="1.9" fill="#210601"/>
  <path d="M120.19 62.522C120.628 61.8023 122.179 62.2845 125.531 62.2845C128.883 62.2845 130.685 61.903 131.137 62.2773C131.546 62.6155 130.276 67.0487 125.689 67.0991C121.791 67.0991 119.839 63.1193 120.19 62.522Z" fill="white"/>
</svg>
`);
const bannerSource = require('../../assets/banner.svg') || { uri: `data:image/svg+xml;utf8,${bannerSvg}` };

export function EditAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const accountName = typeof params.name === 'string' ? params.name : '';
  const [firstName, setFirstName] = useState(accountName);
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');

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
        <View style={styles.hero}>
          <Image contentFit="contain" source={bannerSource} style={styles.banner} />

          <Pressable accessibilityLabel="Voltar" onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" color={profilePalette.white} size={22} />
          </Pressable>

          <View style={styles.avatarPosition}>
            <ProfileAvatar />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.title}>{sectionTitle}</Text>

          <View style={styles.row}>
            <TextInput
              autoCapitalize="words"
              onChangeText={setFirstName}
              placeholder="Nome"
              placeholderTextColor={profilePalette.muted}
              style={styles.input}
              value={firstName}
            />
            <TextInput
              autoCapitalize="words"
              onChangeText={setLastName}
              placeholder="Sobrenome"
              placeholderTextColor={profilePalette.muted}
              style={styles.input}
              value={lastName}
            />
          </View>

          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={setBirthDate}
            placeholder="Data Nascimento"
            placeholderTextColor={profilePalette.muted}
            style={[styles.input, styles.birthInput]}
            value={birthDate}
          />

          <View style={styles.actions}>
            <Pressable onPress={goBack} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Pressable onPress={goBack} style={styles.saveButton}>
              <Text style={styles.saveText}>Salvar</Text>
            </Pressable>
          </View>
        </View>
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
    backgroundColor: profilePalette.panel,
  },
  hero: {
    height: 203,
    overflow: 'visible',
    backgroundColor: profilePalette.hero,
  },
  banner: {
    position: 'absolute',
    top: -12,
    right: 20,
    width: 269,
    height: 219,
  },
  backButton: {
    position: 'absolute',
    top: 49,
    left: 37,
    zIndex: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(142, 218, 153, 0.72)',
  },
  avatarPosition: {
    position: 'absolute',
    left: '50%',
    bottom: -58,
    width: 132,
    height: 132,
    marginLeft: -66,
    zIndex: 5,
  },
  panel: {
    flex: 1,
    paddingHorizontal: 33,
    paddingTop: 80,
    paddingBottom: 21,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    backgroundColor: profilePalette.panel,
  },
  title: {
    marginBottom: 18,
    color: profilePalette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 17,
  },
  input: {
    height: 43,
    flex: 1,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#9FA7B2',
    borderRadius: 7,
    color: profilePalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  birthInput: {
    width: '47%',
    flex: 0,
    marginTop: 11,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
  },
  cancelButton: {
    height: 49,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  cancelText: {
    color: profilePalette.mint,
    fontSize: 14,
    fontWeight: '800',
  },
  saveButton: {
    height: 49,
    flex: 1.34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: profilePalette.mint,
  },
  saveText: {
    color: profilePalette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
