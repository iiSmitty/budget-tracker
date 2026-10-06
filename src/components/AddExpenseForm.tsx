import { useId, useState } from "react";
import { CurrencyType, currencies } from "../utils/utils";
import { ExpenseGroup } from "../types/budget";
import Button from "./ui/Button";
import SegmentedControl from "./ui/SegmentedControl";
import { fieldClass } from "./ui/fieldClass";

interface AddExpenseFormProps {
    onAddExpense: (description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onCancel: () => void;
    currency: CurrencyType;
    groups: ExpenseGroup[];
}

type ItemKind = "expense" | "income";

const AddExpenseForm = ({ onAddExpense, onCancel, currency, groups }: AddExpenseFormProps) => {
    const descriptionId = useId();
    const amountId = useId();
    const groupId = useId();
    const [kind, setKind] = useState<ItemKind>("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    const isIncome = kind === "income";
    const isSubmittable = description.trim() !== "" && !isNaN(parseFloat(amount));
    const accent = isIncome ? "income" : "primary";

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isSubmittable) return;

        onAddExpense(description.trim(), parseFloat(amount), isIncome ? undefined : selectedGroup || undefined, isIncome);
        setDescription("");
        setAmount("");
        setSelectedGroup("");
        setKind("expense");
    };

    return (
        <form
            onSubmit={handleSubmit}
            onKeyDown={(event) => event.key === "Escape" && onCancel()}
            aria-label={isIncome ? "Add income" : "Add expense"}
            className={`p-4 rounded-xl border transition-colors ${
                isIncome
                    ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                    : "bg-surface-muted/50 border-border"
            }`}
        >
            <SegmentedControl
                label="Item type"
                value={kind}
                onChange={setKind}
                options={[
                    { value: "expense", label: "Expense" },
                    { value: "income", label: "Extra income" },
                ]}
            />

            <div className={`mt-4 grid gap-3 ${isIncome ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                <div>
                    <label htmlFor={descriptionId} className="block text-sm font-medium mb-1">Description</label>
                    <input
                        id={descriptionId}
                        type="text"
                        placeholder={isIncome ? "e.g. Freelance work" : "e.g. Car payment"}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={fieldClass({ accent })}
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor={amountId} className="block text-sm font-medium mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
                            {currencies[currency].symbol}
                        </span>
                        <input
                            id={amountId}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={fieldClass({ accent, hasPrefix: true })}
                        />
                    </div>
                </div>

                {/* Only expenses belong to groups */}
                {!isIncome && (
                    <div>
                        <label htmlFor={groupId} className="block text-sm font-medium mb-1">Group</label>
                        <select
                            id={groupId}
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className={fieldClass()}
                        >
                            <option value="">No group</option>
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
                <Button type="submit" variant={isIncome ? "success" : "primary"} disabled={!isSubmittable}>
                    {isIncome ? "Add income" : "Add expense"}
                </Button>
            </div>
        </form>
    );
};

export default AddExpenseForm;
