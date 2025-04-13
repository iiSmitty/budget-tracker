import { useState, useEffect } from "react";
import "./index.css"; // For Tailwind styles

// Import components
import AppHeader from "./components/AppHeader";
import MonthSelector from "./components/MonthSelector";
import CopyMonthDialog from "./components/CopyMonthDialog";
import WelcomeModal from "./components/WelcomeModal";
import IncomeEditor from "./components/IncomeEditor";
import BudgetSummary from "./components/BudgetSummary";
import AddExpenseForm from "./components/AddExpenseForm";
import BudgetItemList from "./components/BudgetItemList";
import ProgressBar from "./components/ProgressBar";
import AnimatedFooter from "./components/AnimatedFooter";
import DataBackup from "./components/DataBackup";

// Import utilities
import { formatCurrency, getCategoryColor, loadFromLocalStorage, getMonths } from "./utils/utils";

// Define TypeScript interfaces
interface BudgetItem {
  id: string;
  description: string;
  amount: number;
  checked: boolean;
  category?: string;
}

const BudgetApp = () => {
  // Initialize state with data from localStorage
  const loadStoredData = () => {
    return loadFromLocalStorage();
  };

  const {
    isFirstVisit: initialFirstVisit,
    darkMode: initialDarkMode,
    month: initialMonth,
    items: initialItems,
    income: initialIncome,
  } = loadStoredData();

  // State for dark mode (initialize from localStorage)
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  
  // State for modals
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // State for current month (initialize from localStorage)
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // State for budget items (initialize from localStorage)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialItems);

  // State for income (initialize from localStorage)
  const [currentIncome, setCurrentIncome] = useState<number>(initialIncome);

  // Get all months
  const months = getMonths();

  // Function to handle data import - reload all state from localStorage
  const handleDataImported = () => {
    const freshData = loadStoredData();
    setDarkMode(freshData.darkMode);
    setCurrentMonth(freshData.month);
    setBudgetItems(freshData.items);
    setCurrentIncome(freshData.income);
  };

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
    }
  }, [initialFirstVisit]);

  // Apply dark mode classes to body
  useEffect(() => {
    document.body.classList.toggle("dark-bg", darkMode);
    return () => {
      document.body.classList.remove("dark-bg");
    };
  }, [darkMode]);

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Add new budget item
  const addBudgetItem = (description: string, amount: number) => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description,
      amount,
      checked: false,
    };

    setBudgetItems([...budgetItems, newItem]);
    setShowAddForm(false);
  };

  // Delete budget item
  const deleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
  };

  // Edit budget item
  const editBudgetItem = (id: string, description: string, amount: number) => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === id
          ? {
              ...item,
              description,
              amount,
            }
          : item
      )
    );
  };

  // Toggle checkbox
  const toggleChecked = (id: string) => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Calculate total budget and used budget
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const usedBudget = budgetItems
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  // Calculate remaining budget
  const remainingBudget = currentIncome - totalBudget;

  // Get appropriate color for budget usage
  const getBudgetUsageColor = () => {
    if (totalBudget > currentIncome) return "bg-red-500";
    if (totalBudget > currentIncome * 0.9) return "bg-yellow-500";
    return "bg-green-500";
  };

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

        {/* Month selector */}
        <MonthSelector
          currentMonth={currentMonth}
          setCurrentMonth={handleMonthChange}
          darkMode={darkMode}
          onCopyClick={() => setShowCopyDialog(true)}
        />

        {/* Copy Month Dialog */}
        <CopyMonthDialog
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
          months={months}
          currentMonth={currentMonth}
          darkMode={darkMode}
          onCopy={copyMonthExpenses}
        />

        {/* Summary Cards */}
        <BudgetSummary
          totalBudget={totalBudget}
          currentIncome={currentIncome}
          remainingBudget={remainingBudget}
          darkMode={darkMode}
          formatCurrency={formatCurrency}
          onEditIncome={() => setShowIncomeEditor(true)}
        />

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
            <AddExpenseForm
              darkMode={darkMode}
              onAddExpense={addBudgetItem}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Budget items list */}
          <BudgetItemList
            items={budgetItems}
            darkMode={darkMode}
            onToggleChecked={toggleChecked}
            onEditItem={editBudgetItem}
            onDeleteItem={deleteBudgetItem}
            formatCurrency={formatCurrency}
            getCategoryColor={getCategoryColor}
            onAddFirstExpense={() => setShowAddForm(true)}
          />
        </div>

        {/* Budget progress */}
        <ProgressBar
          label="Budget Usage"
          value={totalBudget}
          max={currentIncome}
          color={getBudgetUsageColor()}
          darkMode={darkMode}
        />

        {/* Expenses Progress */}
        <ProgressBar
          label="Expenses Paid"
          value={usedBudget}
          max={totalBudget}
          color="bg-blue-500"
          darkMode={darkMode}
        />

        {/* Data Backup Component */}
        <div className="px-4 pb-4">
          <DataBackup 
            darkMode={darkMode} 
            onDataImported={handleDataImported} 
          />
        </div>

        {/* Footer */}
        <AnimatedFooter darkMode={darkMode} />
      </div>
    </div>
  );
};

export default BudgetApp;