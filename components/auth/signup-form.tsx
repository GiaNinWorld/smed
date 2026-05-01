import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from './login-input';
import { loginPalette } from './login-theme';

const backToLoginLabel = 'J\u00e1 tenho uma conta.';

type SignupFormProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onBackToLoginPress: () => void;
  onSignupPress: () => void;
  errorMessage?: string;
  isSubmitting?: boolean;
};

export function SignupForm({
  confirmPassword,
  email,
  name,
  onBackToLoginPress,
  onChangeConfirmPassword,
  onChangeEmail,
  onChangeName,
  onChangePassword,
  onSignupPress,
  password,
  errorMessage,
  isSubmitting = false,
}: SignupFormProps) {
  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Cadastro</Text>

      <AuthInput
        autoCapitalize="words"
        autoComplete="name"
        icon={<Ionicons name="person-outline" color={loginPalette.mintDark} size={22} />}
        onChangeText={onChangeName}
        placeholder="Nome completo"
        textContentType="name"
        value={name}
      />

      <AuthInput
        autoCapitalize="none"
        autoComplete="email"
        icon={<Ionicons name="mail-outline" color={loginPalette.mintDark} size={22} />}
        keyboardType="email-address"
        onChangeText={onChangeEmail}
        placeholder="E-mail"
        textContentType="emailAddress"
        value={email}
      />

      <AuthInput
        autoCapitalize="none"
        icon={<MaterialCommunityIcons name="lock-outline" color={loginPalette.mintDark} size={22} />}
        onChangeText={onChangePassword}
        placeholder="Senha"
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />

      <AuthInput
        autoCapitalize="none"
        icon={
          <MaterialCommunityIcons
            name="lock-check-outline"
            color={loginPalette.mintDark}
            size={22}
          />
        }
        onChangeText={onChangeConfirmPassword}
        placeholder="Confirmar senha"
        secureTextEntry
        textContentType="newPassword"
        value={confirmPassword}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable
        disabled={isSubmitting}
        onPress={onSignupPress}
        style={[styles.primaryButton, isSubmitting ? styles.disabledButton : null]}>
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'Cadastrando' : 'Cadastrar'}
        </Text>
      </Pressable>

      <Pressable onPress={onBackToLoginPress} style={styles.backToLoginButton}>
        <Text style={styles.backToLoginText}>{backToLoginLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formPanel: {
    flex: 1,
    marginTop: -1,
    paddingHorizontal: 32,
    paddingTop: 34,
    paddingBottom: 44,
    borderTopLeftRadius: 32,
    backgroundColor: loginPalette.white,
  },
  sectionTitle: {
    marginBottom: 14,
    color: loginPalette.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 27,
    backgroundColor: loginPalette.mint,
  },
  disabledButton: {
    opacity: 0.58,
  },
  primaryButtonText: {
    color: loginPalette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 2,
    color: '#E15353',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  backToLoginButton: {
    alignSelf: 'center',
    marginTop: 22,
    paddingVertical: 6,
  },
  backToLoginText: {
    color: loginPalette.mintDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
