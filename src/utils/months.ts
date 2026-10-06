// A calendar month as "YYYY-MM" (e.g. "2026-10"). As a string it sorts chronologically,
// which keeps storage keys, ranges and comparisons simple.
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Version 1 of the app stored months by English name only, so every year shared one set of months
export const LEGACY_MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export const isMonthKey = (value: unknown): value is MonthKey =>
    typeof value === "string" && MONTH_KEY_PATTERN.test(value);

// monthIndex is 0-based like Date's; out-of-range values roll over into neighbouring years
export const toMonthKey = (year: number, monthIndex: number): MonthKey => {
    const date = new Date(year, monthIndex, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const parseMonthKey = (month: MonthKey): { year: number; monthIndex: number } => {
    const [year, monthNumber] = month.split("-").map(Number);
    return { year, monthIndex: monthNumber - 1 };
};

export const getCurrentMonthKey = (now: Date = new Date()): MonthKey =>
    toMonthKey(now.getFullYear(), now.getMonth());

export const addMonths = (month: MonthKey, count: number): MonthKey => {
    const { year, monthIndex } = parseMonthKey(month);
    return toMonthKey(year, monthIndex + count);
};

export const getYear = (month: MonthKey): number => parseMonthKey(month).year;

// "October 2026", or "October" with { includeYear: false }
export const formatMonth = (
    month: MonthKey,
    { includeYear = true }: { includeYear?: boolean } = {}
): string => {
    const { year, monthIndex } = parseMonthKey(month);
    return new Date(year, monthIndex, 1).toLocaleString("en", {
        month: "long",
        ...(includeYear ? { year: "numeric" } : {}),
    });
};

// Every month from `from` to `to`, inclusive and in order
export const getMonthRange = (from: MonthKey, to: MonthKey): MonthKey[] => {
    const months: MonthKey[] = [];
    for (let month = from; month <= to; month = addMonths(month, 1)) {
        months.push(month);
    }
    return months;
};

// Months offered for navigation: a year either side of today, widened to take in every month
// that has data and the months either side of the one being viewed, so nothing is unreachable
export const getSelectableMonths = (
    storedMonths: MonthKey[],
    viewing: MonthKey,
    now: Date = new Date()
): MonthKey[] => {
    const today = getCurrentMonthKey(now);
    const bounds = [
        addMonths(today, -12),
        addMonths(today, 12),
        addMonths(viewing, -1),
        addMonths(viewing, 1),
        ...storedMonths,
    ].sort();
    return getMonthRange(bounds[0], bounds[bounds.length - 1]);
};

// Maps a version 1 month name ("October") onto a year; null if it isn't a month name
export const legacyMonthNameToKey = (name: string, year: number): MonthKey | null => {
    const monthIndex = LEGACY_MONTH_NAMES.indexOf(name as (typeof LEGACY_MONTH_NAMES)[number]);
    return monthIndex === -1 ? null : toMonthKey(year, monthIndex);
};
