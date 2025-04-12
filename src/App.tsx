import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./index.css"; // For Tailwind styles

// Import the separated components
import AppHeader from "./components/AppHeader";
import ProgressBar from "./components/ProgressBar";
import MonthSelector from "./components/MonthSelector";
import CopyMonthDialog from "./components/CopyMonthDialog";
import WelcomeModal from "./components/WelcomeModal";
import IncomeEditor from "./components/IncomeEditor";

// Import utilities
import { formatCurrency, getCategoryColor, loadFromLocalStorage, getMonths } from "./utils";

// Define TypeScript interfaces
interface BudgetItem {
  id: string;
  description: string;
  amount: number;
  checked: boolean;
  category?: string;
}

// Create dropdown menu props interface
interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  darkMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Portal-based dropdown component
const DropdownMenu = ({
  isOpen,
  onClose,
  position,
  darkMode,
  onEdit,
  onDelete,
}: DropdownMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate position
  const style = {
    position: "fixed",
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    minWidth: "120px",
  } as React.CSSProperties;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className={`py-2 rounded-lg shadow-lg ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className={`block w-full text-left px-4 py-2 text-sm ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`block w-full text-left px-4 py-2 text-sm text-red-500 ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        Delete
      </button>
    </div>,
    document.body
  );
};

const BudgetApp = () => {
  // Check if this is the first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);

  // Initialize state with data from localStorage
  const {
    isFirstVisit: initialFirstVisit,
    darkMode: initialDarkMode,
    month: initialMonth,
    items: initialItems,
    income: initialIncome,
  } = loadFromLocalStorage();

  // State for dropdowns
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // State for dark mode (initialize from localStorage)
  const [darkMode, setDarkMode] = useState(initialDarkMode);

  // Copy function
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  // For the footer
  const [displayText, setDisplayText] = useState("");
  const phrases = [
    "Budget wisely, live fully",
    "Track expenses, find freedom",
    "Your money, your control",
    "Financial clarity by design",
  ];

  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Use refs to persist values between renders without causing re-renders
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const pauseTime = useRef(0);

  // Typewriter animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // slightly over half a second for blink

    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter animation with ULTRA slow timing
  useEffect(() => {
    // MUCH slower typing - between 300-400ms
    const getRandomTypingDelay = () => Math.floor(Math.random() * 100) + 300;

    // EXTREMELY slower deletion - between 450-650ms per character
    const getRandomDeletionDelay = () => Math.floor(Math.random() * 200) + 450;

    const type = () => {
      const currentPhrase = phrases[phraseIndex.current];

      // Handle pausing between actions
      if (pauseTime.current > 0) {
        pauseTime.current -= 1;
        setTimeout(type, 100);
        return;
      }

      // Handle deletion - EXTREMELY SLOW
      if (isDeleting.current) {
        setDisplayText(currentPhrase.substring(0, charIndex.current - 1));
        charIndex.current -= 1;

        // When deletion is complete
        if (charIndex.current === 0) {
          isDeleting.current = false;
          phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
          pauseTime.current = 40; // 4 second pause before starting new phrase
          setIsTyping(false);

          // Longer pause before starting to type new phrase
          setTimeout(() => {
            setIsTyping(true);
          }, 4000);
        }

        // Extremely slower deletion speed
        setTimeout(type, getRandomDeletionDelay());
      }
      // Handle typing
      else {
        if (charIndex.current < currentPhrase.length) {
          setDisplayText(currentPhrase.substring(0, charIndex.current + 1));
          charIndex.current += 1;

          // If typing is complete
          if (charIndex.current === currentPhrase.length) {
            pauseTime.current = 70; // 7 second pause at end of phrase
            setTimeout(() => {
              isDeleting.current = true;
            }, 7000);
          }
        }

        setTimeout(type, getRandomTypingDelay());
      }
    };

    // Only run the effect if we're in typing mode
    if (isTyping) {
      const typeTimer = setTimeout(type, 200); // Slower initial start
      return () => clearTimeout(typeTimer);
    }
  }, [displayText, isTyping]);

  // State for current month (initialize from localStorage)
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // State for budget items (initialize from localStorage)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialItems);

  // State for income (initialize from localStorage)
  const [currentIncome, setCurrentIncome] = useState<number>(initialIncome);

  // State for new item form
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");

  // State for dropdown menu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Ref for tracking dropdown button elements
  const dropdownButtonsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Save to localStorage when states change
  useEffect(() => {
    localStorage.setItem("budgetAppDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("budgetAppCurrentMonth", currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    const monthItemsKey = `budgetAppItems-${currentMonth}`;
    localStorage.setItem(monthItemsKey, JSON.stringify(budgetItems));
  }, [budgetItems, currentMonth]);

  // Save income per month to localStorage
  useEffect(() => {
    const monthIncomeKey = `budgetAppIncome-${currentMonth}`;
    localStorage.setItem(monthIncomeKey, JSON.stringify(currentIncome));
  }, [currentIncome, currentMonth]);

  // Show welcome modal on first visit
  useEffect(() => {
    if (initialFirstVisit) {
      setShowWelcomeModal(true);
      // We'll mark as visited after they close the welcome modal
    }
  }, [initialFirstVisit]);

  // Handle welcome modal close
  const handleWelcomeClose = (income: number) => {
    setCurrentIncome(income);
    setShowWelcomeModal(false);
    localStorage.setItem("budgetAppVisited", "true");
  };

  // Handle income editor close
  const handleIncomeEditorClose = (income: number | null) => {
    if (income !== null) {
      setCurrentIncome(income);
    }
    setShowIncomeEditor(false);
  };

  // Custom function to handle month changes
  const handleMonthChange = (newMonth: string) => {
    // First, save current items to the current month's storage
    const currentMonthKey = `budgetAppItems-${currentMonth}`;
    localStorage.setItem(currentMonthKey, JSON.stringify(budgetItems));

    // Save current month's income
    const currentIncomeKey = `budgetAppIncome-${currentMonth}`;
    localStorage.setItem(currentIncomeKey, JSON.stringify(currentIncome));

    // Then update the current month
    setCurrentMonth(newMonth);

    // Load items for the new month
    const newMonthKey = `budgetAppItems-${newMonth}`;
    const savedItems = localStorage.getItem(newMonthKey);

    if (savedItems) {
      setBudgetItems(JSON.parse(savedItems));
    } else {
      // If no items exist for the new month yet, initialize with empty array
      setBudgetItems([]);
    }

    // Load income for the new month
    const newIncomeKey = `budgetAppIncome-${newMonth}`;
    const savedIncome = localStorage.getItem(newIncomeKey);

    if (savedIncome) {
      setCurrentIncome(JSON.parse(savedIncome));
    } else {
      // If no income exists for the new month, use current month's income as default
      setCurrentIncome(currentIncome);
      localStorage.setItem(newIncomeKey, JSON.stringify(currentIncome));
    }
  };

  const months = getMonths();

  const copyMonthExpenses = (fromMonth: string, toMonth: string): void => {
    // Load source month data
    const sourceMonthKey = `budgetAppItems-${fromMonth}`;
    const savedSourceItems = localStorage.getItem(sourceMonthKey);

    if (!savedSourceItems) {
      console.error(`No data found for month: ${fromMonth}`);
      return;
    }

    // Parse source items
    const sourceItems = JSON.parse(savedSourceItems) as BudgetItem[];

    // Load target month data
    const targetMonthKey = `budgetAppItems-${toMonth}`;
    let targetItems: BudgetItem[] = [];

    const savedTargetItems = localStorage.getItem(targetMonthKey);
    if (savedTargetItems) {
      targetItems = JSON.parse(savedTargetItems) as BudgetItem[];
    }

    // Create new IDs for the copied items to avoid conflicts
    const copiedItems = sourceItems.map((item) => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      checked: false, // Reset the checked state for the new month
    }));

    // Combine existing items with copied items
    const updatedItems = [...targetItems, ...copiedItems];

    // Save to target month
    localStorage.setItem(targetMonthKey, JSON.stringify(updatedItems));

    // If the current month is the target month, update the state
    if (currentMonth === toMonth) {
      setBudgetItems(updatedItems);
    }
  };

  // Calculate total budget and used budget
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const usedBudget = budgetItems
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  // Use the dynamic income instead of the hardcoded value
  const remainingBudget = currentIncome - totalBudget;

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle dropdown menu
  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    // Stop the event from propagating
    event.stopPropagation();
    event.preventDefault();

    // Save the button reference
    const buttonElement = event.currentTarget as HTMLElement;
    dropdownButtonsRef.current.set(id, buttonElement);

    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      // Calculate the dropdown position
      const rect = buttonElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.right - 120, // Align right edge with button
      });
      setOpenDropdownId(id);
    }
  };

  // Add new budget item
  const addBudgetItem = () => {
    if (newDescription.trim() === "" || isNaN(parseFloat(newAmount))) return;

    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: newDescription,
      amount: parseFloat(newAmount),
      checked: false,
    };

    setBudgetItems([...budgetItems, newItem]);
    setNewDescription("");
    setNewAmount("");
    setShowAddForm(false);
  };

  // Delete budget item
  const deleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
    setOpenDropdownId(null);
  };

  // Start editing an item
  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
    setOpenDropdownId(null); // Close dropdown when editing starts
  };

  // Save edits
  const saveEdit = () => {
    if (
      editingId === null ||
      editDescription.trim() === "" ||
      isNaN(parseFloat(editAmount))
    )
      return;

    setBudgetItems(
      budgetItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              description: editDescription,
              amount: parseFloat(editAmount),
            }
          : item
      )
    );

    setEditingId(null);
    setEditDescription("");
    setEditAmount("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription("");
    setEditAmount("");
  };

  // Toggle checkbox
  const toggleChecked = (id: string) => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Apply dark mode classes to body
  useEffect(() => {
    document.body.classList.toggle("dark-bg", darkMode);
    return () => {
      document.body.classList.remove("dark-bg");
    };
  }, [darkMode]);

  // Display progress of budget spent vs total budget
  const budgetProgress = Math.round((usedBudget / totalBudget) * 100) || 0;

  // Sort budget items from biggest to smallest
const sortedBudgetItems = [...budgetItems].sort((a, b) => b.amount - a.amount);

  return (
    <div
      className={`min-h-screen flex justify-center items-center p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        darkMode={darkMode}
        defaultIncome={currentIncome}
      />

      {/* Income Editor Modal */}
      <IncomeEditor
        isOpen={showIncomeEditor}
        onClose={handleIncomeEditorClose}
        currentIncome={currentIncome}
        darkMode={darkMode}
        month={currentMonth}
      />

      <div
        className={`w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 shadow-indigo-900/20"
            : "bg-white shadow-indigo-200/50"
        }`}
      >
        {/* Header */}
        <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Month selector - now using the imported component */}
        <MonthSelector
          currentMonth={currentMonth}
          setCurrentMonth={handleMonthChange}
          darkMode={darkMode}
          onCopyClick={() => setShowCopyDialog(true)}
        />

        {/* Copy Month Dialog - using the imported component */}
        <CopyMonthDialog
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
          months={months}
          currentMonth={currentMonth}
          darkMode={darkMode}
          onCopy={copyMonthExpenses}
        />

        {/* Summary Cards */}
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
              onClick={() => setShowIncomeEditor(true)}
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

        {/* Budget Items */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Expenses</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                darkMode
                  ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {showAddForm ? "Cancel" : "+ Add Expense"}
            </button>
          </div>

          {/* Add new item form */}
          {showAddForm && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Car Payment"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? "bg-gray-800 text-white border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2">R</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-800 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={addBudgetItem}
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
          )}

          {/* Budget items list */}
          <div
            className={`rounded-xl overflow-hidden ${
              darkMode ? "bg-gray-700/50" : "bg-white shadow"
            }`}
          >
            {sortedBudgetItems.map((item) => (
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
                {editingId === item.id ? (
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
                        <span className="absolute left-3 top-2">R</span>
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
                    <div className="col-span-3 md:col-span-2 flex justify-end gap-1">
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
                ) : (
                  <div className="p-4 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecked(item.id)}
                        className="h-5 w-5 rounded"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-8">
                      <div className={item.checked ? "line-through" : ""}>
                        {item.description}
                      </div>
                    </div>
                    <div
                      className={`col-span-3 md:col-span-2 py-1 px-2 rounded-full text-center ${getCategoryColor(
                        item.amount,
                        darkMode
                      )}`}
                    >
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <div className="dropdown relative">
                        <button
                          onClick={(e) => toggleDropdown(item.id, e)}
                          className={`dropdown-toggle p-1 rounded-full ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                          }`}
                        >
                          •••
                        </button>
                        <DropdownMenu
                          isOpen={openDropdownId === item.id}
                          onClose={() => setOpenDropdownId(null)}
                          position={dropdownPosition}
                          darkMode={darkMode}
                          onEdit={() => {
                            startEdit(item);
                            setOpenDropdownId(null);
                          }}
                          onDelete={() => {
                            deleteBudgetItem(item.id);
                            setOpenDropdownId(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {sortedBudgetItems.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-lg opacity-70">No expenses added yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
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
        </div>

{/* Budget progress */}
<ProgressBar 
  label="Budget Usage"
  value={totalBudget}
  max={currentIncome}
  color={totalBudget > currentIncome
    ? "bg-red-500"
    : totalBudget > currentIncome * 0.9
    ? "bg-yellow-500"
    : "bg-green-500"}
  darkMode={darkMode}
/>

{/* Expenses Progress */}
<ProgressBar
  label="Expenses Paid"
  value={budgetProgress}
  darkMode={darkMode}
/>

        {/* Footer */}
        <div
          className={`p-4 text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="h-6 min-h-6 flex items-center justify-center">
              <p className="font-mono tracking-wide">
                {displayText}
                {/* This span is using the showCursor state */}
                <span
                  className={`${
                    showCursor ? "opacity-100" : "opacity-0"
                  } transition-opacity ml-0.5`}
                >
                  |
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <a
                href="https://andresmit.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium ${
                  darkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                } transition-colors`}
              >
                andresmit.co.za
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetApp;
