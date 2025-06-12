import {useState, useEffect} from "react";
import DropdownMenu from "./DropdownMenu";
import {CurrencyType, currencies} from "../utils/utils";
import {BudgetItemType, ExpenseGroup} from "../types/budget";

interface BudgetItemProps {
    item: BudgetItemType;
    darkMode: boolean;
    onToggleChecked: (id: string) => void;
    onEdit: (id: string, description: string, amount: number, group?: string, isIncome?: boolean) => void;
    onDelete: (id: string) => void;
    formatCurrency: (amount: number) => string;
    getCategoryColor: (amount: number, darkMode: boolean) => string;
    currency: CurrencyType;
    groups?: ExpenseGroup[];
    isUngrouped: boolean;
    onMoveToGroup: (itemId: string, groupId: string) => void;
}

const BudgetItem = ({
                        item,
                        darkMode,
                        onToggleChecked,
                        onEdit,
                        onDelete,
                        formatCurrency,
                        getCategoryColor,
                        currency,
                        groups = [],
                        isUngrouped,
                        onMoveToGroup,
                    }: BudgetItemProps) => {
    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(item.description);
    const [editAmount, setEditAmount] = useState(item.amount.toString());
    const [editGroup, setEditGroup] = useState(item.group || "");
    const [editIsIncome, setEditIsIncome] = useState(item.isIncome || false);

    // State for expanded description
    const [isExpanded, setIsExpanded] = useState(false);

    // State for dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});

    // State for mobile detection
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Toggle dropdown with different positioning for mobile vs desktop
    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        const buttonElement = event.currentTarget as HTMLElement;
        const rect = buttonElement.getBoundingClientRect();

        if (isMobile) {
            setDropdownPosition({
                top: rect.bottom + 5,
                left: Math.max(10, rect.left - 100),
            });
        } else {
            setDropdownPosition({
                top: rect.bottom + 5,
                left: rect.right - 120,
            });
        }

        setIsDropdownOpen(!isDropdownOpen);
    };

    // Toggle description expansion
    const toggleExpansion = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Start editing
    const startEdit = () => {
        setEditDescription(item.description);
        setEditAmount(item.amount.toString());
        setEditGroup(item.group || "");
        setEditIsIncome(item.isIncome || false);
        setIsEditing(true);
        setIsDropdownOpen(false);
    };

    // Save edits
    const saveEdit = () => {
        if (editDescription.trim() === "" || isNaN(parseFloat(editAmount))) return;

        console.log("editGroup value:", editGroup);
        console.log("editGroup type:", typeof editGroup);
        console.log("editGroup === '':", editGroup === "");

        const groupToSave = editGroup === "" ? undefined : editGroup;
        console.log("Group to save:", groupToSave);

        onEdit(item.id, editDescription, parseFloat(editAmount), groupToSave, editIsIncome);
        setIsEditing(false);
    };

    // Cancel editing
    const cancelEdit = () => {
        setIsEditing(false);
    };

    // Check if description is long enough to need expansion on mobile
    const isLongDescription = item.description.length > 20;

    // Get the color class for the amount tag - updated for income items
    const getItemColor = () => {
        if (item.isIncome) {
            return darkMode ? "bg-green-800 text-green-200" : "bg-green-100 text-green-800";
        }
        return getCategoryColor(item.amount, darkMode);
    };

    // Format amount with + for income items
    const formatAmount = (amount: number) => {
        const formatted = formatCurrency(amount);
        return item.isIncome ? `+${formatted}` : formatted;
    };

// In BudgetItem.tsx, update the editing form section:

    if (isEditing) {
        return (
            <div className="p-4 space-y-3">
                {/* Income Toggle in Edit Mode */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={editIsIncome}
                            onChange={(e) => setEditIsIncome(e.target.checked)}
                            className="h-4 w-4 rounded text-green-600 focus:ring-green-500"
                        />
                        <span className={`text-sm ${editIsIncome ? 'text-green-600' : ''}`}>
                        {editIsIncome ? "This is income" : "This is an expense"}
                    </span>
                    </label>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${
                            darkMode
                                ? "bg-gray-800 text-white border-gray-600"
                                : "bg-white text-gray-900 border-gray-300"
                        } border focus:outline-none focus:ring-2 ${
                            editIsIncome ? "focus:ring-green-500" : "focus:ring-indigo-500"
                        }`}
                    />
                </div>

                {/* Amount and Group - Conditional Grid */}
                <div className={`grid gap-3 ${editIsIncome ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <div className="relative">
                        <span className="absolute left-3 top-2">
                            {currencies[currency].symbol}
                        </span>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className={`w-full pl-8 pr-3 py-2 rounded-lg ${
                                    darkMode
                                        ? "bg-gray-800 text-white border-gray-600"
                                        : "bg-white text-gray-900 border-gray-300"
                                } border focus:outline-none focus:ring-2 ${
                                    editIsIncome ? "focus:ring-green-500" : "focus:ring-indigo-500"
                                }`}
                            />
                        </div>
                    </div>

                    {/* Only show group selector for expenses */}
                    {!editIsIncome && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Group</label>
                            <select
                                value={editGroup}
                                onChange={(e) => setEditGroup(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg ${
                                    darkMode
                                        ? "bg-gray-800 text-white border-gray-600"
                                        : "bg-white text-gray-900 border-gray-300"
                                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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

                {/* Action buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={cancelEdit}
                        className={`px-4 py-2 rounded-lg ${
                            darkMode
                                ? "bg-gray-600 hover:bg-gray-500 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveEdit}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            editIsIncome
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }

    // Mobile layout
    if (isMobile) {
        return (
            <div className="p-3 grid grid-cols-12 items-center border-b border-gray-700">
                {/* Checkbox */}
                <div className="col-span-1">
                    <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleChecked(item.id)}
                        className="h-5 w-5 rounded"
                    />
                </div>

                {/* Description - truncated for long text */}
                <div className="col-span-7">
                    <div
                        className={`${item.checked ? "line-through " : ""} ${
                            isLongDescription && !isExpanded ? "truncate" : ""
                        }`}
                        onClick={isLongDescription ? toggleExpansion : undefined}
                        title={isLongDescription ? item.description : ""}
                    >
                        {item.description}
                    </div>
                    {isLongDescription && isExpanded && (
                        <div className="text-xs text-gray-400 mt-0.5">Tap to collapse</div>
                    )}
                </div>

                {/* Amount */}
                <div className="col-span-3 flex justify-end pr-2">
                    <div className={`py-1 px-2 rounded-full text-center ${getItemColor()}`}>
                        {formatAmount(item.amount)}
                    </div>
                </div>

                {/* Menu button */}
                <div className="col-span-1 flex justify-center">
                    <button
                        onClick={toggleDropdown}
                        className={`p-1 rounded-full ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                    >
                        •••
                    </button>
                    <DropdownMenu
                        isOpen={isDropdownOpen}
                        onClose={() => setIsDropdownOpen(false)}
                        position={dropdownPosition}
                        darkMode={darkMode}
                        onEdit={startEdit}
                        onDelete={() => onDelete(item.id)}
                        groups={groups}
                        onMoveToGroup={onMoveToGroup}
                        isUngrouped={isUngrouped}
                        itemId={item.id}
                        isIncome={item.isIncome || false}
                    />
                </div>
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="p-4 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1">
                <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggleChecked(item.id)}
                    className="h-5 w-5 rounded"
                />
            </div>
            <div className="col-span-6 md:col-span-8">
                <div className={`${item.checked ? "line-through" : ""}`}>
                    {item.description}
                </div>
            </div>
            <div
                className={`col-span-3 md:col-span-2 py-1 px-2 rounded-full text-center ${getItemColor()}`}
            >
                {formatAmount(item.amount)}
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-end">
                <div className="dropdown relative">
                    <button
                        onClick={toggleDropdown}
                        className={`dropdown-toggle p-1 rounded-full ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                    >
                        •••
                    </button>
                    <DropdownMenu
                        isOpen={isDropdownOpen}
                        onClose={() => setIsDropdownOpen(false)}
                        position={dropdownPosition}
                        darkMode={darkMode}
                        onEdit={startEdit}
                        onDelete={() => onDelete(item.id)}
                        groups={groups}
                        onMoveToGroup={onMoveToGroup}
                        isUngrouped={isUngrouped}
                        itemId={item.id}
                        isIncome={item.isIncome || false}
                    />
                </div>
            </div>
        </div>
    );
};

export default BudgetItem;