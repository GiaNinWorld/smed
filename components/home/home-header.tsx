import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homePalette } from './home-theme';
import { UserAvatar } from './user-avatar';

type HomeHeaderProps = {
  onSettingsPress?: () => void;
};

export function HomeHeader({ onSettingsPress }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.profile}>
        <UserAvatar size={44} />
        <Text style={styles.name}>Geni</Text>
      </View>

      <Pressable
        accessibilityLabel="Configuracoes"
        onPress={onSettingsPress}
        style={styles.settingsButton}>
        <Ionicons name="settings-outline" color="#111111" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  name: {
    color: homePalette.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: homePalette.white,
    shadowColor: '#8CA0B3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
});
