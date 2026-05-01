import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { homePalette } from './home-theme';

export function HomeSearch() {
  return (
    <View style={styles.row}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" color="#A8AFB8" size={24} />
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#A8AFB8"
          style={styles.input}
        />
      </View>

      <Pressable accessibilityLabel="Filtros" style={styles.filterButton}>
        <MaterialCommunityIcons name="tune-variant" color={homePalette.white} size={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 16,
  },
  searchBox: {
    height: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: homePalette.white,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: homePalette.ink,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
