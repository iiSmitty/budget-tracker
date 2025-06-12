import { useState } from "react";
import { CurrencyType, currencies } from "../utils/utils";
import { ExpenseGroup } from "../types/budget";

interface GroupedAddExpenseFormProps {
    darkMode: boolean;
    onAddExpense: (description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onCancel: () => void;
    currency: CurrencyType;
    groups: ExpenseGroup[];
}

const GroupedAddExpenseForm = ({
                                   darkMode,
                                   onAddExpense,
                                   onCancel,
                                   currency,
                                   groups,
                               }: GroupedAddExpenseFormProps) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [isIncome, setIsIncome] = useState(false);

    // Get currency symbol based on the current currency
    const currencySymbol = currencies[currency].symbol;

    const handleSubmit = () => {
        if (description.trim() === "" || isNaN(parseFloat(amount))) return;

        const groupToAssign = selectedGroup === "none" ? undefined : selectedGroup;
        onAddExpense(description, parseFloat(amount), groupToAssign, isIncome);
        setDescription("");
        setAmount("");
        setSelectedGroup("");
        setIsIncome(false);
    };

    return (
        <div
            className={`mb-4 p-4 rounded-lg transition-colors ${
                isIncome
                    ? darkMode ? "bg-green-900/30 border-2 border-green-700" : "bg-green-50 border-2 border-green-300"
                    : darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
        >
            {/* Mobile-Optimized Header with Toggle */}
            <div className="mb-4">
                {/* Mobile: Stack vertically */}
                <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-3">
            <span className={`font-medium ${isIncome ? 'text-green-600' : ''}`}>
              {isIncome ? "💰 Adding Income" : "📝 Adding Expense"}
            </span>

                        {/* Toggle Switch - Compact for mobile */}
                        <button
                            type="button"
                            onClick={() => setIsIncome(!isIncome)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isIncome
                                    ? 'bg-green-600 focus:ring-green-500'
                                    : darkMode
                                        ? 'bg-gray-600 focus:ring-gray-500'
                                        : 'bg-gray-200 focus:ring-gray-500'
                            }`}
                            role="switch"
                            aria-checked={isIncome}
                        >
              <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isIncome ? 'translate-x-4' : 'translate-x-0'
                  }`}
              />
                        </button>
                    </div>

                    {/* Mobile: Show current mode clearly */}
                    <div className={`text-sm px-3 py-2 rounded-lg text-center ${
                        isIncome
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                        {isIncome ? "Mode: Income" : "Mode: Expense"}
                    </div>
                </div>

                {/* Desktop: Keep original horizontal layout */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-3">
            <span className={`font-medium ${isIncome ? 'text-green-600' : ''}`}>
              {isIncome ? "💰 Adding Income" : "📝 Adding Expense"}
            </span>
                    </div>

                    {/* Toggle Switch - Full size for desktop */}
                    <div className="flex items-center gap-2">
            <span className={`text-sm ${!isIncome ? 'font-medium' : 'opacity-60'}`}>
              Expense
            </span>
                        <button
                            type="button"
                            onClick={() => setIsIncome(!isIncome)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isIncome
                                    ? 'bg-green-600 focus:ring-green-500'
                                    : darkMode
                                        ? 'bg-gray-600 focus:ring-gray-500'
                                        : 'bg-gray-200 focus:ring-gray-500'
                            }`}
                            role="switch"
                            aria-checked={isIncome}
                        >
              <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isIncome ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
                        </button>
                        <span className={`text-sm ${isIncome ? 'font-medium text-green-600' : 'opacity-60'}`}>
              Income
            </span>
                    </div>
                </div>
            </div>

            <div className={`grid gap-4 ${isIncome ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        placeholder={isIncome ? "e.g., Freelance work" : "e.g., Car Payment"}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${
                            darkMode
                                ? "bg-gray-800 text-white border-gray-600"
                                : "bg-white text-gray-900 border-gray-300"
                        } border focus:outline-none focus:ring-2 ${
                            isIncome ? "focus:ring-green-500" : "focus:ring-indigo-500"
                        }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <div className="relative">
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
                            } border focus:outline-none focus:ring-2 ${
                                isIncome ? "focus:ring-green-500" : "focus:ring-indigo-500"
                            }`}
                        />
                    </div>
                </div>

                {/* Only show group selector for expenses */}
                {!isIncome && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Group (Optional)</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg ${
                                darkMode
                                    ? "bg-gray-800 text-white border-gray-600"
                                    : "bg-white text-gray-900 border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                            <option value="">Select a group</option>
                            <option value="none">No group</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
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
                    disabled={description.trim() === "" || isNaN(parseFloat(amount))}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        description.trim() === "" || isNaN(parseFloat(amount))
                            ? darkMode
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-gray-300 cursor-not-allowed"
                            : isIncome
                                ? darkMode
                                    ? "bg-green-700 hover:bg-green-600 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                : darkMode
                                    ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                    {isIncome ? "Add Income" : "Add Expense"}
                </button>
            </div>
        </div>
    );
};

export default GroupedAddExpenseForm;