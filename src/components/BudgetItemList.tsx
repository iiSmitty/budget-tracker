import { useState } from "react";
import ReactDOM from "react-dom";
import BudgetItem from "./BudgetItem";
import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { CurrencyType } from "../utils/utils";

interface BulkMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    ungroupedItems: BudgetItemType[];
    groups: ExpenseGroup[];
    onMoveItems: (itemIds: string[], targetGroupId: string) => void;
    darkMode: boolean;
    formatCurrency: (amount: number) => string;
}

const BulkMoveModal = ({
                           isOpen,
                           onClose,
                           ungroupedItems,
                           groups,
                           onMoveItems,
                           darkMode,
                           formatCurrency,
                       }: BulkMoveModalProps) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [targetGroup, setTargetGroup] = useState<string>("");

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const selectAll = () => {
        setSelectedItems(ungroupedItems.map(item => item.id));
    };

    const selectNone = () => {
        setSelectedItems([]);
    };

    const handleMove = () => {
        if (selectedItems.length > 0 && targetGroup) {
            onMoveItems(selectedItems, targetGroup);
            setSelectedItems([]);
            setTargetGroup("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}>
                {/* Header */}
                <div className={`p-4 border-b ${
                    darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                }`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                            <span className="mr-2">📁</span>
                            Move to Group
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {/* Group Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Target Group:</label>
                        <select
                            value={targetGroup}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                            <option value="">Choose a group...</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    📁 {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item Selection */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Select Items to Move:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    All
                                </button>
                                <button
                                    onClick={selectNone}
                                    className="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                                >
                                    None
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {ungroupedItems.map((item) => (
                                <label
                                    key={item.id}
                                    className={`flex items-center p-2 rounded cursor-pointer transition ${
                                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                    } ${selectedItems.includes(item.id) ?
                                        darkMode ? "bg-gray-700" : "bg-blue-50" : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleItemSelection(item.id)}
                                        className="mr-3 h-4 w-4"
                                    />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-sm">{item.description}</span>
                                        <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                }`}>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${
                                darkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={selectedItems.length === 0 || !targetGroup}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedItems.length > 0 && targetGroup
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-400 cursor-not-allowed text-gray-200"
                            }`}
                        >
                            Move {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface BudgetItemListProps {
    items: BudgetItemType[];
    groups: ExpenseGroup[];
    darkMode: boolean;
    onToggleChecked: (id: string) => void;
    onEditItem: (id: string, description: string, amount: number, group?: string) => void;
    onDeleteItem: (id: string) => void;
    formatCurrency: (amount: number) => string;
    getCategoryColor: (amount: number, darkMode: boolean) => string;
    onAddFirstExpense: () => void;
    currency: CurrencyType;
    onUpdateGroupCollapse: (groupId: string, isCollapsed: boolean) => void;
    onMoveItems?: (itemIds: string[], targetGroupId: string) => void;
    onQuickMoveAll?: (items: BudgetItemType[], targetGroupId: string) => void;
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
                            onMoveItems,
                            onQuickMoveAll,
                            onMoveToGroup,
                        }: BudgetItemListProps) => {
    const [showBulkMove, setShowBulkMove] = useState(false);

    // Group items by their group property
    const groupedItems = items.reduce((acc, item) => {
        const groupKey = item.group || "ungrouped";
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {} as Record<string, BudgetItemType[]>);

    // Sort items within each group by amount (highest first)
    Object.keys(groupedItems).forEach(groupKey => {
        groupedItems[groupKey].sort((a, b) => b.amount - a.amount);
    });

    // Calculate group totals
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

    const handleQuickMoveAll = (items: BudgetItemType[], targetGroupId: string) => {
        if (onQuickMoveAll) {
            onQuickMoveAll(items, targetGroupId);
        }
    };

    const handleMoveItems = (itemIds: string[], targetGroupId: string) => {
        if (onMoveItems) {
            onMoveItems(itemIds, targetGroupId);
        }
    };

    const handleMoveToGroup = (itemId: string, groupId: string) => {
        if (onMoveToGroup) {
            onMoveToGroup(itemId, groupId);
        }
    };

    if (items.length === 0) {
        return (
            <div className={`rounded-xl overflow-hidden ${
                darkMode ? "bg-gray-700/50" : "bg-white shadow"
            }`}>
                <div className="p-8 text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <p className="text-xl mb-2 opacity-70">No expenses added yet</p>
                    <p className="text-sm mb-6 opacity-50">Start tracking your expenses to get a clear view of your budget</p>
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
        );
    }

    // Sort groups: ungrouped last, others alphabetically
    const sortedGroupEntries = Object.entries(groupedItems).sort(([a], [b]) => {
        if (a === "ungrouped") return 1;
        if (b === "ungrouped") return -1;
        return getGroupName(a).localeCompare(getGroupName(b));
    });

    const getGroupProgress = (groupItems: BudgetItemType[]) => {
        const total = groupItems.length;
        const checked = groupItems.filter(item => item.checked).length;
        return total > 0 ? (checked / total) * 100 : 0;
    };

    return (
        <>
            <div className={`rounded-xl overflow-hidden ${
                darkMode ? "bg-gray-700/50" : "bg-white shadow"
            }`}>
                {sortedGroupEntries.map(([groupKey, groupItems], groupIndex) => {
                    const groupTotal = getGroupTotal(groupItems);
                    const groupName = getGroupName(groupKey);
                    const collapsed = isGroupCollapsed(groupKey);
                    const isLastGroup = groupIndex === sortedGroupEntries.length - 1;
                    const groupIcon = getGroupIcon(groupKey);
                    const progress = getGroupProgress(groupItems); // Add this back
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
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">{groupName}</h3>
                                                    {isUngrouped && groups.length > 0 && (
                                                        <button
                                                            onClick={() => setShowBulkMove(true)}
                                                            className={`px-2 py-1 rounded text-xs transition ${
                                                                darkMode
                                                                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                                                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                                            }`}
                                                        >
                                                            Move to Group
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm opacity-70">
                                                    <span>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            {/* Circular progress indicator */}
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

                                            <div className="text-lg font-bold">{formatCurrency(groupTotal)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Move Buttons for Ungrouped Items */}
                            {isUngrouped && groups.length > 0 && !collapsed && (
                                <div className={`px-4 py-2 border-b ${
                                    darkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"
                                }`}>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-sm text-gray-500 mr-2">Quick move all to:</span>
                                        {groups.slice(0, 3).map((group) => (
                                            <button
                                                key={group.id}
                                                onClick={() => handleQuickMoveAll(groupItems, group.id)}
                                                className={`px-2 py-1 rounded text-xs transition ${
                                                    darkMode
                                                        ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                                                        : "bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                                                }`}
                                            >
                                                📁 {group.name}
                                            </button>
                                        ))}
                                        {groups.length > 3 && (
                                            <button
                                                onClick={() => setShowBulkMove(true)}
                                                className={`px-2 py-1 rounded text-xs ${
                                                    darkMode
                                                        ? "bg-gray-600 hover:bg-gray-500 text-white"
                                                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                                }`}
                                            >
                                                More...
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                                onEdit={(id, description, amount, group) => onEditItem(id, description, amount, group)}
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

            {/* Bulk Move Modal */}
            {showBulkMove && (
                <BulkMoveModal
                    isOpen={showBulkMove}
                    onClose={() => setShowBulkMove(false)}
                    ungroupedItems={groupedItems["ungrouped"] || []}
                    groups={groups}
                    onMoveItems={handleMoveItems}
                    darkMode={darkMode}
                    formatCurrency={formatCurrency}
                />
            )}
        </>
    );
};

export default BudgetItemList;