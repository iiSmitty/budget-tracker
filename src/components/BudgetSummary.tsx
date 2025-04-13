interface BudgetSummaryProps {
  totalBudget: number;
  currentIncome: number;
  remainingBudget: number;
  darkMode: boolean;
  formatCurrency: (amount: number) => string;
  onEditIncome: () => void;
}

const BudgetSummary = ({
  totalBudget,
  currentIncome,
  remainingBudget,
  darkMode,
  formatCurrency,
  onEditIncome,
}: BudgetSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div
        className={`rounded-xl p-4 ${
          darkMode ? "bg-indigo-900/50" : "bg-indigo-50"
        }`}
      >
        <div className="text-sm opacity-70">Total Budget</div>
        <div className="text-2xl font-bold">
          {formatCurrency(totalBudget)}
        </div>
      </div>

      <div
        className={`rounded-xl p-4 flex justify-between items-center ${
          darkMode ? "bg-green-900/40" : "bg-green-50"
        }`}
      >
        <div>
          <div className="text-sm opacity-70">Income</div>
          <div className="text-2xl font-bold">
            {formatCurrency(currentIncome)}
          </div>
        </div>
        <button
          onClick={onEditIncome}
          className={`p-2 rounded-lg transition ${
            darkMode
              ? "bg-green-800 hover:bg-green-700 text-white"
              : "bg-green-100 hover:bg-green-200 text-green-800"
          }`}
        >
          ✏️
        </button>
      </div>

      <div
        className={`rounded-xl p-4 ${
          remainingBudget >= 0
            ? darkMode
              ? "bg-blue-900/40"
              : "bg-blue-50"
            : darkMode
            ? "bg-red-900/40"
            : "bg-red-50"
        }`}
      >
        <div className="text-sm opacity-70">Remaining</div>
        <div className="text-2xl font-bold">
          {formatCurrency(remainingBudget)}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;