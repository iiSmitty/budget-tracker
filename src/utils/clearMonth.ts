import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { pluralise } from "./utils";
import { MonthKey, formatMonth } from "./months";

// Snapshot of a "clear month" action, kept so it can be undone
export interface ClearedMonth {
    month: MonthKey;
    removedItems: BudgetItemType[];
    clearedAt: number;
}

// Split a month's items into those that survive a clear and those that are removed.
// Expenses are always removed; additional income only when explicitly requested.
export const partitionItemsForClear = (
    items: BudgetItemType[],
    includeIncome: boolean
): { kept: BudgetItemType[]; removed: BudgetItemType[] } => {
    const kept: BudgetItemType[] = [];
    const removed: BudgetItemType[] = [];

    items.forEach((item) => {
        if (item.isIncome && !includeIncome) {
            kept.push(item);
        } else {
            removed.push(item);
        }
    });

    return { kept, removed };
};

// Human summary of a clear, e.g. "Cleared 10 expenses from October 2026"
export const describeClear = ({ month, removedItems }: ClearedMonth): string => {
    const includesIncome = removedItems.some((item) => item.isIncome);
    const noun = includesIncome ? "item" : "expense";
    return `Cleared ${pluralise(removedItems.length, noun)} from ${formatMonth(month)}`;
};

// Merge cleared items back into a month without discarding anything added since the clear.
// Items whose group was deleted in the meantime fall back to "Ungrouped".
export const restoreClearedItems = (
    currentItems: BudgetItemType[],
    removedItems: BudgetItemType[],
    groups: ExpenseGroup[]
): BudgetItemType[] => {
    const groupIds = new Set(groups.map((group) => group.id));
    const existingIds = new Set(currentItems.map((item) => item.id));

    const restored = removedItems
        .filter((item) => !existingIds.has(item.id))
        .map((item) =>
            item.group && !groupIds.has(item.group)
                ? { ...item, group: undefined }
                : item
        );

    return [...restored, ...currentItems];
};
