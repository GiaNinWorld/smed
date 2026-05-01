import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileAvatar } from './profile-avatar';
import { profilePalette } from './profile-theme';

type ProfileHeroProps = {
  onBackPress: () => void;
};

export function ProfileHero({ onBackPress }: ProfileHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.lightShape} />
      <View style={styles.medicalCard}>
        <View style={styles.doctorBadge}>
          <MaterialCommunityIcons name="doctor" color={profilePalette.teal} size={48} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Perfil</Text>
          <Text style={styles.cardSubtitle}>Dados da conta principal</Text>
        </View>
      </View>

      <View style={styles.chatBubble}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.leafLeft} />
      <View style={styles.leafRight} />
      <View style={styles.pillOne} />
      <View style={styles.pillTwo} />

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
  lightShape: {
    position: 'absolute',
    top: -82,
    right: -78,
    width: 224,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(255,255,255,0.54)',
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
  medicalCard: {
    position: 'absolute',
    top: 42,
    left: 100,
    right: 52,
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  doctorBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: profilePalette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 4,
    color: '#5D8A91',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  chatBubble: {
    position: 'absolute',
    top: 23,
    right: 56,
    width: 80,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 22,
    backgroundColor: profilePalette.teal,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: profilePalette.white,
  },
  leafLeft: {
    position: 'absolute',
    left: 87,
    top: 119,
    width: 18,
    height: 54,
    borderTopLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: profilePalette.amber,
    transform: [{ rotate: '-28deg' }],
  },
  leafRight: {
    position: 'absolute',
    right: 85,
    top: 113,
    width: 22,
    height: 58,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 36,
    backgroundColor: profilePalette.rose,
    transform: [{ rotate: '31deg' }],
  },
  pillOne: {
    position: 'absolute',
    left: 67,
    top: 155,
    width: 8,
    height: 34,
    borderRadius: 8,
    backgroundColor: profilePalette.teal,
    transform: [{ rotate: '-8deg' }],
  },
  pillTwo: {
    position: 'absolute',
    right: 53,
    top: 147,
    width: 7,
    height: 42,
    borderRadius: 8,
    backgroundColor: profilePalette.amber,
    transform: [{ rotate: '-5deg' }],
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
