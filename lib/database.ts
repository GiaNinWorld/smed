import * as SQLite from 'expo-sqlite';

import {
  cancelMedicationNotifications,
  scheduleMedicationNotifications,
} from './notifications';

export type AvatarVariant = 'pink' | 'blue';

export type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
};

export type CurrentUserProfile = CurrentUser & {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export type FamilyMember = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatarVariant: AvatarVariant;
  displayName: string;
  isPrimary: boolean;
};

export type MedicationKind = 'tablet' | 'capsule' | 'ampoule' | 'syringe';
export type MedicationRepeatMode = 'once' | 'daily' | 'weekdays' | 'custom';

export type MedicationScheduleInput = {
  time: string;
  weekday: number;
  reminderEnabled: boolean;
  reminderMinutes?: number;
};

export type MedicationInput = {
  dose: string;
  kind: MedicationKind;
  name: string;
  repeatMode: MedicationRepeatMode;
  schedules: MedicationScheduleInput[];
};

export type MedicationListItem = {
  id: number;
  dose: string;
  hour: string;
  kind: MedicationKind;
  name: string;
  reminderEnabled: boolean;
  reminderMinutes: number | null;
};

export type MedicationDetails = {
  id: number;
  dose: string;
  kind: MedicationKind;
  name: string;
  repeatMode: MedicationRepeatMode;
  schedules: MedicationScheduleInput[];
};

type CurrentUserRow = {
  id: number;
  full_name: string;
  email: string;
};

type FamilyMemberRow = {
  id: number;
  first_name: string;
  last_name: string | null;
  birth_date: string | null;
  avatar_variant: AvatarVariant;
  is_primary: number;
};

type FamilyMemberInput = {
  firstName: string;
  lastName?: string;
  birthDate?: string;
  avatarVariant?: AvatarVariant;
};

type UserAccountInput = {
  fullName: string;
  email: string;
  password: string;
};

type CurrentUserProfileRow = CurrentUserRow & {
  first_name: string;
  last_name: string | null;
  birth_date: string | null;
};

type MedicationListRow = {
  id: number;
  dose: string;
  kind: MedicationKind;
  name: string;
  reminder_enabled: number;
  reminder_minutes: number | null;
  time: string;
};

type MedicationDetailsRow = {
  id: number;
  dose: string;
  kind: MedicationKind;
  name: string;
  repeat_mode: MedicationRepeatMode | null;
};

type MedicationScheduleRow = {
  reminder_enabled: number;
  reminder_minutes: number | null;
  time: string;
  weekday: number;
};

type CurrentUserProfileInput = {
  firstName: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  password?: string;
};

const DATABASE_NAME = 'smed.sqlite';
const DATABASE_VERSION = 3;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabase();
  }

  return databasePromise;
}

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await migrateDatabase(db);
  return db;
}

async function migrateDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    await ensureMedicationRepeatModeColumn(db);
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_user_id INTEGER,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS family_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        birth_date TEXT,
        avatar_variant TEXT NOT NULL DEFAULT 'pink' CHECK (avatar_variant IN ('pink', 'blue')),
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_member_id INTEGER,
        name TEXT NOT NULL,
        dose TEXT NOT NULL,
        kind TEXT NOT NULL,
        repeat_mode TEXT NOT NULL DEFAULT 'custom',
        stock_amount INTEGER,
        stock_unit TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS medication_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER NOT NULL,
        weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
        time TEXT NOT NULL,
        reminder_enabled INTEGER NOT NULL DEFAULT 0,
        reminder_minutes INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_medications_family_member_id ON medications(family_member_id);
      CREATE INDEX IF NOT EXISTS idx_medication_schedules_medication_id
        ON medication_schedules(medication_id);
    `);

    currentVersion = 2;
  }

  if (currentVersion === 1) {
    await migrateFromOneToTwo(db);
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await migrateFromTwoToThree(db);
    currentVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}

async function migrateFromTwoToThree(db: SQLite.SQLiteDatabase) {
  await ensureMedicationRepeatModeColumn(db);
}

async function ensureMedicationRepeatModeColumn(db: SQLite.SQLiteDatabase) {
  if (!(await tableExists(db, 'medications'))) {
    return;
  }

  if (!(await columnExists(db, 'medications', 'repeat_mode'))) {
    await db.execAsync("ALTER TABLE medications ADD COLUMN repeat_mode TEXT NOT NULL DEFAULT 'custom';");
  }

  await db.runAsync(
    "UPDATE medications SET repeat_mode = 'custom' WHERE repeat_mode IS NULL OR repeat_mode = ''",
  );
}

async function migrateFromOneToTwo(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_user_id INTEGER,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

  `);

  if (!(await columnExists(db, 'family_members', 'user_id'))) {
    await db.execAsync('ALTER TABLE family_members ADD COLUMN user_id INTEGER;');
  }

  if (!(await columnExists(db, 'family_members', 'is_primary'))) {
    await db.execAsync('ALTER TABLE family_members ADD COLUMN is_primary INTEGER NOT NULL DEFAULT 0;');
  }

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
  `);
}

async function columnExists(db: SQLite.SQLiteDatabase, tableName: string, columnName: string) {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return rows.some((row) => row.name === columnName);
}

async function tableExists(db: SQLite.SQLiteDatabase, tableName: string) {
  const row = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    tableName,
  );

  return Boolean(row);
}

export async function createUserAccount(input: UserAccountInput) {
  const db = await getDatabase();
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const passwordHash = hashPassword(input.password);
  const names = splitFullName(fullName);

  const existingUser = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE email = ?',
    email,
  );

  if (existingUser) {
    throw new Error('Já existe uma conta com este e-mail.');
  }

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      fullName,
      email,
      passwordHash,
    );

    await db.runAsync(
      `
        INSERT INTO family_members
          (user_id, first_name, last_name, avatar_variant, is_primary)
        VALUES (?, ?, ?, ?, 1)
      `,
      result.lastInsertRowId,
      names.firstName,
      names.lastName || null,
      'pink',
    );

    await setCurrentUserId(result.lastInsertRowId, db);
  });

  return getCurrentUser();
}

export async function authenticateUser(emailInput: string, password: string) {
  const db = await getDatabase();
  const email = normalizeEmail(emailInput);
  const passwordHash = hashPassword(password);
  const user = await db.getFirstAsync<CurrentUserRow & { password_hash: string }>(
    `
      SELECT id, full_name, email, password_hash
      FROM users
      WHERE email = ?
    `,
    email,
  );

  if (!user || user.password_hash !== passwordHash) {
    throw new Error('E-mail ou senha inválidos.');
  }

  await setCurrentUserId(user.id, db);
  return mapCurrentUserRow(user);
}

export async function getCurrentUser() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CurrentUserRow>(`
    SELECT users.id, users.full_name, users.email
    FROM app_session
    JOIN users ON users.id = app_session.current_user_id
    WHERE app_session.id = 1
  `);

  return row ? mapCurrentUserRow(row) : null;
}

export async function getCurrentUserProfile() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CurrentUserProfileRow>(`
    SELECT
      users.id,
      users.full_name,
      users.email,
      family_members.first_name,
      family_members.last_name,
      family_members.birth_date
    FROM app_session
    JOIN users ON users.id = app_session.current_user_id
    JOIN family_members
      ON family_members.user_id = users.id
     AND family_members.is_primary = 1
    WHERE app_session.id = 1
  `);

  return row ? mapCurrentUserProfileRow(row) : null;
}

export async function updateCurrentUserProfile(input: CurrentUserProfileInput) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const existingUser = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE email = ? AND id != ?',
    email,
    userId,
  );

  if (existingUser) {
    throw new Error('Já existe uma conta com este e-mail.');
  }

  await db.withTransactionAsync(async () => {
    if (input.password) {
      await db.runAsync(
        `
          UPDATE users
          SET full_name = ?,
              email = ?,
              password_hash = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        fullName,
        email,
        hashPassword(input.password),
        userId,
      );
    } else {
      await db.runAsync(
        `
          UPDATE users
          SET full_name = ?,
              email = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        fullName,
        email,
        userId,
      );
    }

    await db.runAsync(
      `
        UPDATE family_members
        SET first_name = ?,
            last_name = ?,
            birth_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND is_primary = 1
      `,
      firstName,
      lastName || null,
      input.birthDate?.trim() || null,
      userId,
    );
  });

  return getCurrentUserProfile();
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function clearSession() {
  const db = await getDatabase();
  await setCurrentUserId(null, db);
}

async function setCurrentUserId(userId: number | null, db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    `
      INSERT INTO app_session (id, current_user_id, updated_at)
      VALUES (1, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        current_user_id = excluded.current_user_id,
        updated_at = CURRENT_TIMESTAMP
    `,
    userId,
  );
}

export async function listFamilyMembers() {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const rows = await db.getAllAsync<FamilyMemberRow>(
    `
      SELECT id, first_name, last_name, birth_date, avatar_variant, is_primary
      FROM family_members
      WHERE user_id = ? AND is_primary = 0
      ORDER BY id ASC
    `,
    userId,
  );

  return rows.map(mapFamilyMemberRow);
}

export async function getFamilyMember(id: number) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const row = await db.getFirstAsync<FamilyMemberRow>(
    `
      SELECT id, first_name, last_name, birth_date, avatar_variant, is_primary
      FROM family_members
      WHERE id = ? AND user_id = ?
    `,
    id,
    userId,
  );

  return row ? mapFamilyMemberRow(row) : null;
}

export async function createFamilyMember(input: FamilyMemberInput) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO family_members
        (user_id, first_name, last_name, birth_date, avatar_variant, is_primary)
      VALUES (?, ?, ?, ?, ?, 0)
    `,
    userId,
    input.firstName.trim(),
    input.lastName?.trim() || null,
    input.birthDate?.trim() || null,
    input.avatarVariant ?? 'pink',
  );

  return getFamilyMember(result.lastInsertRowId);
}

export async function updateFamilyMember(id: number, input: FamilyMemberInput) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE family_members
      SET first_name = ?,
          last_name = ?,
          birth_date = ?,
          avatar_variant = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `,
    input.firstName.trim(),
    input.lastName?.trim() || null,
    input.birthDate?.trim() || null,
    input.avatarVariant ?? 'pink',
    id,
    userId,
  );

  return getFamilyMember(id);
}

export async function deleteFamilyMember(id: number) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  await db.runAsync('DELETE FROM family_members WHERE id = ? AND user_id = ? AND is_primary = 0', id, userId);
}

export async function listMedicationsByWeekday(weekday: number) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const safeWeekday = normalizeWeekday(weekday);
  const rows = await db.getAllAsync<MedicationListRow>(
    `
      SELECT
        medications.id,
        medications.name,
        medications.dose,
        medications.kind,
        medication_schedules.time,
        MAX(medication_schedules.reminder_enabled) AS reminder_enabled,
        MAX(medication_schedules.reminder_minutes) AS reminder_minutes
      FROM medications
      JOIN medication_schedules
        ON medication_schedules.medication_id = medications.id
      JOIN family_members
        ON family_members.id = medications.family_member_id
      WHERE family_members.user_id = ?
        AND (
          medication_schedules.weekday = ?
          OR medications.repeat_mode = 'daily'
          OR (medications.repeat_mode = 'weekdays' AND ? BETWEEN 1 AND 5)
        )
      GROUP BY
        medications.id,
        medications.name,
        medications.dose,
        medications.kind,
        medication_schedules.time
      ORDER BY medication_schedules.time ASC, medications.name ASC
    `,
    userId,
    safeWeekday,
    safeWeekday,
  );

  return rows.map(mapMedicationListRow);
}

export async function createMedication(input: MedicationInput) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const repeatMode = normalizeMedicationRepeatMode(input.repeatMode);
  const primaryMember = await db.getFirstAsync<{ id: number }>(
    `
      SELECT id
      FROM family_members
      WHERE user_id = ? AND is_primary = 1
    `,
    userId,
  );

  if (!primaryMember) {
    throw new Error('Conta principal não encontrada.');
  }

  let newMedicationId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `
        INSERT INTO medications (family_member_id, name, dose, kind, repeat_mode)
        VALUES (?, ?, ?, ?, ?)
      `,
      primaryMember.id,
      input.name.trim(),
      input.dose.trim(),
      input.kind,
      repeatMode,
    );

    newMedicationId = result.lastInsertRowId;

    for (const schedule of input.schedules) {
      await db.runAsync(
        `
          INSERT INTO medication_schedules
            (medication_id, weekday, time, reminder_enabled, reminder_minutes)
          VALUES (?, ?, ?, ?, ?)
        `,
        newMedicationId,
        normalizeWeekday(schedule.weekday),
        schedule.time,
        schedule.reminderEnabled ? 1 : 0,
        schedule.reminderEnabled ? schedule.reminderMinutes ?? null : null,
      );
    }
  });

  // Schedule OS notifications after the DB transaction — non-fatal if permissions are denied
  if (newMedicationId > 0) {
    await scheduleMedicationNotifications(newMedicationId, input);
  }
}

export async function getMedication(id: number): Promise<MedicationDetails | null> {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const medication = await db.getFirstAsync<MedicationDetailsRow>(
    `
      SELECT
        medications.id,
        medications.name,
        medications.dose,
        medications.kind,
        medications.repeat_mode
      FROM medications
      JOIN family_members
        ON family_members.id = medications.family_member_id
      WHERE medications.id = ?
        AND family_members.user_id = ?
    `,
    id,
    userId,
  );

  if (!medication) {
    return null;
  }

  const schedules = await db.getAllAsync<MedicationScheduleRow>(
    `
      SELECT weekday, time, reminder_enabled, reminder_minutes
      FROM medication_schedules
      WHERE medication_id = ?
      ORDER BY weekday ASC, time ASC
    `,
    id,
  );

  return {
    dose: medication.dose,
    id: medication.id,
    kind: medication.kind,
    name: medication.name,
    repeatMode: medication.repeat_mode ?? 'custom',
    schedules: schedules.map(mapMedicationScheduleRow),
  };
}

export async function updateMedication(id: number, input: MedicationInput) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();
  const repeatMode = normalizeMedicationRepeatMode(input.repeatMode);
  const medication = await db.getFirstAsync<{ id: number }>(
    `
      SELECT medications.id
      FROM medications
      JOIN family_members
        ON family_members.id = medications.family_member_id
      WHERE medications.id = ?
        AND family_members.user_id = ?
    `,
    id,
    userId,
  );

  if (!medication) {
    throw new Error('MedicaÃ§Ã£o nÃ£o encontrada.');
  }

  // Cancel existing notifications before updating — they will be rescheduled below
  await cancelMedicationNotifications(id);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        UPDATE medications
        SET name = ?, dose = ?, kind = ?, repeat_mode = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      input.name.trim(),
      input.dose.trim(),
      input.kind,
      repeatMode,
      id,
    );

    await db.runAsync('DELETE FROM medication_schedules WHERE medication_id = ?', id);

    for (const schedule of input.schedules) {
      await db.runAsync(
        `
          INSERT INTO medication_schedules
            (medication_id, weekday, time, reminder_enabled, reminder_minutes)
          VALUES (?, ?, ?, ?, ?)
        `,
        id,
        normalizeWeekday(schedule.weekday),
        schedule.time,
        schedule.reminderEnabled ? 1 : 0,
        schedule.reminderEnabled ? schedule.reminderMinutes ?? null : null,
      );
    }
  });

  // Reschedule with the updated settings
  await scheduleMedicationNotifications(id, input);
}

export async function deleteMedication(id: number) {
  const userId = await requireCurrentUserId();
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM medications
      WHERE id = ?
        AND family_member_id IN (
          SELECT id FROM family_members WHERE user_id = ?
        )
    `,
    id,
    userId,
  );

  // Cancel reminders after deletion — fire-and-forget, non-fatal
  await cancelMedicationNotifications(id);
}

async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Nenhum usuário autenticado.');
  }

  return userId;
}

function mapCurrentUserRow(row: CurrentUserRow): CurrentUser {
  return {
    email: row.email,
    fullName: row.full_name,
    id: row.id,
  };
}

function mapCurrentUserProfileRow(row: CurrentUserProfileRow): CurrentUserProfile {
  return {
    birthDate: row.birth_date ?? '',
    email: row.email,
    firstName: row.first_name,
    fullName: row.full_name,
    id: row.id,
    lastName: row.last_name ?? '',
  };
}

function mapFamilyMemberRow(row: FamilyMemberRow): FamilyMember {
  const lastName = row.last_name ?? '';
  const displayName = [row.first_name, lastName].filter(Boolean).join(' ');

  return {
    id: row.id,
    firstName: row.first_name,
    lastName,
    birthDate: row.birth_date ?? '',
    avatarVariant: row.avatar_variant,
    displayName,
    isPrimary: row.is_primary === 1,
  };
}

function mapMedicationListRow(row: MedicationListRow): MedicationListItem {
  return {
    dose: row.dose,
    hour: row.time,
    id: row.id,
    kind: row.kind,
    name: row.name,
    reminderEnabled: row.reminder_enabled === 1,
    reminderMinutes: row.reminder_minutes,
  };
}

function mapMedicationScheduleRow(row: MedicationScheduleRow): MedicationScheduleInput {
  return {
    reminderEnabled: row.reminder_enabled === 1,
    reminderMinutes: row.reminder_minutes ?? undefined,
    time: row.time,
    weekday: row.weekday,
  };
}

function normalizeMedicationRepeatMode(
  repeatMode: MedicationRepeatMode | null | undefined,
): MedicationRepeatMode {
  if (
    repeatMode === 'once' ||
    repeatMode === 'daily' ||
    repeatMode === 'weekdays' ||
    repeatMode === 'custom'
  ) {
    return repeatMode;
  }

  return 'custom';
}

function normalizeWeekday(weekday: number | null | undefined) {
  if (typeof weekday !== 'number' || Number.isNaN(weekday)) {
    return new Date().getDay();
  }

  return Math.min(6, Math.max(0, Math.trunc(weekday)));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? fullName.trim();

  return {
    firstName,
    lastName: parts.join(' '),
  };
}

function hashPassword(password: string) {
  let hash = 5381;
  const value = `smed:${password}`;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(16);
}
