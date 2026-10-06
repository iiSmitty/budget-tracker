import { useEffect, useRef, useState } from "react";
import { BudgetItemType } from "../types/budget";
import { exportBudgetData } from "../utils/dataBackup";
import { pluralise } from "../utils/utils";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";

interface ClearMonthDialogProps {
    isOpen: boolean;
    month: string;
    items: BudgetItemType[];
    baseIncome: number;
    formatCurrency: (amount: number) => string;
    onConfirm: (includeIncome: boolean) => void;
    onCancel: () => void;
}

const sumAmounts = (items: BudgetItemType[]) =>
    items.reduce((sum, item) => sum + item.amount, 0);

const ClearMonthDialog = ({
                              isOpen,
                              month,
                              items,
                              baseIncome,
                              formatCurrency,
                              onConfirm,
                              onCancel,
                          }: ClearMonthDialogProps) => {
    const [includeIncome, setIncludeIncome] = useState(false);
    const [backupDownloaded, setBackupDownloaded] = useState(false);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const expenses = items.filter((item) => !item.isIncome);
    const incomeItems = items.filter((item) => item.isIncome);
    const removeCount = expenses.length + (includeIncome ? incomeItems.length : 0);

    // Reset choices each time the dialog opens, so a previous selection never carries over
    useEffect(() => {
        if (isOpen) {
            setIncludeIncome(false);
            setBackupDownloaded(false);
        }
    }, [isOpen]);

    const handleBackup = () => {
        exportBudgetData();
        setBackupDownloaded(true);
    };

    const confirmLabel =
        removeCount === 0
            ? "Nothing to clear"
            : includeIncome && incomeItems.length > 0
                ? `Clear ${pluralise(removeCount, "item")}`
                : `Clear ${pluralise(removeCount, "expense")}`;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onCancel}
            role="alertdialog"
            showCloseButton={false}
            initialFocusRef={cancelButtonRef}
            icon="🗑️"
            title={`Clear ${month}?`}
            description={
                expenses.length > 0
                    ? `This removes all ${pluralise(expenses.length, "expense")} from ${month}.`
                    : `There are no expenses in ${month}.`
            }
            footer={
                <>
                    <Button ref={cancelButtonRef} variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => onConfirm(includeIncome)}
                        disabled={removeCount === 0}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {/* What will be removed */}
            <div className="rounded-xl border border-border divide-y divide-border bg-surface-muted/40 text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <span>{pluralise(expenses.length, "expense")}</span>
                    <span className="font-semibold tabular-nums">
                        {formatCurrency(sumAmounts(expenses))}
                    </span>
                </div>

                {incomeItems.length > 0 && (
                    <label className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer">
                        <span className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeIncome}
                                onChange={(e) => setIncludeIncome(e.target.checked)}
                                className="h-4 w-4 rounded accent-red-600"
                            />
                            <span>
                                Also remove additional income
                                <span className="block text-xs text-fg-subtle">
                                    {pluralise(incomeItems.length, "item")}
                                </span>
                            </span>
                        </span>
                        <span
                            className={`font-semibold tabular-nums ${
                                includeIncome ? "" : "text-fg-subtle"
                            }`}
                        >
                            +{formatCurrency(sumAmounts(incomeItems))}
                        </span>
                    </label>
                )}
            </div>

            {/* What will be kept */}
            <p className="mt-3 text-sm text-fg-muted">
                Your groups and {month} base income ({formatCurrency(baseIncome)}) are kept.
            </p>

            {/* Safety net */}
            <p className="mt-3 text-sm text-fg-muted">
                You can undo this for a few seconds afterwards.{" "}
                {backupDownloaded ? (
                    <span className="text-green-700 dark:text-green-400">✓ Backup downloaded</span>
                ) : (
                    <button
                        type="button"
                        onClick={handleBackup}
                        className="underline underline-offset-2 rounded text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        Download a backup first
                    </button>
                )}
            </p>
        </Dialog>
    );
};

export default ClearMonthDialog;
