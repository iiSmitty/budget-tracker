import {useId, useRef, useState} from "react";
import {Ellipsis} from "lucide-react";
import DropdownMenu, {MoveTarget} from "./DropdownMenu";
import Button from "./ui/Button";
import SegmentedControl from "./ui/SegmentedControl";
import {fieldClass} from "./ui/fieldClass";
import {CurrencyType, currencies} from "../utils/utils";
import {BudgetItemType, ExpenseGroup} from "../types/budget";

interface BudgetItemProps {
    item: BudgetItemType;
    onToggleChecked: (id: string) => void;
    onEdit: (id: string, description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onDelete: (id: string) => void;
    formatCurrency: (amount: number) => string;
    currency: CurrencyType;
    groups?: ExpenseGroup[];
    onMoveToGroup: (itemId: string, groupId: string | undefined) => void;
}

type ItemKind = "expense" | "income";

const BudgetItem = ({
                        item,
                        onToggleChecked,
                        onEdit,
                        onDelete,
                        formatCurrency,
                        currency,
                        groups = [],
                        onMoveToGroup,
                    }: BudgetItemProps) => {
    const fieldIds = {description: useId(), amount: useId(), group: useId()};
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(item.description);
    const [editAmount, setEditAmount] = useState(item.amount.toString());
    const [editGroup, setEditGroup] = useState(item.group || "");
    const [editKind, setEditKind] = useState<ItemKind>(item.isIncome ? "income" : "expense");

    // Start editing
    const startEdit = () => {
        setEditDescription(item.description);
        setEditAmount(item.amount.toString());
        setEditGroup(item.group || "");
        setEditKind(item.isIncome ? "income" : "expense");
        setIsEditing(true);
    };

    const canSave = editDescription.trim() !== "" && !isNaN(parseFloat(editAmount));

    // Save edits
    const saveEdit = () => {
        if (!canSave) return;

        const isIncome = editKind === "income";
        const groupToSave = isIncome || editGroup === "" ? undefined : editGroup;
        onEdit(item.id, editDescription.trim(), parseFloat(editAmount), groupToSave, isIncome);
        setIsEditing(false);
    };

    // Expenses can move to any other group, or out of their group; income isn't grouped
    const moveTargets: MoveTarget[] = item.isIncome
        ? []
        : [
            ...groups
                .filter((group) => group.id !== item.group)
                .map((group) => ({groupId: group.id, name: group.name})),
            ...(item.group ? [{groupId: undefined, name: "No group"}] : []),
        ];

    if (isEditing) {
        const isIncome = editKind === "income";
        const accent = isIncome ? "income" : "primary";

        return (
            <div className="p-4 space-y-3 bg-surface-muted/40">
                <SegmentedControl
                    label="Item type"
                    value={editKind}
                    onChange={setEditKind}
                    options={[
                        {value: "expense", label: "Expense"},
                        {value: "income", label: "Income"},
                    ]}
                />

                <div className={`grid gap-3 ${isIncome ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                    <div>
                        <label htmlFor={fieldIds.description} className="block text-sm font-medium mb-1">Description</label>
                        <input
                            id={fieldIds.description}
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setIsEditing(false);
                            }}
                            className={fieldClass({accent})}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor={fieldIds.amount} className="block text-sm font-medium mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
                                {currencies[currency].symbol}
                            </span>
                            <input
                                id={fieldIds.amount}
                                type="number"
                                inputMode="decimal"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") setIsEditing(false);
                                }}
                                className={fieldClass({accent, hasPrefix: true})}
                            />
                        </div>
                    </div>

                    {/* Only expenses belong to groups */}
                    {!isIncome && (
                        <div>
                            <label htmlFor={fieldIds.group} className="block text-sm font-medium mb-1">Group</label>
                            <select
                                id={fieldIds.group}
                                value={editGroup}
                                onChange={(e) => setEditGroup(e.target.value)}
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

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                    </Button>
                    <Button variant={isIncome ? "success" : "primary"} onClick={saveEdit} disabled={!canSave}>
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 pl-4 pr-2 py-2.5">
            <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleChecked(item.id)}
                aria-label={item.isIncome ? `Mark ${item.description} as received` : `Mark ${item.description} as paid`}
                className="h-5 w-5 shrink-0 rounded accent-indigo-600 cursor-pointer"
            />

            <span
                className={`flex-1 min-w-0 break-words ${
                    item.checked ? "text-fg-subtle line-through decoration-1" : ""
                }`}
            >
                {item.description}
            </span>

            <span
                className={`shrink-0 tabular-nums font-medium ${
                    item.isIncome
                        ? "text-green-700 dark:text-green-400"
                        : item.checked
                            ? "text-fg-subtle"
                            : ""
                }`}
            >
                {item.isIncome ? "+" : ""}
                {formatCurrency(item.amount)}
            </span>

            <Button
                ref={menuButtonRef}
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label={`Actions for ${item.description}`}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
            >
                <Ellipsis size={18} aria-hidden="true" />
            </Button>
            <DropdownMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                anchorRef={menuButtonRef}
                label={`Actions for ${item.description}`}
                onEdit={startEdit}
                onDelete={() => onDelete(item.id)}
                moveTargets={moveTargets}
                onMove={(groupId) => onMoveToGroup(item.id, groupId)}
            />
        </div>
    );
};

export default BudgetItem;
