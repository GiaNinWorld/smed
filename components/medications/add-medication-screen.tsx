import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createMedication, getMedication, MedicationKind, updateMedication } from '@/lib/database';

type MedicationKindOption = {
  id: MedicationKind;
  icon: 'pill' | 'needle';
  iconBackground: string;
  iconColor: string;
  iconRotate?: string;
};

type ScheduledDose = {
  id: number;
  time: string;
};

type RepeatMode = 'once' | 'daily' | 'weekdays' | 'custom';

type WeekDayOption = {
  label: string;
  shortLabel: string;
  value: number;
};

const reminderMinuteOptions = [5, 10, 15, 20, 30];

const repeatOptions: { label: string; mode: RepeatMode }[] = [
  { label: 'Uma vez', mode: 'once' },
  { label: 'Diariamente', mode: 'daily' },
  { label: 'Segunda a sexta', mode: 'weekdays' },
  { label: 'Personalizado', mode: 'custom' },
];

const weekDayOptions: WeekDayOption[] = [
  { value: 1, label: 'Segunda-feira', shortLabel: 'Seg' },
  { value: 2, label: 'Terca-feira', shortLabel: 'Ter' },
  { value: 3, label: 'Quarta-feira', shortLabel: 'Qua' },
  { value: 4, label: 'Quinta-feira', shortLabel: 'Qui' },
  { value: 5, label: 'Sexta-feira', shortLabel: 'Sex' },
  { value: 6, label: 'Sabado', shortLabel: 'Sab' },
  { value: 0, label: 'Domingo', shortLabel: 'Dom' },
];

const medicationKinds: MedicationKindOption[] = [
  {
    id: 'tablet',
    icon: 'pill',
    iconBackground: '#F2F5F6',
    iconColor: '#D9D9D9',
    iconRotate: '78deg',
  },
  {
    id: 'capsule',
    icon: 'pill',
    iconBackground: '#F2F5F6',
    iconColor: '#FFC33E',
    iconRotate: '70deg',
  },
  {
    id: 'ampoule',
    icon: 'needle',
    iconBackground: '#F2F5F6',
    iconColor: '#76D2DE',
    iconRotate: '-24deg',
  },
  {
    id: 'syringe',
    icon: 'needle',
    iconBackground: '#F2F5F6',
    iconColor: '#C7BDA2',
  },
];

export function AddMedicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ medicationId?: string; weekday?: string }>();
  const medicationId = params.medicationId ? Number(params.medicationId) : null;
  const isEditing = medicationId !== null && !Number.isNaN(medicationId);
  const selectedWeekday = Number(params.weekday ?? new Date().getDay());
  const safeSelectedWeekday = Number.isNaN(selectedWeekday) ? new Date().getDay() : selectedWeekday;
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedKindId, setSelectedKindId] = useState<MedicationKind | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([{ id: 1, time: '' }]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('once');
  const [selectedCustomWeekdays, setSelectedCustomWeekdays] = useState<number[]>([
    safeSelectedWeekday,
  ]);
  const [isRepeatModalVisible, setIsRepeatModalVisible] = useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState(20);
  const [isSaving, setIsSaving] = useState(false);

  const canContinue = Boolean(selectedKindId && name.trim() && dose.trim());
  const canConclude =
    !isSaving && scheduledDoses.some((scheduledDose) => scheduledDose.time.length === 5);
  const selectedMedicationKind =
    medicationKinds.find((kind) => kind.id === selectedKindId) ?? medicationKinds[0];
  const selectedRepeatLabel =
    repeatOptions.find((option) => option.mode === repeatMode)?.label ?? repeatOptions[0].label;
  const selectedScheduleWeekdays = getScheduleWeekdays(repeatMode, selectedCustomWeekdays, safeSelectedWeekday);

  useEffect(() => {
    if (!isEditing || medicationId === null) {
      return;
    }

    const editingMedicationId = medicationId;
    let isMounted = true;

    async function loadMedication() {
      const medication = await getMedication(editingMedicationId);

      if (!isMounted || !medication) {
        return;
      }

      const weekdays = getUniqueWeekdays(medication.schedules);
      const times = getUniqueTimes(medication.schedules);
      const reminderSchedule = medication.schedules.find((schedule) => schedule.reminderEnabled);

      setDose(medication.dose);
      setName(medication.name);
      setSelectedKindId(medication.kind);
      setScheduledDoses(
        times.length > 0
          ? times.map((time, index) => ({ id: index + 1, time }))
          : [{ id: 1, time: '' }],
      );
      setIsReminderEnabled(Boolean(reminderSchedule));
      setSelectedReminderMinutes(reminderSchedule?.reminderMinutes ?? 20);
      setRepeatMode(getMedicationRepeatMode(medication.repeatMode, weekdays, safeSelectedWeekday));
      setSelectedCustomWeekdays(weekdays.length > 0 ? weekdays : [safeSelectedWeekday]);
    }

    loadMedication();

    return () => {
      isMounted = false;
    };
  }, [isEditing, medicationId, safeSelectedWeekday]);

  function closeFlow() {
    router.replace('/medications');
  }

  function handleBackPress() {
    if (step === 2) {
      setStep(1);
      return;
    }

    closeFlow();
  }

  function formatDoseTime(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  function updateDoseTime(id: number, value: string) {
    const time = formatDoseTime(value);

    setScheduledDoses((currentDoses) =>
      currentDoses.map((currentDose) =>
        currentDose.id === id ? { ...currentDose, time } : currentDose,
      ),
    );
  }

  function addDose() {
    setScheduledDoses((currentDoses) => [
      ...currentDoses,
      {
        id: Math.max(...currentDoses.map((currentDose) => currentDose.id)) + 1,
        time: '',
      },
    ]);
  }

  function removeDose(id: number) {
    setScheduledDoses((currentDoses) => {
      if (currentDoses.length === 1) {
        return currentDoses;
      }

      return currentDoses.filter((currentDose) => currentDose.id !== id);
    });
  }

  function selectRepeatMode(mode: RepeatMode) {
    setRepeatMode(mode);

    if (mode !== 'custom') {
      setIsRepeatModalVisible(false);
    }
  }

  function toggleCustomWeekday(weekday: number) {
    setSelectedCustomWeekdays((currentWeekdays) => {
      if (currentWeekdays.includes(weekday)) {
        return currentWeekdays.length === 1
          ? currentWeekdays
          : currentWeekdays.filter((currentWeekday) => currentWeekday !== weekday);
      }

      return [...currentWeekdays, weekday].sort(
        (firstWeekday, secondWeekday) =>
          getWeekdayOrder(firstWeekday) - getWeekdayOrder(secondWeekday),
      );
    });
  }

  async function conclude() {
    if (!canConclude || !selectedKindId) {
      return;
    }

    setIsSaving(true);

    try {
      const validDoses = scheduledDoses.filter((scheduledDose) => scheduledDose.time.length === 5);

      const medicationInput = {
        dose,
        kind: selectedKindId,
        name,
        repeatMode,
        schedules: selectedScheduleWeekdays.flatMap((weekday) =>
          validDoses.map((scheduledDose) => ({
            reminderEnabled: isReminderEnabled,
            reminderMinutes: selectedReminderMinutes,
            time: scheduledDose.time,
            weekday,
          })),
        ),
      };

      if (isEditing && medicationId !== null) {
        await updateMedication(medicationId, medicationInput);
      } else {
        await createMedication(medicationInput);
      }

      router.replace('/medications');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Voltar" hitSlop={10} onPress={handleBackPress}>
            <MaterialCommunityIcons name="chevron-left" color="#15172E" size={32} />
          </Pressable>

          <Pressable accessibilityLabel="Fechar" hitSlop={10} onPress={closeFlow}>
            <MaterialCommunityIcons name="close" color="#15172E" size={26} />
          </Pressable>
        </View>

        {step === 1 ? (
          <>
            <View style={styles.content}>
              <Text style={styles.stepText}>1 de 2</Text>
              <Text style={styles.title}>
                {isEditing ? 'Editar Medicação' : 'Adicionar Medicação'}
              </Text>

              <View style={styles.kindRow}>
                {medicationKinds.map((kind) => {
                  const isSelected = kind.id === selectedKindId;

                  return (
                    <Pressable
                      accessibilityLabel={`Selecionar tipo ${kind.id}`}
                      key={kind.id}
                      onPress={() => setSelectedKindId(kind.id)}
                      style={styles.kindButton}>
                      <View style={[styles.kindIconFrame, { backgroundColor: kind.iconBackground }]}>
                        <MaterialCommunityIcons
                          name={kind.icon}
                          color={kind.iconColor}
                          size={34}
                          style={
                            kind.iconRotate ? { transform: [{ rotate: kind.iconRotate }] } : null
                          }
                        />
                      </View>

                      {isSelected ? (
                        <View style={styles.kindCheck}>
                          <MaterialCommunityIcons name="check" color="#FFFFFF" size={12} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fields}>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setName}
                  placeholder="Nome"
                  placeholderTextColor="#CDD3DA"
                  style={styles.input}
                  value={name}
                />
                <TextInput
                  onChangeText={setDose}
                  placeholder="Dose única, e.x. 1 comprimido"
                  placeholderTextColor="#CDD3DA"
                  style={styles.input}
                  value={dose}
                />
              </View>
            </View>

            <Pressable
              accessibilityLabel="Proximo"
              disabled={!canContinue}
              onPress={() => setStep(2)}
              style={[styles.primaryButton, canContinue ? styles.primaryButtonEnabled : null]}>
              <Text
                style={[
                  styles.primaryButtonText,
                  canContinue ? styles.primaryButtonTextEnabled : null,
                ]}>
                {canContinue ? 'Próximo' : 'Preencha os campos'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.content}>
              <Text style={styles.stepText}>2 de 2</Text>
              <Text style={styles.title}>Agendar</Text>

              <View style={styles.medicationSummary}>
                <View style={styles.summaryLine} />
                <View style={styles.summaryIconFrame}>
                  <MaterialCommunityIcons
                    name={selectedMedicationKind.icon}
                    color={selectedMedicationKind.iconColor}
                    size={34}
                    style={
                      selectedMedicationKind.iconRotate
                        ? { transform: [{ rotate: selectedMedicationKind.iconRotate }] }
                        : null
                    }
                  />
                </View>

                <View style={styles.summaryCopy}>
                  <Text numberOfLines={1} style={styles.summaryName}>
                    {name}
                  </Text>
                  <Text numberOfLines={1} style={styles.summaryDose}>
                    {dose}
                  </Text>
                </View>
              </View>

              <View style={styles.repeatRow}>
                <Text style={styles.repeatLabel}>Repetir</Text>
                <Pressable
                  accessibilityLabel="Selecionar repeticao"
                  onPress={() => setIsRepeatModalVisible(true)}
                  style={styles.repeatButton}>
                  <Text numberOfLines={1} style={styles.repeatButtonText}>
                    {selectedRepeatLabel}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" color="#15172E" size={22} />
                </Pressable>
              </View>

              <View style={styles.scheduleRows}>
                {scheduledDoses.map((scheduledDose, index) => (
                  <View key={scheduledDose.id} style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>Dose {index + 1}</Text>
                    <View style={styles.timeActions}>
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={5}
                        onChangeText={(value) => updateDoseTime(scheduledDose.id, value)}
                        placeholder="00:00"
                        placeholderTextColor="#C1C7D0"
                        style={styles.timeInput}
                        value={scheduledDose.time}
                      />

                      {scheduledDoses.length > 1 ? (
                        <Pressable
                          accessibilityLabel={`Excluir dose ${index + 1}`}
                          hitSlop={10}
                          onPress={() => removeDose(scheduledDose.id)}
                          style={styles.removeDoseButton}>
                          <MaterialCommunityIcons name="trash-can-outline" color="#F05252" size={21} />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))}

                <Pressable
                  accessibilityLabel="Adicionar dose"
                  onPress={addDose}
                  style={styles.addDoseButton}>
                  <MaterialCommunityIcons name="plus" color="#15172E" size={24} />
                </Pressable>
              </View>

              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Lembrete</Text>
                <Pressable
                  accessibilityLabel="Ativar lembrete"
                  onPress={() => setIsReminderEnabled((currentValue) => !currentValue)}
                  style={[
                    styles.reminderSwitch,
                    isReminderEnabled ? styles.reminderSwitchEnabled : null,
                  ]}>
                  <View
                    style={[
                      styles.reminderThumb,
                      isReminderEnabled ? styles.reminderThumbEnabled : null,
                    ]}
                  />
                </Pressable>
              </View>

              {isReminderEnabled ? (
                <View style={styles.reminderOptions}>
                  {reminderMinuteOptions.map((minutes) => {
                    const isSelected = selectedReminderMinutes === minutes;

                    return (
                      <Pressable
                        accessibilityLabel={`Lembrar ${minutes} minutos antes`}
                        key={minutes}
                        onPress={() => setSelectedReminderMinutes(minutes)}
                        style={styles.reminderOption}>
                        <Text
                          style={[
                            styles.reminderOptionText,
                            isSelected ? styles.selectedReminderOptionText : null,
                          ]}>
                          {minutes} m
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel="Concluir"
              disabled={!canConclude}
              onPress={conclude}
              style={[styles.primaryButton, canConclude ? styles.primaryButtonEnabled : null]}>
              <Text
                style={[
                  styles.primaryButtonText,
                  canConclude ? styles.primaryButtonTextEnabled : null,
                ]}>
                {isSaving ? 'Salvando' : isEditing ? 'Salvar' : 'Concluir'}
              </Text>
            </Pressable>
          </>
        )}

        <Modal
          animationType="fade"
          onRequestClose={() => setIsRepeatModalVisible(false)}
          transparent
          visible={isRepeatModalVisible}>
          <Pressable
            accessibilityLabel="Fechar repeticao"
            onPress={() => setIsRepeatModalVisible(false)}
            style={styles.modalBackdrop}>
            <Pressable style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Repetir</Text>
                <Pressable
                  accessibilityLabel="Fechar"
                  onPress={() => setIsRepeatModalVisible(false)}
                  style={styles.modalCloseButton}>
                  <MaterialCommunityIcons name="close" color="#15172E" size={20} />
                </Pressable>
              </View>

              <View style={styles.repeatOptions}>
                {repeatOptions.map((option) => {
                  const isSelected = option.mode === repeatMode;

                  return (
                    <Pressable
                      accessibilityLabel={`Selecionar ${option.label}`}
                      key={option.mode}
                      onPress={() => selectRepeatMode(option.mode)}
                      style={[
                        styles.repeatOption,
                        isSelected ? styles.selectedRepeatOption : null,
                      ]}>
                      <Text
                        style={[
                          styles.repeatOptionText,
                          isSelected ? styles.selectedRepeatOptionText : null,
                        ]}>
                        {option.label}
                      </Text>
                      {isSelected ? (
                        <MaterialCommunityIcons name="check" color="#FFFFFF" size={20} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {repeatMode === 'custom' ? (
                <>
                  <Text style={styles.customDaysTitle}>Dias da semana</Text>
                  <View style={styles.customDays}>
                    {weekDayOptions.map((weekday) => {
                      const isSelected = selectedCustomWeekdays.includes(weekday.value);

                      return (
                        <Pressable
                          accessibilityLabel={`Selecionar ${weekday.label}`}
                          key={weekday.value}
                          onPress={() => toggleCustomWeekday(weekday.value)}
                          style={[
                            styles.customDayButton,
                            isSelected ? styles.selectedCustomDayButton : null,
                          ]}>
                          <Text
                            style={[
                              styles.customDayText,
                              isSelected ? styles.selectedCustomDayText : null,
                            ]}>
                            {weekday.shortLabel}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    accessibilityLabel="Concluir selecao de dias"
                    onPress={() => setIsRepeatModalVisible(false)}
                    style={styles.modalDoneButton}>
                    <Text style={styles.modalDoneButtonText}>Concluir</Text>
                  </Pressable>
                </>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 29,
    paddingTop: 46,
    paddingBottom: 38,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  stepText: {
    color: '#8B8C96',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  title: {
    marginTop: 10,
    color: '#15172E',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  kindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 42,
  },
  kindButton: {
    position: 'relative',
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindIconFrame: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
  },
  kindCheck: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#65BE7B',
  },
  fields: {
    gap: 31,
    marginTop: 34,
  },
  input: {
    minHeight: 32,
    padding: 0,
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  medicationSummary: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 39,
  },
  summaryLine: {
    width: 4,
    height: 56,
    marginRight: 15,
    borderRadius: 2,
    backgroundColor: '#F2F5F6',
  },
  summaryIconFrame: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
  },
  summaryName: {
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  summaryDose: {
    marginTop: 5,
    color: '#C1C7D0',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  scheduleRows: {
    marginTop: 24,
  },
  scheduleRow: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  scheduleLabel: {
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  timeInput: {
    width: 88,
    padding: 0,
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
    textAlign: 'right',
  },
  timeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeDoseButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFF0F0',
  },
  addDoseButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 21,
    backgroundColor: '#F2F5F6',
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F7F9FA',
  },
  repeatLabel: {
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  repeatButton: {
    maxWidth: 176,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  repeatButtonText: {
    flexShrink: 1,
    color: '#15172E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
    textAlign: 'right',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
  },
  reminderLabel: {
    color: '#15172E',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  reminderSwitch: {
    width: 48,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#F2F5F6',
  },
  reminderSwitchEnabled: {
    backgroundColor: '#A8E3AE',
  },
  reminderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  reminderThumbEnabled: {
    alignSelf: 'flex-end',
  },
  reminderOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  reminderOption: {
    minWidth: 43,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderOptionText: {
    color: '#C1C7D0',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 22,
  },
  selectedReminderOptionText: {
    color: '#15172E',
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
  repeatOptions: {
    gap: 8,
  },
  repeatOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F4F7F8',
  },
  selectedRepeatOption: {
    backgroundColor: '#ADEBB5',
  },
  repeatOptionText: {
    color: '#15172E',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  selectedRepeatOptionText: {
    color: '#FFFFFF',
  },
  customDaysTitle: {
    marginTop: 18,
    color: '#15172E',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  customDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },
  customDayButton: {
    width: 52,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F4F7F8',
  },
  selectedCustomDayButton: {
    backgroundColor: '#ADEBB5',
  },
  customDayText: {
    color: '#15172E',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  selectedCustomDayText: {
    color: '#FFFFFF',
  },
  modalDoneButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: '#A8E3AE',
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  primaryButton: {
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
  },
  primaryButtonEnabled: {
    backgroundColor: '#A8E3AE',
  },
  primaryButtonText: {
    color: '#CDD3DA',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  primaryButtonTextEnabled: {
    color: '#FFFFFF',
  },
});

function getScheduleWeekdays(
  repeatMode: RepeatMode,
  selectedCustomWeekdays: number[],
  selectedWeekday: number,
) {
  if (repeatMode === 'daily') {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (repeatMode === 'weekdays') {
    return [1, 2, 3, 4, 5];
  }

  if (repeatMode === 'custom') {
    return selectedCustomWeekdays.length > 0 ? selectedCustomWeekdays : [selectedWeekday];
  }

  return [selectedWeekday];
}

function getWeekdayOrder(weekday: number) {
  return weekday === 0 ? 7 : weekday;
}

function getUniqueWeekdays(schedules: { weekday: number }[]) {
  return Array.from(new Set(schedules.map((schedule) => schedule.weekday))).sort(
    (firstWeekday, secondWeekday) => getWeekdayOrder(firstWeekday) - getWeekdayOrder(secondWeekday),
  );
}

function getUniqueTimes(schedules: { time: string }[]) {
  return Array.from(new Set(schedules.map((schedule) => schedule.time))).sort();
}

function getRepeatModeFromWeekdays(weekdays: number[], fallbackWeekday: number): RepeatMode {
  const orderedWeekdays = weekdays.length > 0 ? weekdays : [fallbackWeekday];
  const weekdayKey = orderedWeekdays.join(',');

  if (orderedWeekdays.length === 7) {
    return 'daily';
  }

  if (weekdayKey === '1,2,3,4,5') {
    return 'weekdays';
  }

  if (orderedWeekdays.length === 1 && orderedWeekdays[0] === fallbackWeekday) {
    return 'once';
  }

  return 'custom';
}

function getMedicationRepeatMode(
  storedRepeatMode: RepeatMode,
  weekdays: number[],
  fallbackWeekday: number,
): RepeatMode {
  if (storedRepeatMode === 'custom') {
    return getRepeatModeFromWeekdays(weekdays, fallbackWeekday);
  }

  return storedRepeatMode;
}
