// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultGroups } from "./groupUtils";
import {
    hasMonthData,
    listStoredMonths,
    loadAppState,
    loadCurrentMonth,
    loadMonthState,
    saveMonthGroups,
    saveMonthIncome,
    saveMonthItems,
} from "./storage";

const item = { id: "1", description: "Rent", amount: 14500, checked: false };
const groups = [{ id: "g1", name: "Bills", isCollapsed: false }];

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("loadMonthState", () => {
    it("returns what is stored for the month", () => {
        saveMonthItems("2026-10", [item]);
        saveMonthIncome("2026-10", 42000);
        saveMonthGroups("2026-10", groups);

        saveMonthIncome("2026-09", 1);
        expect(loadMonthState("2026-10")).toEqual({ items: [item], income: 42000, groups });
    });

    it("starts a new month empty, inheriting from the closest earlier month", () => {
        const olderGroups = [{ id: "g0", name: "Old" }];
        saveMonthIncome("2026-03", 30000);
        saveMonthGroups("2026-03", olderGroups);
        saveMonthIncome("2026-09", 42000);
        saveMonthGroups("2026-09", groups);
        saveMonthIncome("2027-01", 50000);

        expect(loadMonthState("2026-12")).toEqual({ items: [], income: 42000, groups });
    });

    it("inherits income and groups separately, skipping months without them", () => {
        saveMonthIncome("2026-08", 40000);
        saveMonthGroups("2026-08", groups);
        saveMonthItems("2026-09", [item]); // e.g. copied into, but never opened

        expect(loadMonthState("2026-10")).toMatchObject({ income: 40000, groups });
        expect(loadMonthState("2026-09")).toEqual({ items: [item], income: 40000, groups });
    });

    it("inherits from the closest later month when nothing is earlier", () => {
        saveMonthIncome("2026-10", 42000);
        saveMonthIncome("2026-12", 50000);
        expect(loadMonthState("2025-06").income).toBe(42000);
    });

    it("keeps a stored income of 0 rather than inheriting one", () => {
        saveMonthIncome("2026-10", 42000);
        saveMonthIncome("2026-11", 0);
        expect(loadMonthState("2026-11").income).toBe(0);
    });

    it("falls back to no income and the default groups with nothing to inherit", () => {
        expect(loadMonthState("2026-11")).toEqual({ items: [], income: 0, groups: getDefaultGroups() });
    });
});

describe("hasMonthData", () => {
    it("is true once any part of the month has been saved", () => {
        expect(hasMonthData("2026-10")).toBe(false);
        saveMonthIncome("2026-10", 0);
        expect(hasMonthData("2026-10")).toBe(true);
    });
});

describe("listStoredMonths", () => {
    it("lists months with any data, oldest first, ignoring other keys", () => {
        saveMonthIncome("2026-10", 1);
        saveMonthItems("2025-12", []);
        saveMonthGroups("2026-10", groups);
        localStorage.setItem("budgetAppLegacyBackup", "{}");
        localStorage.setItem("budgetAppItems-October", "[]");
        localStorage.setItem("budgetAppCurrency", "ZAR");

        expect(listStoredMonths()).toEqual(["2025-12", "2026-10"]);
    });
});

describe("loadCurrentMonth", () => {
    it("falls back to this calendar month when nothing valid is saved", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 6));

        expect(loadCurrentMonth()).toBe("2026-10");
        localStorage.setItem("budgetAppCurrentMonth", "Oktober");
        expect(loadCurrentMonth()).toBe("2026-10");
        localStorage.setItem("budgetAppCurrentMonth", "2025-03");
        expect(loadCurrentMonth()).toBe("2025-03");
    });
});

describe("loadAppState", () => {
    it("gives a first-time visitor sensible defaults, including the default groups", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 6));

        expect(loadAppState()).toEqual({
            isFirstVisit: true,
            darkMode: true,
            currency: "ZAR",
            month: "2026-10",
            monthHasData: false,
            items: [],
            income: 0,
            groups: getDefaultGroups(),
        });
    });

    it("ignores an unknown saved currency", () => {
        localStorage.setItem("budgetAppCurrency", "XYZ");
        expect(loadAppState().currency).toBe("ZAR");
    });
});
