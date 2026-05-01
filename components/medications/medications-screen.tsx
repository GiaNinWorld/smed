import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Medication = {
  id: string;
  name: string;
  amount: string;
  hour: string;
  icon: 'needle' | 'pill';
  iconBackground: string;
  iconColor: string;
  alert?: string;
};

type WeekDay = {
  value: number;
  label: string;
};

const weekDays: WeekDay[] = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terca-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sabado' },
  { value: 0, label: 'Domingo' },
];

const initialMedications: Medication[] = [
  {
    id: 'boldenona',
    name: 'Boldenona',
    amount: '4 ampolas',
    hour: '8:00',
    icon: 'needle',
    iconBackground: '#E9FAFB',
    iconColor: '#76D2DE',
  },
  {
    id: 'omega-3',
    name: 'Omega 3',
    amount: '10 pilulas',
    hour: '8:00',
    icon: 'pill',
    iconBackground: '#FFF2C1',
    iconColor: '#FFC33E',
  },
  {
    id: 'acetato',
    name: 'Acetato de trembolona',
    amount: '2 ampolas',
    hour: '14:00',
    icon: 'needle',
    iconBackground: '#E9FAFB',
    iconColor: '#76D2DE',
    alert: 'Voce tem 2 ampolas restantes',
  },
  {
    id: 'deca',
    name: 'Deca',
    amount: '5 ampolas',
    hour: '14:00',
    icon: 'needle',
    iconBackground: '#E9FAFB',
    iconColor: '#76D2DE',
  },
];

type SwipeableMedicationCardProps = {
  isSelected: boolean;
  medication: Medication;
  onPress: () => void;
  onRemove: () => void;
};

function SwipeableMedicationCard({
  isSelected,
  medication,
  onPress,
  onRemove,
}: SwipeableMedicationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = translateX.interpolate({
    inputRange: [-96, -24],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const deleteScale = translateX.interpolate({
    inputRange: [-120, -36],
    outputRange: [1, 0.82],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(Math.min(0, Math.max(gestureState.dx, -132)));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -92) {
          Animated.timing(translateX, {
            duration: 180,
            toValue: -420,
            useNativeDriver: true,
          }).start(onRemove);
          return;
        }

        Animated.spring(translateX, {
          bounciness: 5,
          speed: 16,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          bounciness: 5,
          speed: 16,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.deleteBackground,
          {
            opacity: deleteOpacity,
            transform: [{ scale: deleteScale }],
          },
        ]}>
        <MaterialCommunityIcons name="trash-can-outline" color="#FFFFFF" size={28} />
        <Text style={styles.deleteText}>Remover</Text>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.swipeCard, { transform: [{ translateX }] }]}>
        <Pressable
          accessibilityLabel={`Selecionar ${medication.name}`}
          onPress={onPress}
          style={[styles.card, isSelected ? styles.selectedCard : null]}>
          <View style={styles.cardMain}>
            <View
              style={[
                styles.medicationIcon,
                { backgroundColor: medication.iconBackground },
              ]}>
              <MaterialCommunityIcons
                name={medication.icon}
                color={medication.iconColor}
                size={34}
              />
            </View>

            <View style={styles.medicationCopy}>
              <Text numberOfLines={1} style={styles.medicationName}>
                {medication.name}
              </Text>
              <Text style={styles.amount}>{medication.amount}</Text>
            </View>

            {isSelected ? (
              <MaterialCommunityIcons
                name="check-circle"
                color="#9BE6A6"
                size={22}
                style={styles.checkIcon}
              />
            ) : null}
          </View>

          {medication.alert ? (
            <View style={styles.alert}>
              <MaterialCommunityIcons name="alert-circle" color="#FF6843" size={18} />
              <Text numberOfLines={1} style={styles.alertText}>
                {medication.alert}
              </Text>
              <MaterialCommunityIcons name="close" color="#C9D0D6" size={16} />
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function MedicationsScreen() {
  const router = useRouter();
  const todayWeekDayValue = new Date().getDay();
  const [selectedDayValue, setSelectedDayValue] = useState(todayWeekDayValue);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [medicationItems, setMedicationItems] = useState(initialMedications);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const orderedWeekDays = useMemo(() => {
    const todayIndex = weekDays.findIndex((day) => day.value === todayWeekDayValue);

    if (todayIndex === -1) {
      return weekDays;
    }

    return [...weekDays.slice(todayIndex), ...weekDays.slice(0, todayIndex)];
  }, [todayWeekDayValue]);

  const selectedDayLabel =
    weekDays.find((day) => day.value === selectedDayValue)?.label ?? weekDays[0].label;

  const groupedMedications = medicationItems.reduce<Record<string, Medication[]>>((groups, medication) => {
    groups[medication.hour] = [...(groups[medication.hour] ?? []), medication];
    return groups;
  }, {});

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  }

  function toggleMedication(id: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  }

  function removeMedication(id: string) {
    setMedicationItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setSelectedIds((currentIds) => currentIds.filter((currentId) => currentId !== id));
  }

  function selectDay(dayValue: number) {
    setSelectedDayValue(dayValue);
    setIsDayModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Pressable accessibilityLabel="Voltar" onPress={goBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" color="#FFFFFF" size={22} />
          </Pressable>

          <Pressable
            accessibilityLabel="Selecionar dia da semana"
            onPress={() => setIsDayModalVisible(true)}
            style={styles.titleRow}>
            <Text style={styles.title}>{selectedDayLabel}</Text>
            <MaterialCommunityIcons name="chevron-down" color="#15172E" size={24} />
          </Pressable>

          {Object.entries(groupedMedications).map(([hour, hourMedications]) => (
            <View key={hour} style={styles.timeGroup}>
              <Text style={styles.hour}>{hour}</Text>

              <View style={styles.cards}>
                {hourMedications.map((medication) => {
                  const isSelected = selectedIds.includes(medication.id);

                  return (
                    <SwipeableMedicationCard
                      isSelected={isSelected}
                      key={medication.id}
                      medication={medication}
                      onRemove={() => removeMedication(medication.id)}
                      onPress={() => toggleMedication(medication.id)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <Pressable
          accessibilityLabel="Adicionar medicamento"
          onPress={() => router.push('/add-medication')}
          style={styles.addButton}>
          <MaterialCommunityIcons name="plus" color="#FFFFFF" size={30} />
        </Pressable>

        <Modal
          animationType="fade"
          onRequestClose={() => setIsDayModalVisible(false)}
          transparent
          visible={isDayModalVisible}>
          <Pressable
            accessibilityLabel="Fechar selecao de dia"
            onPress={() => setIsDayModalVisible(false)}
            style={styles.modalBackdrop}>
            <Pressable style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar dia da semana</Text>
                <Pressable
                  accessibilityLabel="Fechar"
                  onPress={() => setIsDayModalVisible(false)}
                  style={styles.modalCloseButton}>
                  <MaterialCommunityIcons name="close" color="#15172E" size={20} />
                </Pressable>
              </View>

              <View style={styles.dayOptions}>
                {orderedWeekDays.map((day) => {
                  const isSelected = day.value === selectedDayValue;

                  return (
                    <Pressable
                      accessibilityLabel={`Selecionar ${day.label}`}
                      key={day.value}
                      onPress={() => selectDay(day.value)}
                      style={[styles.dayOption, isSelected ? styles.selectedDayOption : null]}>
                      <Text style={[styles.dayLabel, isSelected ? styles.selectedDayLabel : null]}>
                        {day.label}
                      </Text>
                      {isSelected ? (
                        <MaterialCommunityIcons name="check" color="#FFFFFF" size={20} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 21,
    paddingTop: 20,
    paddingBottom: 92,
  },
  eyebrow: {
    color: '#8B8C96',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 51,
    borderRadius: 14,
    backgroundColor: '#ADEBB5',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 4,
  },
  title: {
    color: '#15172E',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  timeGroup: {
    marginTop: 52,
  },
  hour: {
    color: '#15172E',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  cards: {
    gap: 13,
    marginTop: 12,
  },
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 18,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 122,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 18,
    backgroundColor: '#F05252',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  swipeCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  card: {
    minHeight: 81,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {
    borderColor: '#ADEBB5',
    shadowColor: '#88D894',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  medicationCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  medicationName: {
    color: '#17192E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
  },
  amount: {
    marginTop: 3,
    color: '#9397A4',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
  checkIcon: {
    marginLeft: 8,
  },
  alert: {
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F4F7F8',
  },
  alertText: {
    flex: 1,
    color: '#25273A',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 17,
  },
  addButton: {
    position: 'absolute',
    right: 21,
    bottom: 27,
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#ADEBB5',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 21,
    backgroundColor: 'rgba(21, 23, 46, 0.38)',
  },
  modalContent: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#F4F7F8',
  },
  dayOptions: {
    gap: 8,
  },
  dayOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F4F7F8',
  },
  selectedDayOption: {
    backgroundColor: '#ADEBB5',
  },
  dayLabel: {
    color: '#15172E',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  selectedDayLabel: {
    color: '#FFFFFF',
  },
});
