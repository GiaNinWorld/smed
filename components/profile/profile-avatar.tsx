import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { profilePalette } from './profile-theme';

export function ProfileAvatar() {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <View style={styles.hairBack} />
        <View style={styles.hairLeft} />
        <View style={styles.hairRight} />
        <View style={styles.face}>
          <View style={styles.eyes}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <View style={styles.smile} />
        </View>
        <View style={styles.shirt} />
      </View>

      <Pressable accessibilityLabel="Editar foto" style={styles.editButton}>
        <Ionicons name="pencil" color={profilePalette.white} size={19} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 132,
    height: 132,
  },
  avatar: {
    width: 132,
    height: 132,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: profilePalette.white,
    borderRadius: 66,
    backgroundColor: '#FFE1EE',
    shadowColor: '#7A8FA3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 5,
  },
  hairBack: {
    position: 'absolute',
    top: 16,
    width: 96,
    height: 93,
    borderRadius: 48,
    backgroundColor: '#F255A9',
  },
  hairLeft: {
    position: 'absolute',
    top: 37,
    left: 16,
    width: 35,
    height: 74,
    borderRadius: 26,
    backgroundColor: '#E23C98',
    transform: [{ rotate: '17deg' }],
  },
  hairRight: {
    position: 'absolute',
    top: 34,
    right: 14,
    width: 36,
    height: 77,
    borderRadius: 26,
    backgroundColor: '#FF7BBC',
    transform: [{ rotate: '-15deg' }],
  },
  face: {
    position: 'absolute',
    top: 40,
    width: 61,
    height: 67,
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#FFD3B7',
  },
  eyes: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  eye: {
    width: 6,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#613041',
  },
  smile: {
    width: 18,
    height: 8,
    marginTop: 11,
    borderBottomWidth: 2,
    borderColor: '#B94F61',
    borderRadius: 10,
  },
  shirt: {
    position: 'absolute',
    bottom: -16,
    width: 86,
    height: 43,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#71285B',
  },
  editButton: {
    position: 'absolute',
    right: -4,
    bottom: 9,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: profilePalette.white,
    borderRadius: 20,
    backgroundColor: profilePalette.mint,
  },
});
