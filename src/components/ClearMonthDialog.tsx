import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { BudgetItemType } from "../types/budget";
import { exportBudgetData } from "../utils/dataBackup";
import { pluralise } from "../utils/utils";

interface ClearMonthDialogProps {
    isOpen: boolean;
    month: string;
    items: BudgetItemType[];
    baseIncome: number;
    darkMode: boolean;
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
                              darkMode,
                              formatCurrency,
                              onConfirm,
                              onCancel,
                          }: ClearMonthDialogProps) => {
    const [includeIncome, setIncludeIncome] = useState(false);
    const [backupDownloaded, setBackupDownloaded] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    // Latest onCancel, so the keyboard effect below doesn't re-run (and steal focus) on parent re-renders
    const onCancelRef = useRef(onCancel);
    useEffect(() => {
        onCancelRef.current = onCancel;
    }, [onCancel]);

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

    // Focus the safe action on open, keep focus inside the dialog, and restore it on close
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        cancelButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCancelRef.current();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) return;

            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                "button:not(:disabled), input:not(:disabled)"
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    if (!isOpen) return null;

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

    const mutedText = darkMode ? "text-gray-400" : "text-gray-500";

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />

            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="clear-month-title"
                aria-describedby="clear-month-description"
                className={`relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                darkMode ? "bg-red-900/50" : "bg-red-100"
                            }`}
                            aria-hidden="true"
                        >
                            🗑️
                        </div>
                        <div className="min-w-0">
                            <h2 id="clear-month-title" className="text-lg font-semibold">
                                Clear {month}?
                            </h2>
                            <p id="clear-month-description" className={`mt-1 text-sm ${mutedText}`}>
                                {expenses.length > 0
                                    ? `This removes all ${pluralise(expenses.length, "expense")} from ${month}.`
                                    : `There are no expenses in ${month}.`}
                            </p>
                        </div>
                    </div>

                    {/* What will be removed */}
                    <div
                        className={`mt-5 rounded-xl border divide-y text-sm ${
                            darkMode
                                ? "border-gray-700 divide-gray-700 bg-gray-900/40"
                                : "border-gray-200 divide-gray-200 bg-gray-50"
                        }`}
                    >
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
                                        <span className={`block text-xs ${mutedText}`}>
                                            {pluralise(incomeItems.length, "item")}
                                        </span>
                                    </span>
                                </span>
                                <span
                                    className={`font-semibold tabular-nums ${
                                        includeIncome ? "" : mutedText
                                    }`}
                                >
                                    +{formatCurrency(sumAmounts(incomeItems))}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* What will be kept */}
                    <p className={`mt-3 text-sm ${mutedText}`}>
                        Your groups and {month} base income ({formatCurrency(baseIncome)}) are kept.
                    </p>

                    {/* Safety net */}
                    <p className={`mt-3 text-sm ${mutedText}`}>
                        You can undo this for a few seconds afterwards.{" "}
                        {backupDownloaded ? (
                            <span className={darkMode ? "text-green-400" : "text-green-700"}>
                                ✓ Backup downloaded
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleBackup}
                                className={`underline underline-offset-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    darkMode
                                        ? "text-indigo-300 hover:text-indigo-200"
                                        : "text-indigo-600 hover:text-indigo-700"
                                }`}
                            >
                                Download a backup first
                            </button>
                        )}
                    </p>
                </div>

                <div
                    className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 rounded-b-2xl ${
                        darkMode ? "bg-gray-900/40" : "bg-gray-50"
                    }`}
                >
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onCancel}
                        className={`px-4 py-2.5 sm:py-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            darkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(includeIncome)}
                        disabled={removeCount === 0}
                        className="px-4 py-2.5 sm:py-2 rounded-lg font-medium text-white transition bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ClearMonthDialog;
