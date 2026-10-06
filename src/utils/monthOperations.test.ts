import { describe, expect, it } from "vitest";
import { describeClear, partitionItemsForClear, restoreClearedItems } from "./clearMonth";
import { copyMonthContents } from "./copyMonth";

const rent = { id: "1", description: "Rent", amount: 14500, checked: true, group: "bills" };
const fuel = { id: "2", description: "Fuel", amount: 2500, checked: false, group: "transport" };
const freelance = { id: "3", description: "Freelance", amount: 3500, checked: false, isIncome: true };

describe("clear month", () => {
    it("removes expenses but keeps additional income unless asked", () => {
        expect(partitionItemsForClear([rent, fuel, freelance], false)).toEqual({
            kept: [freelance],
            removed: [rent, fuel],
        });
        expect(partitionItemsForClear([rent, freelance], true).removed).toEqual([rent, freelance]);
    });

    it("restores cleared items alongside anything added since, without duplicates", () => {
        const added = { id: "4", description: "Gym", amount: 650, checked: false };
        const groups = [
            { id: "bills", name: "Bills" },
            { id: "transport", name: "Transport" },
        ];

        expect(restoreClearedItems([added, rent], [rent, fuel], groups)).toEqual([fuel, added, rent]);
    });

    it("ungroups restored items whose group was deleted in the meantime", () => {
        const restored = restoreClearedItems([], [fuel], [{ id: "bills", name: "Bills" }]);
        expect(restored[0].group).toBeUndefined();
    });

    it("describes the clear with the month and year", () => {
        expect(describeClear({ month: "2026-10", removedItems: [rent, fuel], clearedAt: 0 })).toBe(
            "Cleared 2 expenses from October 2026"
        );
        expect(describeClear({ month: "2026-10", removedItems: [freelance], clearedAt: 0 })).toBe(
            "Cleared 1 item from October 2026"
        );
    });
});

describe("copyMonthContents", () => {
    const source = {
        items: [rent, fuel],
        groups: [
            { id: "bills", name: "Bills" },
            { id: "transport", name: "Transport" },
        ],
    };

    it("adds unpaid copies with new ids and keeps the target's items", () => {
        const existing = { id: "9", description: "Gym", amount: 650, checked: true };
        const result = copyMonthContents(source, { items: [existing], groups: [] });

        expect(result.items[0]).toBe(existing);
        expect(result.items.slice(1).map((item) => item.description)).toEqual(["Rent", "Fuel"]);
        expect(result.items.slice(1).every((item) => !item.checked)).toBe(true);
        expect(result.items.slice(1).map((item) => item.id)).not.toContain("1");
    });

    it("reuses the target's groups by name instead of duplicating them", () => {
        const targetBills = { id: "bills-in-target", name: "Bills" };
        const result = copyMonthContents(source, { items: [], groups: [targetBills] });

        expect(result.groups.map((group) => group.name)).toEqual(["Bills", "Transport"]);
        expect(result.groups[0]).toBe(targetBills);

        const [copiedRent, copiedFuel] = result.items;
        expect(copiedRent.group).toBe("bills-in-target");
        expect(copiedFuel.group).toBe(result.groups[1].id);
        expect(result.groups[1].id).not.toBe("transport");
    });
});
