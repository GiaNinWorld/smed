import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { profilePalette } from './profile-theme';

type ProfileFieldProps = TextInputProps & {
  label: string;
  compact?: boolean;
};

export function ProfileField({ compact = false, label, style, ...inputProps }: ProfileFieldProps) {
  return (
    <View style={[styles.field, compact ? styles.compactField : null]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={profilePalette.muted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: profilePalette.border,
    borderRadius: 8,
    backgroundColor: profilePalette.white,
  },
  compactField: {
    flex: 1,
  },
  label: {
    marginBottom: 3,
    color: profilePalette.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  input: {
    minWidth: 0,
    padding: 0,
    color: profilePalette.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
