import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import {
  AvatarVariant,
  createFamilyMember,
  getFamilyMember,
  updateFamilyMember,
} from '@/lib/database';

const sectionTitle = 'Informa\u00e7\u00f5es';
const bannerSource = require('../../assets/banner.svg');

type EditAccountScreenProps = {
  mode?: 'create' | 'edit';
};

export function EditAccountScreen({ mode = 'edit' }: EditAccountScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const isCreateMode = mode === 'create';
  const memberId = !isCreateMode && typeof params.id === 'string' ? Number(params.id) : null;
  const accountName = !isCreateMode && typeof params.name === 'string' ? params.name : '';
  const [firstName, setFirstName] = useState(accountName);
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarVariant, setAvatarVariant] = useState<AvatarVariant>('pink');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = firstName.trim().length > 0 && !isSaving;

  useEffect(() => {
    let isMounted = true;

    async function loadMember() {
      if (isCreateMode || !memberId) {
        return;
      }

      const member = await getFamilyMember(memberId);

      if (!member || !isMounted) {
        return;
      }

      setFirstName(member.firstName);
      setLastName(member.lastName);
      setBirthDate(member.birthDate);
      setAvatarVariant(member.avatarVariant);
    }

    loadMember();

    return () => {
      isMounted = false;
    };
  }, [isCreateMode, memberId]);

  function goBack() {
    router.replace('/home');
  }

  async function saveMember() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        avatarVariant,
        birthDate,
        firstName,
        lastName,
      };

      if (isCreateMode || !memberId) {
        await createFamilyMember(payload);
      } else {
        await updateFamilyMember(memberId, payload);
      }

      goBack();
    } finally {
      setIsSaving(false);
    }
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

            <Pressable
              disabled={!canSave}
              onPress={saveMember}
              style={[styles.saveButton, !canSave ? styles.disabledSaveButton : null]}>
              <Text style={styles.saveText}>
                {isSaving ? 'Salvando' : isCreateMode ? 'Adicionar' : 'Salvar'}
              </Text>
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
    left: '50%',
    width: 269,
    height: 219,
    marginLeft: -134.5,
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
  disabledSaveButton: {
    opacity: 0.55,
  },
  saveText: {
    color: profilePalette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
