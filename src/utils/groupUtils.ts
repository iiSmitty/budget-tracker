import { ExpenseGroup } from "../types/budget";

// Load groups from localStorage for the current month
export const loadGroupsFromStorage = (month: string): ExpenseGroup[] => {
    try {
        const groupsKey = `budgetAppGroups-${month}`;
        const savedGroups = localStorage.getItem(groupsKey);
        console.log(`Loading groups for ${month}:`, savedGroups);
        return savedGroups ? JSON.parse(savedGroups) : [];
    } catch (error) {
        console.error("Error loading groups from localStorage:", error);
        return [];
    }
};

// Save groups to localStorage for the current month
export const saveGroupsToStorage = (month: string, groups: ExpenseGroup[]): void => {
    try {
        const groupsKey = `budgetAppGroups-${month}`;
        console.log(`Saving groups for ${month}:`, groups); // Debug log
        localStorage.setItem(groupsKey, JSON.stringify(groups));
    } catch (error) {
        console.error("Error saving groups to localStorage:", error);
    }
};

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
export const removeGroupFromItems = (items: any[], deletedGroupId: string) => {
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

// Migrate existing data to include groups (for existing users)
export const migrateToGroupedData = (month: string): void => {
    const groupsKey = `budgetAppGroups-${month}`;
    const existingGroups = localStorage.getItem(groupsKey);

    // Only create default groups if none exist
    if (!existingGroups) {
        const defaultGroups = getDefaultGroups();
        saveGroupsToStorage(month, defaultGroups);
    }
};

// Update data backup functions to include groups
export const exportBudgetDataWithGroups = () => {
    const allMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const exportData = {
        darkMode: JSON.parse(localStorage.getItem("budgetAppDarkMode") || "false"),
        currentMonth: localStorage.getItem("budgetAppCurrentMonth"),
        visited: localStorage.getItem("budgetAppVisited") === "true",
        currency: localStorage.getItem("budgetAppCurrency") || "ZAR",
        months: {} as any,
    };

    allMonths.forEach((month) => {
        const itemsKey = `budgetAppItems-${month}`;
        const incomeKey = `budgetAppIncome-${month}`;
        const groupsKey = `budgetAppGroups-${month}`;

        const items = localStorage.getItem(itemsKey);
        const income = localStorage.getItem(incomeKey);
        const groups = localStorage.getItem(groupsKey);

        if (items || income || groups) {
            exportData.months[month] = {
                items: items ? JSON.parse(items) : [],
                income: income ? JSON.parse(income) : 0,
                groups: groups ? JSON.parse(groups) : [], // Include groups in export
            };
        }
    });

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date().toISOString().split("T")[0];
    const filename = `budget-tracker-backup-${date}.json`;

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
};

// Import function that supports groups
export const importBudgetDataWithGroups = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                if (!event.target?.result) {
                    throw new Error("Failed to read file");
                }

                const importData = JSON.parse(event.target.result as string);

                if (!importData.months || typeof importData.months !== "object") {
                    throw new Error("Invalid backup file format");
                }

                // Save preferences
                if (importData.darkMode !== undefined) {
                    localStorage.setItem("budgetAppDarkMode", JSON.stringify(importData.darkMode));
                }

                if (importData.currentMonth) {
                    localStorage.setItem("budgetAppCurrentMonth", importData.currentMonth);
                }

                if (importData.visited !== undefined) {
                    localStorage.setItem("budgetAppVisited", importData.visited ? "true" : "false");
                }

                if (importData.currency) {
                    localStorage.setItem("budgetAppCurrency", importData.currency);
                }

                // Save all months data including groups
                Object.keys(importData.months).forEach((month) => {
                    const monthData = importData.months[month];

                    if (monthData.items) {
                        localStorage.setItem(`budgetAppItems-${month}`, JSON.stringify(monthData.items));
                    }

                    if (monthData.income !== undefined) {
                        localStorage.setItem(`budgetAppIncome-${month}`, JSON.stringify(monthData.income));
                    }

                    // Import groups if they exist
                    if (monthData.groups) {
                        localStorage.setItem(`budgetAppGroups-${month}`, JSON.stringify(monthData.groups));
                    }
                });

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