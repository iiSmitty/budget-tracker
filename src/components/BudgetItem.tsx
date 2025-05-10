import { useState, useEffect } from "react";
import DropdownMenu from "./DropdownMenu";
import { CurrencyType, currencies } from "../utils/utils";

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
  currency: CurrencyType;
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
}: BudgetItemProps) => {
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(item.description);
  const [editAmount, setEditAmount] = useState(item.amount.toString());

  // State for expanded description
  const [isExpanded, setIsExpanded] = useState(false);

  // State for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
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
        left: Math.max(10, rect.left - 100), // Keep dropdown on screen
      });
    } else {
      // Use original desktop positioning
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.right - 120, // Align right edge with button
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

  // Check if description is long enough to need expansion on mobile
  const isLongDescription = item.description.length > 20;

  // Get the color class for the amount tag
  const colorClass = getCategoryColor(item.amount, darkMode);

  if (isEditing) {
    // Use original editing layout
    return (
      <div className="p-4 grid grid-cols-12 gap-2 items-center">
        <div className="col-span-6 md:col-span-7">
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
        <div className="col-span-3 md:col-span-3">
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
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>
        <div className="col-span-3 md:col-span-2 flex justify-end gap-2">
          <button
            onClick={saveEdit}
            className="p-2 rounded-lg bg-green-600 text-white"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="p-2 rounded-lg bg-gray-600 text-white"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout - now with improved tag display
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

        {/* Amount - specifically fixed for mobile */}
        <div className="col-span-3 flex justify-end pr-2">
          <div className={`py-1 px-2 rounded-full text-center ${colorClass}`}>
            {formatCurrency(item.amount)}
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
          />
        </div>
      </div>
    );
  }

  // Desktop layout - unchanged from original
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
        <div className={item.checked ? "line-through" : ""}>
          {item.description}
        </div>
      </div>
      <div
        className={`col-span-3 md:col-span-2 py-1 px-2 rounded-full text-center ${colorClass}`}
      >
        {formatCurrency(item.amount)}
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
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetItem;
