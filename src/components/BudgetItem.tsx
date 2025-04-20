import { useState } from "react";
import DropdownMenu from "./DropdownMenu";

// Define the BudgetItem interface
export interface BudgetItemType {
  id: string;
  description: string;
  amount: number;
  checked: boolean;
  category?: string;
}

interface BudgetItemProps {
  item: BudgetItemType;
  darkMode: boolean;
  onToggleChecked: (id: string) => void;
  onEdit: (id: string, description: string, amount: number) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getCategoryColor: (amount: number, darkMode: boolean) => string;
}

const BudgetItem = ({
  item,
  darkMode,
  onToggleChecked,
  onEdit,
  onDelete,
  formatCurrency,
  getCategoryColor,
}: BudgetItemProps) => {
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(item.description);
  const [editAmount, setEditAmount] = useState(item.amount.toString());

  // State for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Toggle dropdown with improved positioning
  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const buttonElement = event.currentTarget as HTMLElement;
    const rect = buttonElement.getBoundingClientRect();

    // Position dropdown to the left on mobile to prevent overflow
    setDropdownPosition({
      top: rect.bottom + 5,
      left: Math.max(10, rect.left - 100), // Ensure it stays at least 10px from left edge
    });

    setIsDropdownOpen(!isDropdownOpen);
  };

  // Start editing
  const startEdit = () => {
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  // Save edits
  const saveEdit = () => {
    if (editDescription.trim() === "" || isNaN(parseFloat(editAmount))) return;

    onEdit(item.id, editDescription, parseFloat(editAmount));
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 flex flex-wrap items-center">
        <div className="w-full sm:w-2/3 mb-2 sm:mb-0 sm:pr-2">
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={`w-full px-2 py-1 text-sm rounded-lg ${
              darkMode
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          />
        </div>
        <div className="w-2/3 sm:w-1/4">
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-xs">R</span>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className={`w-full pl-5 pr-1 py-1 text-sm rounded-lg ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            />
          </div>
        </div>
        <div className="w-1/3 sm:w-1/12 flex justify-end gap-1">
          <button
            onClick={saveEdit}
            className="p-1 rounded-lg bg-green-600 text-white text-sm"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="p-1 rounded-lg bg-gray-600 text-white text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-gray-700">
      {/* Main container with fixed layout */}
      <div className="flex items-center">
        {/* Fixed-width section for checkbox */}
        <div className="w-10 flex-none">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggleChecked(item.id)}
            className="h-5 w-5 rounded"
          />
        </div>

        {/* Flex container for description and amount to ensure alignment */}
        <div className="flex flex-grow justify-between items-center">
          {/* Description with max width to allow truncation */}
          <div className="mr-2 max-w-[calc(100%-110px)]">
            <div
              className={`${
                item.checked ? "line-through " : ""
              }text-sm truncate`}
            >
              {item.description}
            </div>
          </div>

          {/* Fixed-width container for amount */}
          <div className="flex-none w-[90px]">
            <div
              className={`py-1 px-2 rounded-full text-center text-sm ${getCategoryColor(
                item.amount,
                darkMode
              )}`}
            >
              {formatCurrency(item.amount)}
            </div>
          </div>
        </div>

        {/* Fixed-width for menu button */}
        <div className="w-8 flex-none text-center ml-1">
          <button
            onClick={toggleDropdown}
            className={`w-full p-1 rounded-full ${
              darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
            }`}
            aria-label="Options"
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
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetItem;
