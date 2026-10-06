import { CurrencyType, currencies } from "./utils";
import { BudgetItemType, ExpenseGroup, ExportData } from "../types/budget";
import { MonthKey, isMonthKey, legacyMonthNameToKey } from "./months";
import {
  STORAGE_KEYS,
  listStoredMonths,
  loadMonthGroups,
  loadMonthIncome,
  loadMonthItems,
  saveMonthGroups,
  saveMonthIncome,
  saveMonthItems,
} from "./storage";

// Export all budget data to a JSON file
export const exportBudgetData = () => {
  const exportData: ExportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    darkMode: JSON.parse(localStorage.getItem(STORAGE_KEYS.darkMode) || "false"),
    currentMonth: localStorage.getItem(STORAGE_KEYS.currentMonth),
    visited: localStorage.getItem(STORAGE_KEYS.visited) === "true",
    currency: (localStorage.getItem(STORAGE_KEYS.currency) || "ZAR") as CurrencyType,
    months: {},
  };

  listStoredMonths().forEach((month) => {
    exportData.months[month] = {
      items: loadMonthItems(month),
      income: loadMonthIncome(month) ?? 0,
      groups: loadMonthGroups(month) ?? [],
    };
  });

  // Convert to JSON and create a Blob
  const jsonData = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Create a filename with the current date
  const date = new Date().toISOString().split("T")[0];
  const filename = `budget-tracker-backup-${date}.json`;

  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
};

// A validated backup, normalised to "YYYY-MM" month keys whatever version it came from.
// Fields are only present when the file had them, so importing never blanks out existing data.
export interface ParsedBackup {
  darkMode?: boolean;
  currentMonth?: MonthKey;
  visited?: boolean;
  currency: CurrencyType;
  months: Record<MonthKey, { items?: BudgetItemType[]; income?: number; groups?: ExpenseGroup[] }>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Validates a parsed backup file and converts it to the current format. Version 1 backups
 * (months keyed by name) are assigned to the current year, matching the storage migration.
 * Throws with a readable message if the file isn't a valid backup.
 */
export const parseBackup = (raw: unknown, now: Date = new Date()): ParsedBackup => {
  if (!isRecord(raw) || !isRecord(raw.months)) {
    throw new Error("Invalid backup file format");
  }

  const isLegacy = raw.version === undefined;
  if (!isLegacy && raw.version !== 2) {
    throw new Error("This backup was made by a newer version of BudgetTracker");
  }

  const toMonth = (name: unknown): MonthKey | null =>
    isLegacy
      ? typeof name === "string" ? legacyMonthNameToKey(name, now.getFullYear()) : null
      : isMonthKey(name) ? name : null;

  const months: ParsedBackup["months"] = {};
  Object.entries(raw.months).forEach(([name, data]) => {
    const month = toMonth(name);
    if (!month || !isRecord(data)) {
      throw new Error(`Invalid month in backup file: ${name}`);
    }
    if (data.items !== undefined && !Array.isArray(data.items)) {
      throw new Error(`Invalid expenses for ${name} in backup file`);
    }
    if (data.income !== undefined && typeof data.income !== "number") {
      throw new Error(`Invalid income for ${name} in backup file`);
    }
    if (data.groups !== undefined && !Array.isArray(data.groups)) {
      throw new Error(`Invalid groups for ${name} in backup file`);
    }

    months[month] = {
      ...(data.items !== undefined && { items: data.items as BudgetItemType[] }),
      ...(data.income !== undefined && { income: data.income as number }),
      ...(data.groups !== undefined && { groups: data.groups as ExpenseGroup[] }),
    };
  });

  const currentMonth = toMonth(raw.currentMonth);

  return {
    ...(typeof raw.darkMode === "boolean" && { darkMode: raw.darkMode }),
    ...(currentMonth && { currentMonth }),
    ...(typeof raw.visited === "boolean" && { visited: raw.visited }),
    currency:
      typeof raw.currency === "string" && raw.currency in currencies
        ? (raw.currency as CurrencyType)
        : "ZAR",
    months,
  };
};

// Write a parsed backup into localStorage. Months in the backup replace the stored ones;
// months that aren't in the backup are left alone.
const applyBackup = (backup: ParsedBackup): void => {
  if (backup.darkMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(backup.darkMode));
  }
  if (backup.currentMonth) {
    localStorage.setItem(STORAGE_KEYS.currentMonth, backup.currentMonth);
  }
  if (backup.visited !== undefined) {
    localStorage.setItem(STORAGE_KEYS.visited, backup.visited ? "true" : "false");
  }
  localStorage.setItem(STORAGE_KEYS.currency, backup.currency);

  Object.entries(backup.months).forEach(([month, data]) => {
    if (data.items) saveMonthItems(month, data.items);
    if (data.income !== undefined) saveMonthIncome(month, data.income);
    if (data.groups) saveMonthGroups(month, data.groups);
  });
};

// Import data from a JSON backup file (current or version 1 format)
export const importBudgetData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }

        let raw: unknown;
        try {
          raw = JSON.parse(event.target.result as string);
        } catch {
          throw new Error("This file isn't a BudgetTracker backup (invalid JSON)");
        }

        // Validate everything before writing anything, so a bad file can't half-import
        applyBackup(parseBackup(raw));
        resolve(true);
      } catch (error) {
        console.error("Import error:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };

    reader.readAsText(file);
  });
};
