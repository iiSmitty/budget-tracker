// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { importBudgetData, isBackupDue, parseBackup } from "./dataBackup";

describe("isBackupDue", () => {
    const now = new Date(2026, 9, 6);
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

    it("never nags when there's nothing to back up", () => {
        expect(isBackupDue(null, false, now)).toBe(false);
    });

    it("is due when there's data that has never been backed up", () => {
        expect(isBackupDue(null, true, now)).toBe(true);
    });

    it("is due once the last backup is more than 30 days old", () => {
        expect(isBackupDue(daysAgo(29), true, now)).toBe(false);
        expect(isBackupDue(daysAgo(31), true, now)).toBe(true);
    });
});

const NOW = new Date(2026, 9, 6);
const items = [{ id: "1", description: "Rent", amount: 14500, checked: false }];
const groups = [{ id: "g1", name: "Bills", isCollapsed: false }];

describe("parseBackup", () => {
    it("converts a version 1 backup (months by name) to the current year", () => {
        const parsed = parseBackup(
            {
                darkMode: false,
                currentMonth: "October",
                visited: true,
                currency: "EUR",
                months: {
                    October: { items, income: 42000, groups },
                    December: { items: [], income: 40000, groups: [] },
                },
            },
            NOW
        );

        expect(parsed).toEqual({
            darkMode: false,
            currentMonth: "2026-10",
            visited: true,
            currency: "EUR",
            months: {
                "2026-10": { items, income: 42000, groups },
                "2026-12": { items: [], income: 40000, groups: [] },
            },
        });
    });

    it("reads a version 2 backup as-is", () => {
        const parsed = parseBackup(
            {
                version: 2,
                exportedAt: "2026-10-06T10:00:00.000Z",
                currentMonth: "2025-12",
                currency: "ZAR",
                months: { "2025-12": { items, income: 1, groups } },
            },
            NOW
        );

        expect(parsed.currentMonth).toBe("2025-12");
        expect(parsed.months).toEqual({ "2025-12": { items, income: 1, groups } });
    });

    it("only includes the fields a month actually has, so importing never blanks data", () => {
        const parsed = parseBackup({ months: { October: { income: 5 } } }, NOW);
        expect(parsed.months).toEqual({ "2026-10": { income: 5 } });
    });

    it("defaults an unknown currency to ZAR", () => {
        expect(parseBackup({ currency: "XYZ", months: {} }, NOW).currency).toBe("ZAR");
        expect(parseBackup({ months: {} }, NOW).currency).toBe("ZAR");
    });

    it.each([
        ["not an object", "hello"],
        ["no months", { currency: "ZAR" }],
        ["months as an array", { months: [] }],
        ["an unknown month name", { months: { Oktober: { items: [] } } }],
        ["a v1 name in a v2 file", { version: 2, months: { October: { items: [] } } }],
        ["items that aren't a list", { months: { October: { items: "Rent" } } }],
        ["income that isn't a number", { months: { October: { income: "42000" } } }],
        ["groups that aren't a list", { months: { October: { groups: {} } } }],
        ["a newer format", { version: 3, months: {} }],
    ])("rejects %s", (_, raw) => {
        expect(() => parseBackup(raw, NOW)).toThrow();
    });
});

describe("importBudgetData", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    const fileOf = (content: unknown) =>
        new File([typeof content === "string" ? content : JSON.stringify(content)], "backup.json");

    it("writes a version 1 backup into year-keyed storage", async () => {
        localStorage.setItem("budgetAppItems-2026-03", JSON.stringify(items));

        await importBudgetData(
            fileOf({ currentMonth: "October", currency: "EUR", months: { October: { items, income: 42000, groups } } })
        );

        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-10")!)).toEqual(items);
        expect(localStorage.getItem("budgetAppIncome-2026-10")).toBe("42000");
        expect(localStorage.getItem("budgetAppCurrentMonth")).toBe("2026-10");
        expect(localStorage.getItem("budgetAppCurrency")).toBe("EUR");
        // Months not in the backup are left alone
        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-03")!)).toEqual(items);
    });

    it("writes nothing when any part of the file is invalid", async () => {
        await expect(
            importBudgetData(fileOf({ months: { "2026-10": { items }, "2026-11": { income: "oops" } }, version: 2 }))
        ).rejects.toThrow();
        expect(localStorage.length).toBe(0);
    });

    it("explains when the file isn't JSON", async () => {
        await expect(importBudgetData(fileOf("not json"))).rejects.toThrow(/invalid JSON/);
    });
});
