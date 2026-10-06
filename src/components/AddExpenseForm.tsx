import { useId, useState } from "react";
import { CurrencyType, currencies } from "../utils/utils";
import { ExpenseGroup } from "../types/budget";
import Button from "./ui/Button";
import { fieldClass } from "./ui/fieldClass";

interface GroupedAddExpenseFormProps {
    onAddExpense: (description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onCancel: () => void;
    currency: CurrencyType;
    groups: ExpenseGroup[];
}

const GroupedAddExpenseForm = ({
                                   onAddExpense,
                                   onCancel,
                                   currency,
                                   groups,
                               }: GroupedAddExpenseFormProps) => {
    const descriptionId = useId();
    const amountId = useId();
    const groupId = useId();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [isIncome, setIsIncome] = useState(false);

    // Get currency symbol based on the current currency
    const currencySymbol = currencies[currency].symbol;
    const isSubmittable = description.trim() !== "" && !isNaN(parseFloat(amount));
    const fieldAccent = isIncome ? "income" : "primary";

    const handleSubmit = () => {
        if (!isSubmittable) return;

        const groupToAssign = selectedGroup === "none" ? undefined : selectedGroup;
        onAddExpense(description, parseFloat(amount), groupToAssign, isIncome);
        setDescription("");
        setAmount("");
        setSelectedGroup("");
        setIsIncome(false);
    };

    const switchClass = (size: "sm" | "md") =>
        `relative inline-flex ${size === "sm" ? "h-5 w-9" : "h-6 w-11"} flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
            isIncome ? "bg-green-600 focus-visible:ring-green-500" : "bg-surface-hover focus-visible:ring-primary"
        }`;

    const knobClass = (size: "sm" | "md") =>
        `pointer-events-none inline-block ${size === "sm" ? "h-4 w-4" : "h-5 w-5"} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isIncome ? (size === "sm" ? "translate-x-4" : "translate-x-5") : "translate-x-0"
        }`;

    return (
        <div
            className={`mb-4 p-4 rounded-lg transition-colors ${
                isIncome
                    ? "bg-green-50 border-2 border-green-300 dark:bg-green-900/30 dark:border-green-700"
                    : "bg-surface-muted"
            }`}
        >
            {/* Mobile-Optimized Header with Toggle */}
            <div className="mb-4">
                {/* Mobile: Stack vertically */}
                <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-3">
            <span className={`font-medium ${isIncome ? "text-green-700 dark:text-green-400" : ""}`}>
              {isIncome ? "💰 Adding Income" : "📝 Adding Expense"}
            </span>

                        {/* Toggle Switch - Compact for mobile */}
                        <button
                            type="button"
                            onClick={() => setIsIncome(!isIncome)}
                            className={switchClass("sm")}
                            role="switch"
                            aria-checked={isIncome}
                            aria-label="Income"
                        >
              <span className={knobClass("sm")} />
                        </button>
                    </div>

                    {/* Mobile: Show current mode clearly */}
                    <div className={`text-sm px-3 py-2 rounded-lg text-center ${
                        isIncome
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                    }`}>
                        {isIncome ? "Mode: Income" : "Mode: Expense"}
                    </div>
                </div>

                {/* Desktop: Keep original horizontal layout */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-3">
            <span className={`font-medium ${isIncome ? "text-green-700 dark:text-green-400" : ""}`}>
              {isIncome ? "💰 Adding Income" : "📝 Adding Expense"}
            </span>
                    </div>

                    {/* Toggle Switch - Full size for desktop */}
                    <div className="flex items-center gap-2">
            <span className={`text-sm ${!isIncome ? "font-medium" : "text-fg-subtle"}`}>
              Expense
            </span>
                        <button
                            type="button"
                            onClick={() => setIsIncome(!isIncome)}
                            className={switchClass("md")}
                            role="switch"
                            aria-checked={isIncome}
                            aria-label="Income"
                        >
              <span className={knobClass("md")} />
                        </button>
                        <span className={`text-sm ${isIncome ? "font-medium text-green-700 dark:text-green-400" : "text-fg-subtle"}`}>
              Income
            </span>
                    </div>
                </div>
            </div>

            <div className={`grid gap-4 ${isIncome ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
                <div>
                    <label htmlFor={descriptionId} className="block text-sm font-medium mb-1">Description</label>
                    <input
                        id={descriptionId}
                        type="text"
                        placeholder={isIncome ? "e.g., Freelance work" : "e.g., Car Payment"}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        className={fieldClass({ accent: fieldAccent })}
                    />
                </div>

                <div>
                    <label htmlFor={amountId} className="block text-sm font-medium mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">{currencySymbol}</span>
                        <input
                            id={amountId}
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className={fieldClass({ accent: fieldAccent, hasPrefix: true })}
                        />
                    </div>
                </div>

                {/* Only show group selector for expenses */}
                {!isIncome && (
                    <div>
                        <label htmlFor={groupId} className="block text-sm font-medium mb-1">Group (Optional)</label>
                        <select
                            id={groupId}
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className={fieldClass()}
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
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    variant={isIncome ? "success" : "primary"}
                    onClick={handleSubmit}
                    disabled={!isSubmittable}
                >
                    {isIncome ? "Add Income" : "Add Expense"}
                </Button>
            </div>
        </div>
    );
};

export default GroupedAddExpenseForm;
