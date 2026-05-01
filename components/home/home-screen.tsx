import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import {
  CurrentUser,
  deleteFamilyMember,
  FamilyMember,
  getCurrentUser,
  listFamilyMembers,
} from '@/lib/database';

import { AccountActionsMenu } from './account-actions-menu';
import { AccountRow } from './account-row';
import { HomeHeader } from './home-header';
import { HomeSearch } from './home-search';
import { homePalette } from './home-theme';
import { MedicationCard } from './medication-card';

export function HomeScreen() {
  const router = useRouter();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const loadAccounts = useCallback(async () => {
    const user = await getCurrentUser();

    if (!user) {
      setAccounts([]);
      setCurrentUser(null);
      router.replace('/');
      return;
    }

    const familyMembers = await listFamilyMembers();
    setCurrentUser(user);
    setAccounts(familyMembers);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      setSelectedAccountIndex(null);
    }, [loadAccounts]),
  );

  function toggleAccountMenu(index: number) {
    setSelectedAccountIndex((currentIndex) => (currentIndex === index ? null : index));
  }

  function editSelectedAccount() {
    if (selectedAccountIndex === null) {
      return;
    }

    const account = accounts[selectedAccountIndex];
    setSelectedAccountIndex(null);
    router.replace({ pathname: '/edit-account', params: { id: String(account.id) } });
  }

  async function deleteSelectedAccount() {
    if (selectedAccountIndex === null) {
      return;
    }

    const account = accounts[selectedAccountIndex];
    setSelectedAccountIndex(null);
    await deleteFamilyMember(account.id);
    await loadAccounts();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <HomeHeader
            name={currentUser?.fullName.split(/\s+/)[0] ?? 'Usuário'}
            onSettingsPress={() => router.replace('/profile')}
          />
          <HomeSearch />
          <MedicationCard onAccessPress={() => router.replace('/medications')} />

          <Text style={styles.sectionTitle}>Membros da Família</Text>
          <View style={styles.accounts}>
            {accounts.map((account, index) => (
              <AccountRow
                avatarVariant={account.avatarVariant}
                key={account.id}
                name={account.displayName}
                onPress={() => toggleAccountMenu(index)}
              />
            ))}
            {selectedAccountIndex !== null ? (
              <AccountActionsMenu
                onDeletePress={deleteSelectedAccount}
                onEditPress={editSelectedAccount}
                top={selectedAccountIndex * 78 - 4}
              />
            ) : null}
          </View>
        </View>

        <Pressable onPress={() => router.replace('/create-member')} style={styles.bottomBar}>
          <Text style={styles.newAccountText}>Adicionar novo membro</Text>
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
