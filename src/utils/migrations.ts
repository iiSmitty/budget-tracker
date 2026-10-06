import { LEGACY_MONTH_NAMES, legacyMonthNameToKey, toMonthKey } from "./months";
import { MonthDataKind, STORAGE_KEYS, monthStorageKey } from "./storage";

export const CURRENT_SCHEMA_VERSION = 2;

const MONTH_DATA_KINDS: MonthDataKind[] = ["Items", "Income", "Groups"];

/**
 * Brings localStorage up to the current schema. Runs once at startup, before anything is read.
 * Each step is idempotent, and the version is only recorded once a step has fully succeeded,
 * so an interrupted migration simply runs again on the next load.
 */
export const migrateStorage = (now: Date = new Date()): void => {
    const version = Number(localStorage.getItem(STORAGE_KEYS.schemaVersion) ?? "1");
    if (version >= CURRENT_SCHEMA_VERSION) return;

    try {
        migrateV1ToV2(now);
        localStorage.setItem(STORAGE_KEYS.schemaVersion, String(CURRENT_SCHEMA_VERSION));
    } catch (error) {
        console.error("Storage migration failed; it will be retried on the next load:", error);
    }
};

/**
 * v1 keyed months by name alone ("budgetAppItems-October"), so every year shared one set of
 * months. v2 adds the year ("budgetAppItems-2026-10").
 *
 * Legacy months are assigned to the current year: what the user sees straight after upgrading
 * stays exactly the same, including anything already planned for later this year. The untouched
 * v1 values are kept under `budgetAppLegacyBackup` in case they're ever needed.
 */
const migrateV1ToV2 = (now: Date): void => {
    const year = now.getFullYear();

    const legacyEntries: Record<string, string> = {};
    LEGACY_MONTH_NAMES.forEach((name) => {
        MONTH_DATA_KINDS.forEach((kind) => {
            const legacyKey = monthStorageKey(kind, name);
            const value = localStorage.getItem(legacyKey);
            if (value !== null) {
                legacyEntries[legacyKey] = value;
            }
        });
    });

    // 1. Keep a copy of the original data before changing anything
    if (
        Object.keys(legacyEntries).length > 0 &&
        localStorage.getItem(STORAGE_KEYS.legacyBackup) === null
    ) {
        localStorage.setItem(
            STORAGE_KEYS.legacyBackup,
            JSON.stringify({ migratedAt: now.toISOString(), assignedYear: year, entries: legacyEntries })
        );
    }

    // 2. Copy each month to its year-qualified key, never overwriting data already there
    LEGACY_MONTH_NAMES.forEach((name, monthIndex) => {
        const month = toMonthKey(year, monthIndex);
        MONTH_DATA_KINDS.forEach((kind) => {
            const value = legacyEntries[monthStorageKey(kind, name)];
            const newKey = monthStorageKey(kind, month);
            if (value !== undefined && localStorage.getItem(newKey) === null) {
                localStorage.setItem(newKey, value);
            }
        });
    });

    // 3. Point the "last viewed month" at the new key
    const savedMonth = localStorage.getItem(STORAGE_KEYS.currentMonth);
    const migratedMonth = savedMonth ? legacyMonthNameToKey(savedMonth, year) : null;
    if (migratedMonth) {
        localStorage.setItem(STORAGE_KEYS.currentMonth, migratedMonth);
    }

    // 4. Only now remove the old keys
    Object.keys(legacyEntries).forEach((legacyKey) => localStorage.removeItem(legacyKey));
};
