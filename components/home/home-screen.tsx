import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AccountActionsMenu } from './account-actions-menu';
import { AccountRow } from './account-row';
import { HomeHeader } from './home-header';
import { HomeSearch } from './home-search';
import { homePalette } from './home-theme';
import { MedicationCard } from './medication-card';

export function HomeScreen() {
  const router = useRouter();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const accounts = [
    { avatarVariant: 'blue' as const, name: 'Ciclano' },
    { avatarVariant: 'pink' as const, name: 'Beltrano' },
  ];

  function toggleAccountMenu(index: number) {
    setSelectedAccountIndex((currentIndex) => (currentIndex === index ? null : index));
  }

  function editSelectedAccount() {
    if (selectedAccountIndex === null) {
      return;
    }

    const account = accounts[selectedAccountIndex];
    setSelectedAccountIndex(null);
    router.push({ pathname: '/edit-account', params: { name: account.name } });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <HomeHeader onSettingsPress={() => router.push('/profile')} />
          <HomeSearch />
          <MedicationCard onAccessPress={() => router.push('/medications')} />

          <Text style={styles.sectionTitle}>Outras Contas</Text>
          <View style={styles.accounts}>
            {accounts.map((account, index) => (
              <AccountRow
                avatarVariant={account.avatarVariant}
                key={account.name}
                name={account.name}
                onPress={() => toggleAccountMenu(index)}
              />
            ))}
            {selectedAccountIndex !== null ? (
              <AccountActionsMenu
                onDeletePress={() => setSelectedAccountIndex(null)}
                onEditPress={editSelectedAccount}
                top={selectedAccountIndex * 78 - 4}
              />
            ) : null}
          </View>
        </View>

        <Pressable onPress={() => router.push('/signup')} style={styles.bottomBar}>
          <Text style={styles.newAccountText}>Criar uma nova conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: homePalette.background,
  },
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 27,
    paddingTop: 42,
    paddingBottom: 20,
    backgroundColor: homePalette.background,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 52,
    marginBottom: 15,
    color: homePalette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  accounts: {
    gap: 10,
    position: 'relative',
  },
  bottomBar: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: homePalette.mint,
  },
  newAccountText: {
    color: homePalette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
