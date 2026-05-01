/**
 * @module notifications
 * @description Centralized module for local medication reminder notifications.
 *
 * Responsibilities:
 *   - Configure Android notification channel and foreground handler
 *   - Request OS-level permissions from the user
 *   - Schedule repeating notifications based on medication schedules
 *   - Cancel notifications when a medication is edited or deleted
 *
 * Notification identifier format: `med-{medicationId}-wd{weekday}-t{HHmm}`
 * This ensures each schedule slot has a unique, predictable ID for targeted cancellation.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/notifications/
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { MedicationInput } from './database';

/** Android channel ID for all medication reminders. */
const CHANNEL_ID = 'medication-reminders';

/**
 * Builds a deterministic notification identifier for a specific medication schedule slot.
 *
 * @param medicationId - The database ID of the medication.
 * @param weekday - JS weekday (0 = Sunday … 6 = Saturday).
 * @param time - Time string in "HH:MM" format.
 * @returns A string identifier like "med-42-wd1-t0830".
 */
function buildNotificationId(medicationId: number, weekday: number, time: string): string {
  const timePart = time.replace(':', '');
  return `med-${medicationId}-wd${weekday}-t${timePart}`;
}

/**
 * Converts a JS weekday (Date.getDay()) to the expo-notifications weekday convention.
 *
 * JS  → expo-notifications
 * 0 (Sun) → 1
 * 1 (Mon) → 2
 * ...
 * 6 (Sat) → 7
 *
 * @param jsWeekday - 0–6 as returned by Date.getDay().
 * @returns 1–7 as expected by expo-notifications CalendarTrigger.
 */
function toExpoWeekday(jsWeekday: number): number {
  return jsWeekday === 0 ? 1 : jsWeekday + 1;
}

/**
 * Parses a "HH:MM" time string and subtracts the given minutes,
 * returning the reminder { hour, minute } to pass to the trigger.
 *
 * @param time - Time string in "HH:MM" format (e.g. "08:30").
 * @param offsetMinutes - Minutes to subtract (the reminder lead time).
 * @returns Object with { hour, minute } for the notification trigger.
 */
function computeReminderTime(time: string, offsetMinutes: number): { hour: number; minute: number } {
  const [rawHour, rawMinute] = time.split(':').map(Number);
  const totalMinutes = rawHour * 60 + rawMinute - offsetMinutes;
  // Wrap around midnight if the offset pushes us before 00:00
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

/**
 * Configures the foreground notification handler and creates the Android notification channel.
 * Must be called once during app initialization (e.g., in the root layout).
 *
 * Side effects:
 *   - Sets `Notifications.setNotificationHandler` so banners + sound appear while the app is open.
 *   - Creates Android channel "medication-reminders" with HIGH importance.
 */
export function setupNotifications(): void {
  // Show alert banner and play sound even when app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // SDK 54+ requires explicit banner and list visibility flags
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Android requires an explicit notification channel — this is a no-op on iOS
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de Medicamentos',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4FC3A1',
    });
  }
}

/**
 * Requests OS-level notification permissions from the user.
 *
 * @returns `true` if permission was granted, `false` otherwise.
 * @sideEffects May show the system permission dialog on first call.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedules all reminder notifications for a given medication based on its input.
 * Only schedules notifications for schedules where `reminderEnabled` is true.
 *
 * Strategy per `repeatMode`:
 *   - `once`     → DATE trigger (next absolute occurrence of weekday + time - offset)
 *   - `daily`    → DAILY trigger (repeats every day at reminder time)
 *   - `weekdays` → CALENDAR trigger with weekday 2–6 (Mon–Fri), repeats: true
 *   - `custom`   → CALENDAR trigger with specific weekday, repeats: true
 *
 * @param medicationId - Database ID used to build unique notification identifiers.
 * @param input - The medication input containing name, dose, and schedules.
 */
export async function scheduleMedicationNotifications(
  medicationId: number,
  input: MedicationInput,
): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    // Why: silently skip rather than crashing — the user can enable permissions later.
    // The DB save already succeeded; we never block that for a notification failure.
    return;
  }

  const enabledSchedules = input.schedules.filter((s) => s.reminderEnabled);

  for (const schedule of enabledSchedules) {
    if (!schedule.time || schedule.time.length !== 5) {
      continue;
    }

    const offsetMinutes = schedule.reminderMinutes ?? 0;
    const { hour, minute } = computeReminderTime(schedule.time, offsetMinutes);
    const identifier = buildNotificationId(medicationId, schedule.weekday, schedule.time);
    const notificationTitle = `💊 ${input.name}`;
    const minuteLabel = offsetMinutes > 0 ? `em ${offsetMinutes} min` : 'agora';
    const notificationBody = `Hora de tomar ${input.dose} ${minuteLabel}.`;

    await scheduleForMode({
      identifier,
      title: notificationTitle,
      body: notificationBody,
      hour,
      minute,
      weekday: schedule.weekday,
      repeatMode: input.repeatMode,
    });
  }
}

type ScheduleForModeParams = {
  identifier: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  /** JS weekday: 0 = Sunday, 6 = Saturday */
  weekday: number;
  repeatMode: MedicationInput['repeatMode'];
};

/**
 * Schedules a single notification based on the medication's repeat mode.
 *
 * Time complexity: O(1) — one notification scheduled per call.
 *
 * @param params - Schedule parameters including trigger type and timing.
 */
async function scheduleForMode(params: ScheduleForModeParams): Promise<void> {
  const { identifier, title, body, hour, minute, weekday, repeatMode } = params;
  const content: Notifications.NotificationContentInput = { title, body, sound: 'default' };

  if (repeatMode === 'daily') {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger: {
        // Why: DAILY trigger is inherently repeating — 'repeats' is not a valid field
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return;
  }

  if (repeatMode === 'once') {
    // Compute the absolute timestamp for the next occurrence of this weekday + time
    const triggerDate = nextWeekdayDate(weekday, hour, minute);
    await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return;
  }

  // 'weekdays' and 'custom' both use the CALENDAR trigger with repeats: true.
  // For 'weekdays', the database already stores individual entries for each
  // weekday (Mon–Fri), so a single CALENDAR trigger per entry is correct.
  await Notifications.scheduleNotificationAsync({
    identifier,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: toExpoWeekday(weekday),
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Cancels all scheduled notifications that belong to a specific medication.
 * Uses the deterministic identifier prefix `med-{medicationId}-` for matching.
 *
 * Time complexity: O(n) where n = total scheduled notifications on the device.
 *
 * @param medicationId - The database ID of the medication to cancel reminders for.
 */
export async function cancelMedicationNotifications(medicationId: number): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = `med-${medicationId}-`;

  const cancelPromises = scheduled
    .filter((notification) => notification.identifier.startsWith(prefix))
    .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier));

  await Promise.all(cancelPromises);
}

/**
 * Computes the next absolute Date for a given JS weekday + hour + minute.
 * If the computed time is in the past or is within the next minute, it advances by 7 days.
 *
 * @param jsWeekday - Target day of the week (0 = Sunday … 6 = Saturday).
 * @param hour - Target hour (0–23).
 * @param minute - Target minute (0–59).
 * @returns A Date object representing the upcoming occurrence.
 */
function nextWeekdayDate(jsWeekday: number, hour: number, minute: number): Date {
  const now = new Date();
  const result = new Date(now);

  result.setHours(hour, minute, 0, 0);

  const currentDay = now.getDay();
  let daysUntilTarget = (jsWeekday - currentDay + 7) % 7;

  // If today is the target weekday but the time has already passed, schedule for next week
  if (daysUntilTarget === 0 && result.getTime() <= now.getTime() + 60_000) {
    daysUntilTarget = 7;
  }

  result.setDate(result.getDate() + daysUntilTarget);
  return result;
}
