import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from './login-input';
import { loginPalette } from './login-theme';

const createAccountLabel = 'N\u00e3o tenho uma conta.';

type LoginFormProps = {
  email: string;
  password: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onCreateAccountPress: () => void;
  onLoginPress: () => void;
};

export function LoginForm({
  email,
  onChangeEmail,
  onChangePassword,
  onCreateAccountPress,
  onLoginPress,
  password,
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.formPanel}>
      <Text style={styles.sectionTitle}>Login</Text>

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
        rightElement={
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={10}
            onPress={() => setIsPasswordVisible((current) => !current)}>
            <Ionicons
              color={loginPalette.muted}
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
            />
          </Pressable>
        }
        secureTextEntry={!isPasswordVisible}
        textContentType="password"
        value={password}
      />

      <Pressable onPress={onCreateAccountPress} style={styles.createAccountButton}>
        <Text style={styles.createAccountText}>{createAccountLabel}</Text>
      </Pressable>

      <Pressable onPress={onLoginPress} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Ou</Text>
        <View style={styles.divider} />
      </View>

      <Pressable style={styles.googleButton}>
        <FontAwesome name="google" color="#4285F4" size={22} />
        <Text style={styles.googleButtonText}>Google</Text>
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
  createAccountButton: {
    alignSelf: 'flex-end',
    marginTop: 1,
    marginBottom: 28,
    paddingVertical: 4,
  },
  createAccountText: {
    color: loginPalette.mintDark,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: loginPalette.mint,
  },
  primaryButtonText: {
    color: loginPalette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 35,
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D3DEE9',
  },
  dividerText: {
    color: loginPalette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  googleButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#C9D8E8',
    borderRadius: 28,
    backgroundColor: loginPalette.white,
  },
  googleButtonText: {
    color: loginPalette.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
