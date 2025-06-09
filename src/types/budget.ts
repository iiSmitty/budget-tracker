// Budget item interface with group support
export interface BudgetItemType {
    id: string;
    description: string;
    amount: number;
    checked: boolean;
    category?: string;
    group?: string;
}

// Expense group interface
export interface ExpenseGroup {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    isCollapsed?: boolean;
}

// Export data interface updated for groups
export interface ExportData {
    darkMode: boolean;
    currentMonth: string | null;
    visited: boolean;
    currency: string;
    months: {
        [month: string]: {
            items: BudgetItemType[];
            income: number;
            groups: ExpenseGroup[];
        };
    };
}