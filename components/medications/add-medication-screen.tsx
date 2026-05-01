import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type MedicationKind = {
  id: string;
  icon: 'pill' | 'needle';
  iconBackground: string;
  iconColor: string;
  iconRotate?: string;
};

type ScheduledDose = {
  id: number;
  time: string;
};

const reminderMinuteOptions = [5, 10, 15, 20, 30];

const medicationKinds: MedicationKind[] = [
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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedKindId, setSelectedKindId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([{ id: 1, time: '' }]);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState(20);

  const canContinue = Boolean(selectedKindId && name.trim() && dose.trim());
  const canConclude = scheduledDoses.some((scheduledDose) => scheduledDose.time.length === 5);
  const selectedMedicationKind =
    medicationKinds.find((kind) => kind.id === selectedKindId) ?? medicationKinds[0];

  function closeFlow() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

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

  function conclude() {
    if (canConclude) {
      router.replace('/medications');
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
              <Text style={styles.title}>Adicionar Medicação</Text>

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
                Concluir
              </Text>
            </Pressable>
          </>
        )}
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
    marginTop: 28,
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 37,
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
