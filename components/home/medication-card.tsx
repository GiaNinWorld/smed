import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homePalette } from './home-theme';

type MedicationCardProps = {
  onAccessPress?: () => void;
};

export function MedicationCard({ onAccessPress }: MedicationCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.titleSmall}>Meus</Text>
        <Text style={styles.titleLarge}>Medicamentos</Text>
        <Pressable
          accessibilityLabel="Acessar medicamentos"
          onPress={onAccessPress}
          style={styles.accessButton}>
          <Text style={styles.accessText}>Acessar</Text>
        </Pressable>
      </View>

      <View style={styles.illustration}>
        <View style={[styles.pill, styles.pillPink]} />
        <View style={[styles.pill, styles.pillBlue]} />
        <View style={[styles.capsule, styles.capsuleCyan]}>
          <View style={styles.capsuleHalf} />
        </View>
        <View style={[styles.pill, styles.pillPurple]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 143,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 23,
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#AEEFB7',
  },
  titleSmall: {
    color: homePalette.white,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 23,
  },
  titleLarge: {
    color: homePalette.white,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  accessButton: {
    width: 118,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 219, 151, 0.68)',
  },
  accessText: {
    color: homePalette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  illustration: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(155, 226, 159, 0.32)',
  },
  pill: {
    position: 'absolute',
    width: 18,
    height: 24,
    borderRadius: 10,
  },
  pillPink: {
    top: 22,
    left: 38,
    backgroundColor: '#FF8C9D',
    transform: [{ rotate: '16deg' }],
  },
  pillBlue: {
    top: 42,
    right: 17,
    backgroundColor: '#7BA7F2',
    transform: [{ rotate: '-27deg' }],
  },
  pillPurple: {
    right: 38,
    bottom: 28,
    backgroundColor: '#7B9EF2',
    transform: [{ rotate: '-31deg' }],
  },
  capsule: {
    position: 'absolute',
    top: 47,
    left: 13,
    width: 29,
    height: 14,
    overflow: 'hidden',
    borderRadius: 7,
    transform: [{ rotate: '38deg' }],
  },
  capsuleCyan: {
    backgroundColor: '#18DDEA',
  },
  capsuleHalf: {
    width: 14,
    height: 14,
    backgroundColor: homePalette.white,
  },
});
