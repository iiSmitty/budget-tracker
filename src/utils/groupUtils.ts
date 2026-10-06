import { BudgetItemType, ExpenseGroup } from "../types/budget";

// Create a new expense group
export const createExpenseGroup = (name: string): ExpenseGroup => {
    return {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        isCollapsed: false,
    };
};

// Update group collapse state
export const updateGroupCollapse = (
    groups: ExpenseGroup[],
    groupId: string,
    isCollapsed: boolean
): ExpenseGroup[] => {
    return groups.map(group =>
        group.id === groupId
            ? { ...group, isCollapsed }
            : group
    );
};

// Delete a group and handle items that belong to it
export const deleteExpenseGroup = (
    groups: ExpenseGroup[],
    groupId: string
): ExpenseGroup[] => {
    return groups.filter(group => group.id !== groupId);
};

// Edit group name
export const editExpenseGroup = (
    groups: ExpenseGroup[],
    groupId: string,
    newName: string
): ExpenseGroup[] => {
    return groups.map(group =>
        group.id === groupId
            ? { ...group, name: newName.trim() }
            : group
    );
};

// Remove group assignments from items when a group is deleted
export const removeGroupFromItems = (
    items: BudgetItemType[],
    deletedGroupId: string
): BudgetItemType[] => {
    return items.map(item =>
        item.group === deletedGroupId
            ? { ...item, group: undefined }
            : item
    );
};

// Get default expense groups
export const getDefaultGroups = (): ExpenseGroup[] => [
    {
        id: "group-default-1",
        name: "Enjoying Life",
        isCollapsed: false,
    },
    {
        id: "group-default-2",
        name: "Transport",
        isCollapsed: false,
    },
    {
        id: "group-default-3",
        name: "Bills & Utilities",
        isCollapsed: false,
    },
];

