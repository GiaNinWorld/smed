import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileAvatar } from './profile-avatar';
import { profilePalette } from './profile-theme';

const bannerSource = require('../../assets/banner.svg');

type ProfileHeroProps = {
  onBackPress: () => void;
};

export function ProfileHero({ onBackPress }: ProfileHeroProps) {
  return (
    <View style={styles.hero}>
      <Image contentFit="contain" source={bannerSource} style={styles.banner} />

      <Pressable accessibilityLabel="Voltar" onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" color={profilePalette.white} size={22} />
      </Pressable>

      <View style={styles.avatarPosition}>
        <ProfileAvatar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 238,
    overflow: 'visible',
    backgroundColor: profilePalette.hero,
  },
  backButton: {
    position: 'absolute',
    top: 54,
    left: 31,
    zIndex: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(142, 218, 153, 0.72)',
  },
  banner: {
    position: 'absolute',
    top: -3,
    left: '50%',
    width: 269,
    height: 219,
    marginLeft: -134.5,
  },
  avatarPosition: {
    position: 'absolute',
    left: '50%',
    bottom: -65,
    width: 132,
    height: 132,
    marginLeft: -66,
    zIndex: 5,
  },
});
