import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homePalette } from './home-theme';
import { UserAvatar } from './user-avatar';

type AccountRowProps = {
  name: string;
  avatarVariant?: 'pink' | 'blue';
  onPress?: () => void;
};

export function AccountRow({ avatarVariant = 'pink', name, onPress }: AccountRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.accountInfo}>
        <UserAvatar size={44} variant={avatarVariant} />
        <Text style={styles.name}>{name}</Text>
      </View>
      <MaterialCommunityIcons name="tune-variant" color={homePalette.mintDark} size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    borderRadius: 6,
    backgroundColor: homePalette.white,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    color: homePalette.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
