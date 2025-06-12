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

// Export data interface
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