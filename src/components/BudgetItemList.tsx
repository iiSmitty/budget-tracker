import BudgetItem, { BudgetItemType } from "./BudgetItem";
import { CurrencyType } from "../utils/utils";

interface BudgetItemListProps {
  items: BudgetItemType[];
  darkMode: boolean;
  onToggleChecked: (id: string) => void;
  onEditItem: (id: string, description: string, amount: number) => void;
  onDeleteItem: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getCategoryColor: (amount: number, darkMode: boolean) => string;
  onAddFirstExpense: () => void;
  currency: CurrencyType;
}

const BudgetItemList = ({
  items,
  darkMode,
  onToggleChecked,
  onEditItem,
  onDeleteItem,
  formatCurrency,
  getCategoryColor,
  onAddFirstExpense,
  currency,
}: BudgetItemListProps) => {
  // Sort budget items from biggest to smallest
  const sortedItems = [...items].sort((a, b) => b.amount - a.amount);

  return (
    <div
      className={`rounded-xl overflow-hidden ${
        darkMode ? "bg-gray-700/50" : "bg-white shadow"
      }`}
    >
      {sortedItems.map((item) => (
        <div
          key={item.id}
          className={`border-b transition-all duration-200 ${
            darkMode
              ? "border-gray-600 hover:bg-gray-700"
              : "border-gray-200 hover:bg-gray-50"
          } ${
            item.checked
              ? darkMode
                ? "opacity-50"
                : "bg-gray-50 opacity-60"
              : ""
          }`}
        >
          <BudgetItem
            item={item}
            darkMode={darkMode}
            onToggleChecked={onToggleChecked}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            formatCurrency={formatCurrency}
            getCategoryColor={getCategoryColor}
            currency={currency}
          />
        </div>
      ))}

      {/* Empty state */}
      {sortedItems.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-lg opacity-70">No expenses added yet</p>
          <button
            onClick={onAddFirstExpense}
            className={`mt-4 px-4 py-2 rounded-full ${
              darkMode
                ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Add Your First Expense
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetItemList;
