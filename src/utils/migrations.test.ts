// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_SCHEMA_VERSION, migrateStorage } from "./migrations";

const NOW = new Date(2026, 9, 6); // 6 October 2026

const october = [{ id: "1", description: "Rent", amount: 14500, checked: true }];
const november = [{ id: "2", description: "Fuel", amount: 2500, checked: false }];
const groups = [{ id: "g1", name: "Bills", isCollapsed: false }];

// A typical v1 install: month data keyed by name, plus non-month settings
const seedV1 = () => {
    localStorage.setItem("budgetAppItems-October", JSON.stringify(october));
    localStorage.setItem("budgetAppIncome-October", "42000");
    localStorage.setItem("budgetAppGroups-October", JSON.stringify(groups));
    localStorage.setItem("budgetAppItems-November", JSON.stringify(november));
    localStorage.setItem("budgetAppCurrentMonth", "October");
    localStorage.setItem("budgetAppDarkMode", "true");
    localStorage.setItem("budgetAppCurrency", "EUR");
    localStorage.setItem("budgetAppVisited", "true");
};

const storageSnapshot = () =>
    Object.fromEntries(
        Array.from({ length: localStorage.length }, (_, index) => {
            const key = localStorage.key(index)!;
            return [key, localStorage.getItem(key)];
        })
    );

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("migrateStorage from v1", () => {
    it("moves every month to the current year and removes the old keys", () => {
        seedV1();
        migrateStorage(NOW);

        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-10")!)).toEqual(october);
        expect(localStorage.getItem("budgetAppIncome-2026-10")).toBe("42000");
        expect(JSON.parse(localStorage.getItem("budgetAppGroups-2026-10")!)).toEqual(groups);
        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-11")!)).toEqual(november);

        expect(localStorage.getItem("budgetAppItems-October")).toBeNull();
        expect(localStorage.getItem("budgetAppIncome-October")).toBeNull();
        expect(localStorage.getItem("budgetAppGroups-October")).toBeNull();
        expect(localStorage.getItem("budgetAppItems-November")).toBeNull();
    });

    it("points the last viewed month at its new key", () => {
        seedV1();
        migrateStorage(NOW);
        expect(localStorage.getItem("budgetAppCurrentMonth")).toBe("2026-10");
    });

    it("leaves settings alone", () => {
        seedV1();
        migrateStorage(NOW);
        expect(localStorage.getItem("budgetAppDarkMode")).toBe("true");
        expect(localStorage.getItem("budgetAppCurrency")).toBe("EUR");
        expect(localStorage.getItem("budgetAppVisited")).toBe("true");
    });

    it("keeps the untouched v1 data as a backup", () => {
        seedV1();
        migrateStorage(NOW);

        const backup = JSON.parse(localStorage.getItem("budgetAppLegacyBackup")!);
        expect(backup.assignedYear).toBe(2026);
        expect(backup.entries).toEqual({
            "budgetAppItems-October": JSON.stringify(october),
            "budgetAppIncome-October": "42000",
            "budgetAppGroups-October": JSON.stringify(groups),
            "budgetAppItems-November": JSON.stringify(november),
        });
    });

    it("records the schema version", () => {
        seedV1();
        migrateStorage(NOW);
        expect(localStorage.getItem("budgetAppSchemaVersion")).toBe(String(CURRENT_SCHEMA_VERSION));
    });

    it("is a no-op the second time", () => {
        seedV1();
        migrateStorage(NOW);
        const afterFirstRun = storageSnapshot();

        migrateStorage(new Date(2027, 5, 1));
        expect(storageSnapshot()).toEqual(afterFirstRun);
    });

    it("never overwrites year-keyed data left by an interrupted run", () => {
        seedV1();
        const newer = [{ id: "3", description: "Edited after a partial migration", amount: 1, checked: false }];
        localStorage.setItem("budgetAppItems-2026-10", JSON.stringify(newer));

        migrateStorage(NOW);

        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-10")!)).toEqual(newer);
        expect(localStorage.getItem("budgetAppItems-October")).toBeNull();
    });

    it("keeps the v1 data and retries next time if writing fails part-way", () => {
        seedV1();
        const realSetItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
            if (key === "budgetAppItems-2026-11") throw new DOMException("Quota exceeded", "QuotaExceededError");
            realSetItem.call(this, key, value);
        });
        vi.spyOn(console, "error").mockImplementation(() => {});

        migrateStorage(NOW);

        expect(localStorage.getItem("budgetAppSchemaVersion")).toBeNull();
        expect(localStorage.getItem("budgetAppItems-October")).not.toBeNull();
        expect(localStorage.getItem("budgetAppItems-November")).not.toBeNull();

        vi.mocked(Storage.prototype.setItem).mockRestore();
        migrateStorage(NOW);

        expect(localStorage.getItem("budgetAppSchemaVersion")).toBe(String(CURRENT_SCHEMA_VERSION));
        expect(JSON.parse(localStorage.getItem("budgetAppItems-2026-11")!)).toEqual(november);
        expect(localStorage.getItem("budgetAppItems-November")).toBeNull();
    });
});

describe("migrateStorage on a fresh install", () => {
    it("just records the schema version", () => {
        migrateStorage(NOW);
        expect(storageSnapshot()).toEqual({ budgetAppSchemaVersion: String(CURRENT_SCHEMA_VERSION) });
    });
});
