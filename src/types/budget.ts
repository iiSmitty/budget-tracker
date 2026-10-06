// Budget item interface
export interface BudgetItemType {
    id: string;
    description: string;
    amount: number;
    checked: boolean;
    category?: string;
    group?: string;
    isIncome?: boolean;
}

// Expense group interface
export interface ExpenseGroup {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    isCollapsed?: boolean;
}

// One month's data in a backup file
export interface MonthBackup {
    items: BudgetItemType[];
    income: number;
    groups: ExpenseGroup[];
}

// Backup file format. Version 1 files have no `version` and key months by name ("October");
// version 2 keys them by "YYYY-MM".
export interface ExportData {
    version: 2;
    exportedAt: string;
    darkMode: boolean;
    currentMonth: string | null;
    visited: boolean;
    currency: string;
    months: {
        [month: string]: MonthBackup;
    };
}