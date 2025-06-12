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
import ImportExportInfoModal from "./components/ImportExportInfoModal";
import ExpenseGroupManager from "./components/ExpenseGroupManager";
import { BudgetItemType, ExpenseGroup } from "./types/budget";

// Import utilities
import {
  formatCurrency,
  getCategoryColor,
  loadFromLocalStorage,
  getMonths,
  CurrencyType,
} from "./utils/utils";

import {
  loadGroupsFromStorage,
  saveGroupsToStorage,
  createExpenseGroup,
  updateGroupCollapse,
  deleteExpenseGroup,
  editExpenseGroup,
  removeGroupFromItems,
  migrateToGroupedData,
} from "./utils/groupUtils";

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
    currency: initialCurrencyString,
    groups: initialGroups,
  } = loadStoredData();

  // State for dark mode (initialize from localStorage)
  const [darkMode, setDarkMode] = useState(initialDarkMode);

  // State for modals
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>(initialGroups);
  const [showGroupManager, setShowGroupManager] = useState(false);

  // State for current month (initialize from localStorage)
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // State for budget items (initialize from localStorage)
  const [budgetItems, setBudgetItems] = useState<BudgetItemType[]>(initialItems);

  // State for income (initialize from localStorage)
  const [currentIncome, setCurrentIncome] = useState<number>(initialIncome);

  // Assert the type explicitly
  const initialCurrency = initialCurrencyString as CurrencyType;

  // State for currency (initialize from localStorage)
  const [currency, setCurrency] = useState<CurrencyType>(initialCurrency);

  // Get all months
  const months = getMonths();

  // Function to handle data import - reload all state from localStorage
  const handleDataImported = () => {
    // Get the current month first (either from localStorage or use current month)
    const savedMonth = localStorage.getItem("budgetAppCurrentMonth");
    const systemMonth = new Date().toLocaleString("default", { month: "long" });
    const monthToUse = savedMonth || systemMonth;

    console.log("Loading data for month:", monthToUse);

    // Update current month state
    setCurrentMonth(monthToUse);

    // Load income for this month
    const monthIncomeKey = `budgetAppIncome-${monthToUse}`;
    const savedIncome = localStorage.getItem(monthIncomeKey);

    if (savedIncome) {
      const parsedIncome = JSON.parse(savedIncome);
      console.log("Setting income to:", parsedIncome);
      setCurrentIncome(parsedIncome);
    }

    // Load items for this month
    const monthItemsKey = `budgetAppItems-${monthToUse}`;
    const savedItems = localStorage.getItem(monthItemsKey);

    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setBudgetItems(parsedItems);
    } else {
      setBudgetItems([]);
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("budgetAppDarkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Load currency preference
    const savedCurrency = localStorage.getItem("budgetAppCurrency");
    if (savedCurrency) {
      console.log("Setting currency to:", savedCurrency);
      setCurrency(savedCurrency as CurrencyType);
    }

    // Load groups preference
    const groups = loadGroupsFromStorage(monthToUse);
    setExpenseGroups(groups);

    // Check and show import/export modal for first-time users who imported
    const hasSeenModal = localStorage.getItem("budgetAppImportExportInfoSeen");
    if (hasSeenModal !== "true") {
      setShowWelcomeModal(false); // Ensure welcome modal is closed
      setShowImportExportModal(true); // Show import/export modal
    }
  };

  const handleIncomeEditorClose = (income: number | null) => {
    if (income !== null) {
      setCurrentIncome(income);
    }
    setShowIncomeEditor(false);
  };

  // Handle currency changes
  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    localStorage.setItem("budgetAppCurrency", newCurrency);
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

  // Load groups when month changes
  useEffect(() => {
    // Only run migration, don't reload groups since they're already loaded from initialization
    migrateToGroupedData(currentMonth);
  }, [currentMonth]);

// Save groups when they change
  useEffect(() => {
    saveGroupsToStorage(currentMonth, expenseGroups);
  }, [expenseGroups, currentMonth]);

  useEffect(() => {
    console.log("Loading groups for month:", currentMonth);
    const groups = loadGroupsFromStorage(currentMonth);
    console.log("Loaded groups:", groups);
    setExpenseGroups(groups);
    migrateToGroupedData(currentMonth);
  }, [currentMonth]);

  // Handle welcome modal close
  const handleWelcomeClose = (income: number) => {
    setCurrentIncome(income);
    setShowWelcomeModal(false);
    localStorage.setItem("budgetAppVisited", "true");

    // Immediately check and show the import/export modal if needed
    const hasSeenImportExportModal = localStorage.getItem(
      "budgetAppImportExportInfoSeen"
    );
    if (hasSeenImportExportModal !== "true") {
      setShowImportExportModal(true);
    }
  };

  // Custom function to handle month changes
  const handleMonthChange = (newMonth: string) => {
    // First, save current items to the current month's storage
    const currentMonthKey = `budgetAppItems-${currentMonth}`;
    localStorage.setItem(currentMonthKey, JSON.stringify(budgetItems));

    // Save current month's income
    const currentIncomeKey = `budgetAppIncome-${currentMonth}`;
    localStorage.setItem(currentIncomeKey, JSON.stringify(currentIncome));

    // Save current month's groups
    saveGroupsToStorage(currentMonth, expenseGroups);

    // Then update the current month
    setCurrentMonth(newMonth);

    // Load items for the new month
    const newMonthKey = `budgetAppItems-${newMonth}`;
    const savedItems = localStorage.getItem(newMonthKey);

    if (savedItems) {
      setBudgetItems(JSON.parse(savedItems));
    } else {
      setBudgetItems([]);
    }

    // Load income for the new month
    const newIncomeKey = `budgetAppIncome-${newMonth}`;
    const savedIncome = localStorage.getItem(newIncomeKey);

    if (savedIncome) {
      setCurrentIncome(JSON.parse(savedIncome));
    } else {
      setCurrentIncome(currentIncome);
      localStorage.setItem(newIncomeKey, JSON.stringify(currentIncome));
    }

    // Load groups for the new month
    const newMonthGroups = loadGroupsFromStorage(newMonth);
    setExpenseGroups(newMonthGroups);
    migrateToGroupedData(newMonth);
  };

  const copyMonthExpenses = (fromMonth: string, toMonth: string): void => {
    // Load source month data (items AND groups)
    const sourceMonthKey = `budgetAppItems-${fromMonth}`;
    const sourceGroupsKey = `budgetAppGroups-${fromMonth}`;

    const savedSourceItems = localStorage.getItem(sourceMonthKey);
    const savedSourceGroups = localStorage.getItem(sourceGroupsKey);

    if (!savedSourceItems && !savedSourceGroups) {
      console.error(`No data found for month: ${fromMonth}`);
      return;
    }

    // Parse source data
    const sourceItems = savedSourceItems ? JSON.parse(savedSourceItems) as BudgetItemType[] : [];
    const sourceGroups = savedSourceGroups ? JSON.parse(savedSourceGroups) as ExpenseGroup[] : [];

    // Load target month data
    const targetMonthKey = `budgetAppItems-${toMonth}`;
    const targetGroupsKey = `budgetAppGroups-${toMonth}`;

    let targetItems: BudgetItemType[] = [];
    let targetGroups: ExpenseGroup[] = [];

    const savedTargetItems = localStorage.getItem(targetMonthKey);
    const savedTargetGroups = localStorage.getItem(targetGroupsKey);

    if (savedTargetItems) {
      targetItems = JSON.parse(savedTargetItems) as BudgetItemType[];
    }

    if (savedTargetGroups) {
      targetGroups = JSON.parse(savedTargetGroups) as ExpenseGroup[];
    }

    // Create a mapping of old group IDs to new group IDs
    const groupIdMapping: Record<string, string> = {};

    // Copy groups and create new IDs to avoid conflicts
    const copiedGroups = sourceGroups.map((group) => {
      // Check if a group with the same name already exists in target month
      const existingGroup = targetGroups.find(tg => tg.name === group.name);

      if (existingGroup) {
        // Use existing group instead of creating duplicate
        groupIdMapping[group.id] = existingGroup.id;
        return null; // Don't add duplicate
      } else {
        // Create new group with new ID
        const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        groupIdMapping[group.id] = newGroupId;

        return {
          ...group,
          id: newGroupId,
          isCollapsed: false, // Reset collapse state for new month
        };
      }
    }).filter(Boolean) as ExpenseGroup[]; // Remove null values

    // Create new IDs for the copied items and update group references
    const copiedItems = sourceItems.map((item) => {
      const newItem: BudgetItemType = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        checked: false, // Reset the checked state for the new month
      };

      // Update group reference if item belongs to a group
      if (item.group && groupIdMapping[item.group]) {
        newItem.group = groupIdMapping[item.group];
      }

      return newItem;
    });

    // Combine existing data with copied data
    const updatedItems = [...targetItems, ...copiedItems];
    const updatedGroups = [...targetGroups, ...copiedGroups];

    // Save to target month
    localStorage.setItem(targetMonthKey, JSON.stringify(updatedItems));
    localStorage.setItem(targetGroupsKey, JSON.stringify(updatedGroups));

    // If the current month is the target month, update the state
    if (currentMonth === toMonth) {
      setBudgetItems(updatedItems);
      setExpenseGroups(updatedGroups);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Add new budget item
  const addBudgetItem = (description: string, amount: number, group?: string, isIncome?: boolean) => {
    const newItem: BudgetItemType = {
      id: Date.now().toString(),
      description,
      amount,
      checked: false,
      group,
      isIncome: isIncome || false,
    };

    setBudgetItems([...budgetItems, newItem]);
    setShowAddForm(false);
  };

  // Delete budget item
  const deleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
  };

  // Edit budget item
  const editBudgetItem = (id: string, description: string, amount: number, group?: string, isIncome?: boolean) => {
    console.log("Editing item:", id, "new group:", group, "isIncome:", isIncome);
    setBudgetItems(
        budgetItems.map((item) =>
            item.id === id
                ? { ...item, description, amount, group, isIncome: isIncome || false }
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

  // Calculate expenses and additional income separately
  const expenses = budgetItems.filter(item => !item.isIncome);
  const additionalIncomeItems = budgetItems.filter(item => item.isIncome);

  // Calculate total budget and used budget
  const totalBudget = expenses.reduce((sum, item) => sum + item.amount, 0);
  const additionalIncome = additionalIncomeItems.reduce((sum, item) => sum + item.amount, 0);

  const usedBudget = expenses
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.amount, 0);

  // Calculate total income and remaining budget
  const totalIncome = currentIncome + additionalIncome;
  const remainingBudget = totalIncome - totalBudget;

  // Get appropriate color for budget usage
  const getBudgetUsageColor = () => {
    const usagePercentage = (totalBudget / totalIncome) * 100;

    if (usagePercentage >= 100) return "bg-red-500";
    if (usagePercentage >= 95) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleCreateGroup = (groupName: string) => {
    const newGroup = createExpenseGroup(groupName);
    setExpenseGroups([...expenseGroups, newGroup]);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedItems = removeGroupFromItems(budgetItems, groupId);
    setBudgetItems(updatedItems);
    const updatedGroups = deleteExpenseGroup(expenseGroups, groupId);
    setExpenseGroups(updatedGroups);
  };

  const handleEditGroup = (groupId: string, newName: string) => {
    const updatedGroups = editExpenseGroup(expenseGroups, groupId, newName);
    setExpenseGroups(updatedGroups);
  };

  const handleUpdateGroupCollapse = (groupId: string, isCollapsed: boolean) => {
    const updatedGroups = updateGroupCollapse(expenseGroups, groupId, isCollapsed);
    setExpenseGroups(updatedGroups);
  };

// Move a single item to a group (for individual dropdown move)
  const handleMoveToGroup = (itemId: string, groupId: string) => {
    setBudgetItems(prevItems =>
        prevItems.map(item =>
            item.id === itemId
                ? { ...item, group: groupId }
                : item
        )
    );
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-center p-2 sm:p-4 md:p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        darkMode={darkMode}
        defaultIncome={currentIncome}
        onDataImported={handleDataImported}
      />

      {/* Income Editor Modal */}
      <IncomeEditor
        isOpen={showIncomeEditor}
        onClose={handleIncomeEditorClose}
        currentIncome={currentIncome}
        darkMode={darkMode}
        month={currentMonth}
      />

      {/* Import/Export Info Modal */}
      <ImportExportInfoModal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        darkMode={darkMode}
      />

      <div
        className={`w-full max-w-4xl rounded-lg md:rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
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
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
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
            currentIncome={totalIncome} // Pass total income (base + additional)
            remainingBudget={remainingBudget}
            darkMode={darkMode}
            formatCurrency={(amount) => formatCurrency(amount, currency)}
            onEditIncome={() => setShowIncomeEditor(true)}
        />

        {/* Budget Items */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Expenses</h2>
            <div className="flex gap-2">
              <button
                  onClick={() => setShowGroupManager(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                      darkMode
                          ? "bg-purple-700 hover:bg-purple-600 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
              >
                <span>📁</span>
                Groups
              </button>

              <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                      darkMode
                          ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
              >
                <span>{showAddForm ? "✕" : "+"}</span>
                {showAddForm ? "Cancel" : "Add Item"}
              </button>
            </div>
          </div>

          {/* Group Manager Modal */}
          <ExpenseGroupManager
              isOpen={showGroupManager}
              onClose={() => setShowGroupManager(false)}
              groups={expenseGroups}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onEditGroup={handleEditGroup}
              darkMode={darkMode}
          />

          {/* Add new item form */}
          {showAddForm && (
              <div className="mb-4">
                <AddExpenseForm
                    darkMode={darkMode}
                    onAddExpense={addBudgetItem}
                    onCancel={() => setShowAddForm(false)}
                    currency={currency}
                    groups={expenseGroups}
                />
              </div>
          )}

          {/* Budget items list */}
          <BudgetItemList
              items={budgetItems}
              groups={expenseGroups}
              darkMode={darkMode}
              onToggleChecked={toggleChecked}
              onEditItem={editBudgetItem}
              onDeleteItem={deleteBudgetItem}
              formatCurrency={(amount) => formatCurrency(amount, currency)}
              getCategoryColor={getCategoryColor}
              onAddFirstExpense={() => setShowAddForm(true)}
              currency={currency}
              onUpdateGroupCollapse={handleUpdateGroupCollapse}
              onMoveToGroup={handleMoveToGroup}
          />
        </div>

        {/* Budget progress */}
        <ProgressBar
            label="Budget Usage"
            value={totalBudget}
            max={totalIncome}
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
          <DataBackup darkMode={darkMode} onDataImported={handleDataImported} />
        </div>

        {/* Footer */}
        <AnimatedFooter darkMode={darkMode} />
      </div>
    </div>
  );
};

export default BudgetApp;
