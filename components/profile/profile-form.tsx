import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileField } from './profile-field';
import { profilePalette } from './profile-theme';

const title = 'Informa\u00e7\u00f5es';
const birthLabel = 'Data de nascimento';

type ProfileFormProps = {
  onCancelPress: () => void;
  onSavePress: () => void;
};

export function ProfileForm({ onCancelPress, onSavePress }: ProfileFormProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <ProfileField compact label="Nome" value="Geni" />
        <ProfileField compact label="Sobrenome" value="Favaro" />
      </View>

      <View style={styles.stack}>
        <ProfileField
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail"
          value="geni@gmail.com"
        />
        <ProfileField label="Senha" secureTextEntry value="12345" />
      </View>

      <View style={styles.birthFieldWrap}>
        <ProfileField label={birthLabel} value="01/08/1820" />
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onCancelPress} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <Pressable onPress={onSavePress} style={styles.saveButton}>
          <Text style={styles.saveText}>Salvar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 91,
    paddingBottom: 21,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    backgroundColor: profilePalette.panel,
  },
  title: {
    marginBottom: 17,
    color: profilePalette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  stack: {
    gap: 10,
    marginTop: 10,
  },
  birthFieldWrap: {
    width: '47%',
    marginTop: 10,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
    minHeight: 132,
  },
  cancelButton: {
    height: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
  },
  cancelText: {
    color: profilePalette.mint,
    fontSize: 15,
    fontWeight: '800',
  },
  saveButton: {
    height: 52,
    flex: 1.38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: profilePalette.mint,
  },
  saveText: {
    color: profilePalette.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
