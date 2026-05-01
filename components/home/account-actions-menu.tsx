import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homePalette } from './home-theme';

type AccountActionsMenuProps = {
  top: number;
  onEditPress?: () => void;
  onDeletePress?: () => void;
};

export function AccountActionsMenu({
  onDeletePress,
  onEditPress,
  top,
}: AccountActionsMenuProps) {
  return (
    <View style={[styles.menu, { top }]}>
      <Pressable onPress={onEditPress} style={styles.action}>
        <Feather name="edit-2" color="#1B1F22" size={16} />
        <Text style={styles.actionText}>Editar</Text>
      </Pressable>

      <Pressable onPress={onDeletePress} style={[styles.action, styles.deleteAction]}>
        <MaterialCommunityIcons name="trash-can-outline" color="#1B1F22" size={18} />
        <Text style={styles.actionText}>Excluir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    right: 6,
    zIndex: 5,
    width: 132,
    padding: 6,
    borderRadius: 8,
    backgroundColor: homePalette.white,
    shadowColor: '#6B7C8E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  action: {
    height: 39,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
    paddingHorizontal: 14,
    borderRadius: 7,
  },
  deleteAction: {
    backgroundColor: '#D8F9DC',
  },
  actionText: {
    color: '#2F3438',
    fontSize: 14,
    fontWeight: '800',
  },
});
