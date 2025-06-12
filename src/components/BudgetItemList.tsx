import BudgetItem from "./BudgetItem";
import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { CurrencyType } from "../utils/utils";

interface BudgetItemListProps {
    items: BudgetItemType[];
    groups: ExpenseGroup[];
    darkMode: boolean;
    onToggleChecked: (id: string) => void;
    onEditItem: (id: string, description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onDeleteItem: (id: string) => void;
    formatCurrency: (amount: number) => string;
    getCategoryColor: (amount: number, darkMode: boolean) => string;
    onAddFirstExpense: () => void;
    currency: CurrencyType;
    onUpdateGroupCollapse: (groupId: string, isCollapsed: boolean) => void;
    onMoveToGroup?: (itemId: string, groupId: string) => void;
}

const BudgetItemList = ({
                            items,
                            groups,
                            darkMode,
                            onToggleChecked,
                            onEditItem,
                            onDeleteItem,
                            formatCurrency,
                            getCategoryColor,
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

    if (items.length === 0) {
        return (
            <div className={`rounded-xl overflow-hidden ${
                darkMode ? "bg-gray-700/50" : "bg-white shadow"
            }`}>
                <div className="p-8 text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <p className="text-xl mb-2 opacity-70">No items added yet</p>
                    <p className="text-sm mb-6 opacity-50">Start tracking your expenses and income to get a clear view of your budget</p>
                    <button
                        onClick={onAddFirstExpense}
                        className={`px-6 py-3 rounded-lg font-medium transition shadow-lg ${
                            darkMode
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        }`}
                    >
                        + Add Your First Item
                    </button>
                </div>
            </div>
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
                <div className={`rounded-xl overflow-hidden mb-4 ${
                    darkMode ? "bg-green-900/20 border border-green-700" : "bg-green-50 border border-green-200"
                }`}>
                    {/* Income Header */}
                    <div className={`p-4 ${
                        darkMode ? "bg-green-900/40" : "bg-green-100"
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">💰</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                                        Additional Income
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm opacity-70">
                                        <span>{incomeItems.length} item{incomeItems.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                +{formatCurrency(incomeItems.reduce((sum, item) => sum + item.amount, 0))}
                            </div>
                        </div>
                    </div>

                    {/* Income Items */}
                    <div className="divide-y divide-green-200 dark:divide-green-700">
                        {incomeItems.map((item) => (
                            <div
                                key={item.id}
                                className={`transition-all duration-200 ${
                                    darkMode
                                        ? "hover:bg-green-800/30"
                                        : "hover:bg-green-50"
                                } ${
                                    item.checked
                                        ? darkMode
                                            ? "opacity-60 bg-green-800/20"
                                            : "opacity-60 bg-green-100"
                                        : ""
                                }`}
                            >
                                <BudgetItem
                                    item={item}
                                    darkMode={darkMode}
                                    onToggleChecked={onToggleChecked}
                                    onEdit={(id, description, amount, group, isIncome) => onEditItem(id, description, amount, group, isIncome)}
                                    onDelete={onDeleteItem}
                                    formatCurrency={formatCurrency}
                                    getCategoryColor={getCategoryColor}
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
                <div className={`rounded-xl overflow-hidden ${
                    darkMode ? "bg-gray-700/50" : "bg-white shadow"
                }`}>
                    {sortedGroupEntries.map(([groupKey, groupItems], groupIndex) => {
                        const groupTotal = getGroupTotal(groupItems);
                        const groupName = getGroupName(groupKey);
                        const collapsed = isGroupCollapsed(groupKey);
                        const isLastGroup = groupIndex === sortedGroupEntries.length - 1;
                        const groupIcon = getGroupIcon(groupKey);
                        const progress = getGroupProgress(groupItems);
                        const isUngrouped = groupKey === "ungrouped";

                        return (
                            <div key={groupKey} className={`${!isLastGroup ? 'border-b-2' : ''} ${
                                darkMode ? 'border-gray-600' : 'border-gray-200'
                            }`}>
                                {/* Group Header */}
                                <div
                                    className={`p-4 transition-all duration-200 ${
                                        !isUngrouped ? "cursor-pointer" : ""
                                    } ${
                                        darkMode
                                            ? "bg-gray-600 hover:bg-gray-550"
                                            : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                                    onClick={!isUngrouped ? () => toggleGroupCollapse(groupKey) : undefined}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {!isUngrouped && (
                                                <span className={`transform transition-transform duration-200 text-gray-400 ${
                                                    collapsed ? "rotate-0" : "rotate-90"
                                                }`}>
                                                    ▶
                                                </span>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{groupIcon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{groupName}</h3>
                                                    <div className="flex items-center gap-3 text-sm opacity-70">
                                                        <span>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                {/* Progress indicator - only for grouped items */}
                                                {progress > 0 && !isUngrouped && (
                                                    <div className="relative w-6 h-6">
                                                        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                                                            {/* Background circle */}
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                fill="none"
                                                                className={darkMode ? "text-gray-600" : "text-gray-300"}
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
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-green-500 text-xs font-bold">✓</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Simple group total */}
                                                <div className="text-lg font-bold">{formatCurrency(groupTotal)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Group Items */}
                                {!collapsed && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {groupItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`transition-all duration-200 ${
                                                    darkMode
                                                        ? "hover:bg-gray-700"
                                                        : "hover:bg-gray-50"
                                                } ${
                                                    item.checked
                                                        ? darkMode
                                                            ? "opacity-60 bg-gray-800"
                                                            : "opacity-60 bg-gray-50"
                                                        : ""
                                                }`}
                                            >
                                                <BudgetItem
                                                    item={item}
                                                    darkMode={darkMode}
                                                    onToggleChecked={onToggleChecked}
                                                    onEdit={(id, description, amount, group, isIncome) => onEditItem(id, description, amount, group, isIncome)}
                                                    onDelete={onDeleteItem}
                                                    formatCurrency={formatCurrency}
                                                    getCategoryColor={getCategoryColor}
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
                                    <div className={`px-4 py-2 text-center border-t ${
                                        darkMode
                                            ? "bg-gray-750 border-gray-600 text-gray-400"
                                            : "bg-gray-50 border-gray-200 text-gray-500"
                                    }`}>
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
            {expenseItems.length === 0 && incomeItems.length > 0 && (
                <div className={`rounded-xl overflow-hidden ${
                    darkMode ? "bg-gray-700/50" : "bg-white shadow"
                }`}>
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-xl mb-2 opacity-70">No expenses added yet</p>
                        <p className="text-sm mb-6 opacity-50">Add your first expense to start tracking your spending</p>
                        <button
                            onClick={onAddFirstExpense}
                            className={`px-6 py-3 rounded-lg font-medium transition shadow-lg ${
                                darkMode
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            }`}
                        >
                            + Add Your First Expense
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BudgetItemList;