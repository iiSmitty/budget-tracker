import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { getDefaultGroups } from "./groupUtils";
import { MonthKey, getCurrentMonthKey, isMonthKey } from "./months";
import { CurrencyType, currencies } from "./utils";

// Every localStorage key the app uses that isn't tied to a month
export const STORAGE_KEYS = {
    darkMode: "budgetAppDarkMode",
    currency: "budgetAppCurrency",
    currentMonth: "budgetAppCurrentMonth",
    visited: "budgetAppVisited",
    importExportInfoSeen: "budgetAppImportExportInfoSeen",
    schemaVersion: "budgetAppSchemaVersion",
    legacyBackup: "budgetAppLegacyBackup",
    lastBackupAt: "budgetAppLastBackupAt",
} as const;

// Each month's data lives under three keys, e.g. "budgetAppItems-2026-10"
export type MonthDataKind = "Items" | "Income" | "Groups";

export const monthStorageKey = (kind: MonthDataKind, month: string): string =>
    `budgetApp${kind}-${month}`;

const MONTH_DATA_KEY_PATTERN = /^budgetApp(?:Items|Income|Groups)-(.+)$/;

const readJSON = <T>(key: string): T | null => {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
};

const writeJSON = (key: string, value: unknown): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

export const loadMonthItems = (month: MonthKey): BudgetItemType[] =>
    readJSON<BudgetItemType[]>(monthStorageKey("Items", month)) ?? [];

export const saveMonthItems = (month: MonthKey, items: BudgetItemType[]): void =>
    writeJSON(monthStorageKey("Items", month), items);

// null when the month has never had an income saved
export const loadMonthIncome = (month: MonthKey): number | null =>
    readJSON<number>(monthStorageKey("Income", month));

export const saveMonthIncome = (month: MonthKey, income: number): void =>
    writeJSON(monthStorageKey("Income", month), income);

// null when the month has never had groups saved
export const loadMonthGroups = (month: MonthKey): ExpenseGroup[] | null =>
    readJSON<ExpenseGroup[]>(monthStorageKey("Groups", month));

export const saveMonthGroups = (month: MonthKey, groups: ExpenseGroup[]): void =>
    writeJSON(monthStorageKey("Groups", month), groups);

// The month the user was last looking at, or this calendar month
export const loadCurrentMonth = (): MonthKey => {
    const saved = localStorage.getItem(STORAGE_KEYS.currentMonth);
    return isMonthKey(saved) ? saved : getCurrentMonthKey();
};

export const saveCurrentMonth = (month: MonthKey): void =>
    localStorage.setItem(STORAGE_KEYS.currentMonth, month);

// Whether anything has ever been saved for the month
export const hasMonthData = (month: MonthKey): boolean =>
    (["Items", "Income", "Groups"] as const).some(
        (kind) => localStorage.getItem(monthStorageKey(kind, month)) !== null
    );

// Months with any stored data, oldest first
export const listStoredMonths = (): MonthKey[] => {
    const months = new Set<MonthKey>();
    for (let index = 0; index < localStorage.length; index++) {
        const month = localStorage.key(index)?.match(MONTH_DATA_KEY_PATTERN)?.[1];
        if (isMonthKey(month)) {
            months.add(month);
        }
    }
    return [...months].sort();
};

// Whether any month has at least one item, i.e. there's something worth backing up
export const hasAnyItems = (): boolean =>
    listStoredMonths().some((month) => loadMonthItems(month).length > 0);

// When the user last downloaded a backup, if ever
export const loadLastBackupAt = (): Date | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.lastBackupAt);
    const date = saved ? new Date(saved) : null;
    return date && !isNaN(date.getTime()) ? date : null;
};

export interface MonthState {
    items: BudgetItemType[];
    income: number;
    groups: ExpenseGroup[];
}

// A value the month doesn't have yet, taken from the closest earlier month that has one
// (or, failing that, the closest later month)
const inheritFromNearestMonth = <T>(month: MonthKey, load: (month: MonthKey) => T | null): T | null => {
    const others = listStoredMonths().filter((other) => other !== month);
    const nearestFirst = [
        ...others.filter((other) => other < month).reverse(),
        ...others.filter((other) => other > month),
    ];
    for (const other of nearestFirst) {
        const value = load(other);
        if (value !== null) return value;
    }
    return null;
};

// Everything needed to show a month. A month that has never been used starts with no items,
// but inherits income and groups from the nearest month that has them (or the default groups),
// so each new month doesn't have to be set up from scratch. The result is the same however
// the month is reached: stepping through months, jumping years, or reopening the app.
export const loadMonthState = (month: MonthKey): MonthState => ({
    items: loadMonthItems(month),
    income: loadMonthIncome(month) ?? inheritFromNearestMonth(month, loadMonthIncome) ?? 0,
    groups:
        loadMonthGroups(month) ??
        inheritFromNearestMonth(month, loadMonthGroups) ??
        getDefaultGroups(),
});

export const loadCurrency = (): CurrencyType => {
    const saved = localStorage.getItem(STORAGE_KEYS.currency);
    return saved !== null && saved in currencies ? (saved as CurrencyType) : "ZAR";
};

export const loadDarkMode = (): boolean => readJSON<boolean>(STORAGE_KEYS.darkMode) ?? true;

// Everything the app needs on startup
export const loadAppState = () => {
    const month = loadCurrentMonth();
    return {
        isFirstVisit: localStorage.getItem(STORAGE_KEYS.visited) === null,
        darkMode: loadDarkMode(),
        currency: loadCurrency(),
        month,
        monthHasData: hasMonthData(month),
        ...loadMonthState(month),
    };
};
