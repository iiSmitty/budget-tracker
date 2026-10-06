import { BudgetItemType, ExpenseGroup } from "../types/budget";

interface MonthContents {
    items: BudgetItemType[];
    groups: ExpenseGroup[];
}

const newId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);
const newGroupId = () => `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Adds a copy of the source month's items and groups to the target month.
 * - Existing target items are kept; copies get new ids and start unpaid
 * - Groups are matched by name, so copying twice doesn't duplicate them
 */
export const copyMonthContents = (source: MonthContents, target: MonthContents): MonthContents => {
    // Map each source group onto the target's group of the same name, or a new copy of it
    const groupIdMapping: Record<string, string> = {};
    const copiedGroups: ExpenseGroup[] = [];

    source.groups.forEach((group) => {
        const existingGroup = target.groups.find((targetGroup) => targetGroup.name === group.name);
        if (existingGroup) {
            groupIdMapping[group.id] = existingGroup.id;
        } else {
            const id = newGroupId();
            groupIdMapping[group.id] = id;
            copiedGroups.push({ ...group, id, isCollapsed: false });
        }
    });

    const copiedItems = source.items.map((item) => ({
        ...item,
        id: newId(),
        checked: false,
        group: item.group ? groupIdMapping[item.group] ?? item.group : item.group,
    }));

    return {
        items: [...target.items, ...copiedItems],
        groups: [...target.groups, ...copiedGroups],
    };
};
