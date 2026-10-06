interface BudgetSummaryProps {
    totalBudget: number;
    currentIncome: number; // This now represents TOTAL income (base + additional)
    remainingBudget: number;
    formatCurrency: (amount: number) => string;
    onEditIncome: () => void;
    baseIncome?: number;
    additionalIncome?: number;
}

const BudgetSummary = ({
                           totalBudget,
                           currentIncome, // Total income
                           remainingBudget,
                           formatCurrency,
                           onEditIncome,
                           baseIncome,
                           additionalIncome,
                       }: BudgetSummaryProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/50">
                <div className="text-sm text-fg-muted">Total Budget</div>
                <div className="text-2xl font-bold">
                    {formatCurrency(totalBudget)}
                </div>
            </div>

            <div className="rounded-xl p-4 flex justify-between items-center bg-green-50 dark:bg-green-900/40">
                <div>
                    <div className="text-sm text-fg-muted">Total Income</div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(currentIncome)}
                    </div>
                    {/* Optional: Show breakdown if additional income exists */}
                    {additionalIncome && additionalIncome > 0 && (
                        <div className="text-xs text-fg-subtle mt-1">
                            Base: {formatCurrency(baseIncome || 0)} + Extra: {formatCurrency(additionalIncome)}
                        </div>
                    )}
                </div>
                <button
                    onClick={onEditIncome}
                    aria-label="Edit income"
                    className="p-2 rounded-lg transition-colors bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-800 dark:hover:bg-green-700 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                    <span aria-hidden="true">✏️</span>
                </button>
            </div>

            <div
                className={`rounded-xl p-4 ${
                    remainingBudget >= 0
                        ? "bg-blue-50 dark:bg-blue-900/40"
                        : "bg-red-50 dark:bg-red-900/40"
                }`}
            >
                <div className="text-sm text-fg-muted">Remaining</div>
                <div className="text-2xl font-bold">
                    {formatCurrency(remainingBudget)}
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;
