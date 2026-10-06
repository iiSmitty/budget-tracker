import { ChevronRight, CircleCheck, Plus, ReceiptText } from "lucide-react";
import BudgetItem from "./BudgetItem";
import Button from "./ui/Button";
import { BudgetItemType, ExpenseGroup } from "../types/budget";
import { CurrencyType, pluralise } from "../utils/utils";

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
    onMoveToGroup: (itemId: string, groupId: string | undefined) => void;
}

const UNGROUPED = "ungrouped";

const sum = (items: BudgetItemType[]) => items.reduce((total, item) => total + item.amount, 0);

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
    // Separate income and expense items, largest first
    const byAmount = (a: BudgetItemType, b: BudgetItemType) => b.amount - a.amount;
    const incomeItems = items.filter((item) => item.isIncome).sort(byAmount);
    const expenseItems = items.filter((item) => !item.isIncome);

    // Group expenses by their group; items whose group no longer exists count as ungrouped
    const groupIds = new Set(groups.map((group) => group.id));
    const groupedExpenses = new Map<string, BudgetItemType[]>();
    expenseItems.forEach((item) => {
        const key = item.group && groupIds.has(item.group) ? item.group : UNGROUPED;
        groupedExpenses.set(key, [...(groupedExpenses.get(key) ?? []), item]);
    });

    const getGroupName = (groupKey: string) =>
        groupKey === UNGROUPED ? "Ungrouped" : groups.find((group) => group.id === groupKey)?.name ?? "";

    // Ungrouped last, others alphabetically
    const sortedGroupEntries = [...groupedExpenses.entries()]
        .map(([groupKey, groupItems]) => [groupKey, [...groupItems].sort(byAmount)] as const)
        .sort(([a], [b]) => {
            if (a === UNGROUPED) return 1;
            if (b === UNGROUPED) return -1;
            return getGroupName(a).localeCompare(getGroupName(b));
        });

    const renderItem = (item: BudgetItemType) => (
        <li key={item.id}>
            <BudgetItem
                item={item}
                onToggleChecked={onToggleChecked}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                formatCurrency={formatCurrency}
                currency={currency}
                groups={groups}
                onMoveToGroup={onMoveToGroup}
            />
        </li>
    );

    const emptyState = (title: string, body: string, action: string) => (
        <div className="rounded-xl border border-dashed border-border-strong px-6 py-10 text-center">
            <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-full bg-surface-muted text-fg-subtle">
                <ReceiptText size={24} aria-hidden="true" />
            </div>
            <p className="text-lg font-semibold">{title}</p>
            <p className="mt-1 mb-6 text-sm text-fg-muted">{body}</p>
            <Button variant="primary" onClick={onAddFirstExpense}>
                <Plus size={18} aria-hidden="true" />
                {action}
            </Button>
        </div>
    );

    if (items.length === 0) {
        return emptyState(
            "Nothing planned yet",
            "Add your expenses and any extra income to see where this month's money goes.",
            "Add your first item"
        );
    }

    return (
        <div className="space-y-4">
            {/* Additional income - always first when there is any */}
            {incomeItems.length > 0 && (
                <section
                    aria-labelledby="income-heading"
                    className="rounded-xl overflow-hidden border border-green-200 dark:border-green-900"
                >
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-green-50 dark:bg-green-950/40">
                        <div>
                            <h3 id="income-heading" className="font-semibold">Additional income</h3>
                            <p className="text-sm text-fg-muted">{pluralise(incomeItems.length, "item")}</p>
                        </div>
                        <span className="font-semibold tabular-nums text-green-700 dark:text-green-400">
                            +{formatCurrency(sum(incomeItems))}
                        </span>
                    </div>
                    <ul className="divide-y divide-border">{incomeItems.map(renderItem)}</ul>
                </section>
            )}

            {/* Expenses, by group */}
            {expenseItems.length > 0 ? (
                <div className="rounded-xl overflow-hidden border border-border divide-y divide-border">
                    {sortedGroupEntries.map(([groupKey, groupItems]) => {
                        const isUngrouped = groupKey === UNGROUPED;
                        const group = groups.find((g) => g.id === groupKey);
                        const isCollapsed = !isUngrouped && (group?.isCollapsed ?? false);
                        const paidCount = groupItems.filter((item) => item.checked).length;
                        const allPaid = paidCount === groupItems.length;
                        const listId = `group-items-${groupKey}`;

                        const header = (
                            <span className="flex items-center gap-3">
                                {!isUngrouped && (
                                    <ChevronRight
                                        size={18}
                                        aria-hidden="true"
                                        className={`shrink-0 text-fg-subtle transition-transform duration-200 ${
                                            isCollapsed ? "" : "rotate-90"
                                        }`}
                                    />
                                )}
                                <span className="flex-1 min-w-0">
                                    <span className="block font-semibold truncate">{getGroupName(groupKey)}</span>
                                    <span className="flex items-center gap-1.5 text-sm text-fg-muted">
                                        {allPaid ? (
                                            <>
                                                <CircleCheck size={14} aria-hidden="true" className="text-green-600 dark:text-green-400" />
                                                {groupItems.length === 1 ? "Paid" : `All ${groupItems.length} paid`}
                                            </>
                                        ) : (
                                            `${paidCount} of ${pluralise(groupItems.length, "item")} paid`
                                        )}
                                    </span>
                                </span>
                                <span className="shrink-0 font-semibold tabular-nums">
                                    {formatCurrency(sum(groupItems))}
                                </span>
                            </span>
                        );

                        return (
                            <section key={groupKey} aria-label={getGroupName(groupKey)}>
                                <h3>
                                    {isUngrouped ? (
                                        <span className="block px-4 py-3 bg-surface-muted/60">{header}</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onUpdateGroupCollapse(groupKey, !isCollapsed)}
                                            aria-expanded={!isCollapsed}
                                            aria-controls={listId}
                                            className="block w-full text-left px-4 py-3 bg-surface-muted/60 hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                                        >
                                            {header}
                                        </button>
                                    )}
                                </h3>

                                {!isCollapsed && (
                                    <ul id={listId} className="divide-y divide-border">
                                        {groupItems.map(renderItem)}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>
            ) : (
                emptyState(
                    "No expenses yet",
                    "Add your first expense to start tracking your spending.",
                    "Add your first expense"
                )
            )}
        </div>
    );
};

export default BudgetItemList;
