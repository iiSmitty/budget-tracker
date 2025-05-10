import { useState } from "react";
import { CurrencyType, currencies } from "../utils/utils";

interface AddExpenseFormProps {
  darkMode: boolean;
  onAddExpense: (description: string, amount: number) => void;
  onCancel: () => void;
  currency: CurrencyType;
}

const AddExpenseForm = ({
  darkMode,
  onAddExpense,
  onCancel,
  currency,
}: AddExpenseFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  // Get currency symbol based on the current currency
  const currencySymbol = currencies[currency].symbol;

  const handleSubmit = () => {
    if (description.trim() === "" || isNaN(parseFloat(amount))) return;

    onAddExpense(description, parseFloat(amount));
    setDescription("");
    setAmount("");
  };

  return (
    <div
      className={`mb-4 p-4 rounded-lg ${
        darkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g., Car Payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <div className="relative">
            {/* Use dynamic currency symbol instead of hardcoded "R" */}
            <span className="absolute left-3 top-2">{currencySymbol}</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 text-white"
              : "bg-gray-300 hover:bg-gray-400 text-gray-800"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg ${
            darkMode
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
