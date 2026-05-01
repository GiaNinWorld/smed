import { ReactNode } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { loginPalette } from './login-theme';

type AuthInputProps = TextInputProps & {
  icon: ReactNode;
  rightElement?: ReactNode;
};

export function AuthInput({ icon, rightElement, style, ...textInputProps }: AuthInputProps) {
  return (
    <View style={styles.inputFrame}>
      {icon}
      <TextInput
        placeholderTextColor={loginPalette.muted}
        style={[styles.input, style]}
        {...textInputProps}
      />
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  inputFrame: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: loginPalette.line,
    borderRadius: 28,
    backgroundColor: loginPalette.white,
    shadowColor: '#7990A7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: loginPalette.muted,
    fontSize: 15,
    fontWeight: '500',
  },
});
