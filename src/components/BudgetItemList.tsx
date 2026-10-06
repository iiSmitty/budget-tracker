import BudgetItem from "./BudgetItem";
import Button from "./ui/Button";
import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { CurrencyType } from "../utils/utils";

interface BudgetItemListProps {
    items: BudgetItemType[];
    groups: ExpenseGroup[];
    onToggleChecked: (id: string) => void;
    onEditItem: (id: string, description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onDeleteItem: (id: string) => void;
    formatCurrency: (amount: number) => string;
    onAddFirstExpense: () => void;
    currency: CurrencyType;
    onUpdateGroupCollapse: (groupId: string, isCollapsed: boolean) => void;
    onMoveToGroup?: (itemId: string, groupId: string) => void;
}

const BudgetItemList = ({
                            items,
                            groups,
                            onToggleChecked,
                            onEditItem,
                            onDeleteItem,
                            formatCurrency,
                            onAddFirstExpense,
                            currency,
                            onUpdateGroupCollapse,
                            onMoveToGroup,
                        }: BudgetItemListProps) => {


    // Separate income and expense items
    const incomeItems = items.filter(item => item.isIncome);
    const expenseItems = items.filter(item => !item.isIncome);

    // Group only expense items by their group property
    const groupedExpenses = expenseItems.reduce((acc, item) => {
        const groupKey = item.group || "ungrouped";
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {} as Record<string, BudgetItemType[]>);

    // Sort items within each group by amount (highest first)
    Object.keys(groupedExpenses).forEach(groupKey => {
        groupedExpenses[groupKey].sort((a, b) => b.amount - a.amount);
    });

    // Sort income items by amount (highest first)
    incomeItems.sort((a, b) => b.amount - a.amount);

    // Calculate group totals for expenses only
    const getGroupTotal = (groupItems: BudgetItemType[]): number => {
        return groupItems.reduce((sum, item) => sum + item.amount, 0);
    };

    const toggleGroupCollapse = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (group) {
            onUpdateGroupCollapse(groupId, !group.isCollapsed);
        }
    };

    const getGroupName = (groupKey: string) => {
        if (groupKey === "ungrouped") return "Ungrouped";
        const group = groups.find(g => g.id === groupKey);
        return group?.name || "Unknown Group";
    };

    const isGroupCollapsed = (groupKey: string) => {
        if (groupKey === "ungrouped") return false; // Ungrouped is never collapsed
        const group = groups.find(g => g.id === groupKey);
        return group?.isCollapsed || false;
    };

    const getGroupIcon = (groupKey: string) => {
        if (groupKey === "ungrouped") return "📋";
        return "📁";
    };



    const handleMoveToGroup = (itemId: string, groupId: string) => {
        if (onMoveToGroup) {
            onMoveToGroup(itemId, groupId);
        }
    };

    const getGroupProgress = (groupItems: BudgetItemType[]) => {
        const total = groupItems.length;
        const checked = groupItems.filter(item => item.checked).length;
        return total > 0 ? (checked / total) * 100 : 0;
    };

    const renderEmptyState = (icon: string, title: string, body: string, action: string) => (
        <div className="rounded-xl overflow-hidden border border-border">
            <div className="p-8 text-center">
                <div className="text-6xl mb-4" aria-hidden="true">{icon}</div>
                <p className="text-xl mb-2 text-fg-muted">{title}</p>
                <p className="text-sm mb-6 text-fg-subtle">{body}</p>
                <Button variant="primary" size="lg" onClick={onAddFirstExpense} className="shadow-lg">
                    {action}
                </Button>
            </div>
        </div>
    );

    if (items.length === 0) {
        return renderEmptyState(
            "💰",
            "No items added yet",
            "Start tracking your expenses and income to get a clear view of your budget",
            "+ Add Your First Item"
        );
    }

    // Sort expense groups: ungrouped last, others alphabetically
    const sortedGroupEntries = Object.entries(groupedExpenses).sort(([a], [b]) => {
        if (a === "ungrouped") return 1;
        if (b === "ungrouped") return -1;
        return getGroupName(a).localeCompare(getGroupName(b));
    });

    return (
        <>
            {/* Income Section - Always at top if income exists */}
            {incomeItems.length > 0 && (
                <div className="rounded-xl overflow-hidden mb-4 border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
                    {/* Income Header */}
                    <div className="p-4 bg-green-100 dark:bg-green-900/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl" aria-hidden="true">💰</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                                        Additional Income
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-fg-muted">
                                        <span>{incomeItems.length} item{incomeItems.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-green-800 dark:text-green-300">
                                +{formatCurrency(incomeItems.reduce((sum, item) => sum + item.amount, 0))}
                            </div>
                        </div>
                    </div>

                    {/* Income Items */}
                    <div className="divide-y divide-green-200 dark:divide-green-700">
                        {incomeItems.map((item) => (
                            <div
                                key={item.id}
                                className={`transition-colors duration-200 hover:bg-green-100/60 dark:hover:bg-green-800/30 ${
                                    item.checked ? "opacity-60 bg-green-100 dark:bg-green-800/20" : ""
                                }`}
                            >
                                <BudgetItem
                                    item={item}
                                    onToggleChecked={onToggleChecked}
                                    onEdit={onEditItem}
                                    onDelete={onDeleteItem}
                                    formatCurrency={formatCurrency}
                                    currency={currency}
                                    groups={groups}
                                    isUngrouped={true} // Income items are always "ungrouped"
                                    onMoveToGroup={handleMoveToGroup}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expenses Section */}
            {expenseItems.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-border">
                    {sortedGroupEntries.map(([groupKey, groupItems], groupIndex) => {
                        const groupTotal = getGroupTotal(groupItems);
                        const groupName = getGroupName(groupKey);
                        const collapsed = isGroupCollapsed(groupKey);
                        const isLastGroup = groupIndex === sortedGroupEntries.length - 1;
                        const groupIcon = getGroupIcon(groupKey);
                        const progress = getGroupProgress(groupItems);
                        const isUngrouped = groupKey === "ungrouped";

                        const headerContent = (
                            <span className="flex items-center justify-between">
                                <span className="flex items-center gap-3">
                                    {!isUngrouped && (
                                        <span
                                            className={`transform transition-transform duration-200 text-fg-subtle ${
                                                collapsed ? "rotate-0" : "rotate-90"
                                            }`}
                                            aria-hidden="true"
                                        >
                                            ▶
                                        </span>
                                    )}

                                    <span className="flex items-center gap-2">
                                        <span className="text-xl" aria-hidden="true">{groupIcon}</span>
                                        <span className="block">
                                            <span className="block text-lg font-semibold">{groupName}</span>
                                            <span className="flex items-center gap-3 text-sm text-fg-muted">
                                                <span>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</span>
                                            </span>
                                        </span>
                                    </span>
                                </span>

                                <span className="block text-right">
                                    <span className="flex items-center gap-2 justify-end">
                                        {/* Progress indicator - only for grouped items */}
                                        {progress > 0 && !isUngrouped && (
                                            <span className="block relative w-6 h-6" aria-hidden="true">
                                                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                                                    {/* Background circle */}
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        className="text-border-strong"
                                                    />
                                                    {/* Progress circle */}
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="62.83"
                                                        strokeDashoffset={62.83 - (progress / 100) * 62.83}
                                                        className={progress === 100 ? "text-green-500" : "text-blue-500"}
                                                        style={{
                                                            transition: 'stroke-dashoffset 0.3s ease-in-out'
                                                        }}
                                                    />
                                                </svg>

                                                {/* Small checkmark when 100% complete */}
                                                {progress === 100 && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-green-500 text-xs font-bold">✓</span>
                                                    </span>
                                                )}
                                            </span>
                                        )}

                                        {/* Simple group total */}
                                        <span className="block text-lg font-bold">{formatCurrency(groupTotal)}</span>
                                    </span>
                                </span>
                            </span>
                        );

                        return (
                            <div key={groupKey} className={!isLastGroup ? "border-b-2 border-border" : ""}>
                                {/* Group Header - a real button when it can collapse, so it works from the keyboard */}
                                <h3>
                                    {isUngrouped ? (
                                        <span className="block p-4 bg-surface-muted">{headerContent}</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => toggleGroupCollapse(groupKey)}
                                            aria-expanded={!collapsed}
                                            className="block w-full text-left p-4 bg-surface-muted hover:bg-surface-hover transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                                        >
                                            {headerContent}
                                        </button>
                                    )}
                                </h3>

                                {/* Group Items */}
                                {!collapsed && (
                                    <div className="divide-y divide-border">
                                        {groupItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`transition-colors duration-200 hover:bg-surface-muted/50 ${
                                                    item.checked ? "opacity-60 bg-surface-muted/30" : ""
                                                }`}
                                            >
                                                <BudgetItem
                                                    item={item}
                                                    onToggleChecked={onToggleChecked}
                                                    onEdit={onEditItem}
                                                    onDelete={onDeleteItem}
                                                    formatCurrency={formatCurrency}
                                                    currency={currency}
                                                    groups={groups}
                                                    isUngrouped={isUngrouped}
                                                    onMoveToGroup={handleMoveToGroup}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Collapsed indicator */}
                                {collapsed && groupItems.length > 0 && (
                                    <div className="px-4 py-2 text-center border-t border-border bg-surface-muted/40 text-fg-subtle">
                                        <span className="text-sm">
                                            {groupItems.length} item{groupItems.length !== 1 ? 's' : ''} hidden • Click to expand
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state for no expenses when income exists */}
            {expenseItems.length === 0 && incomeItems.length > 0 &&
                renderEmptyState(
                    "📋",
                    "No expenses added yet",
                    "Add your first expense to start tracking your spending",
                    "+ Add Your First Expense"
                )}
        </>
    );
};

export default BudgetItemList;
