import { useState, useEffect, useRef } from "react";
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
import ClearMonthDialog from "./components/ClearMonthDialog";
import UndoToast from "./components/UndoToast";
import Button from "./components/ui/Button";
import { BudgetItemType, ExpenseGroup } from "./types/budget";

// Import utilities
import {
  currencies,
  formatCurrency,
  CurrencyType,
} from "./utils/utils";

import {
  createExpenseGroup,
  updateGroupCollapse,
  deleteExpenseGroup,
  editExpenseGroup,
  removeGroupFromItems,
} from "./utils/groupUtils";

import {
  ClearedMonth,
  describeClear,
  partitionItemsForClear,
  restoreClearedItems,
} from "./utils/clearMonth";

import { copyMonthContents } from "./utils/copyMonth";
import { MonthKey, formatMonth, getSelectableMonths } from "./utils/months";

import {
  MonthState,
  STORAGE_KEYS,
  hasMonthData,
  listStoredMonths,
  loadAppState,
  loadCurrency,
  loadCurrentMonth,
  loadDarkMode,
  loadMonthGroups,
  loadMonthItems,
  loadMonthState,
  saveCurrentMonth,
  saveMonthGroups,
  saveMonthIncome,
  saveMonthItems,
} from "./utils/storage";

const BudgetApp = () => {
  // Initialize state with data from localStorage (read once, on the first render)
  const [initialState] = useState(loadAppState);

  // State for dark mode (initialize from localStorage)
  const [darkMode, setDarkMode] = useState(initialState.darkMode);

  // State for modals
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>(initialState.groups);
  const [showGroupManager, setShowGroupManager] = useState(false);

  // State for clearing a month (and undoing the most recent clear)
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [lastClear, setLastClear] = useState<ClearedMonth | null>(null);

  // State for the month being viewed, as "YYYY-MM"
  const [currentMonth, setCurrentMonth] = useState<MonthKey>(initialState.month);

  // State for budget items (initialize from localStorage)
  const [budgetItems, setBudgetItems] = useState<BudgetItemType[]>(initialState.items);

  // State for income (initialize from localStorage)
  const [currentIncome, setCurrentIncome] = useState<number>(initialState.income);

  // State for currency (initialize from localStorage)
  const [currency, setCurrency] = useState<CurrencyType>(initialState.currency);

  // Months offered by the month picker and the copy dialog
  const selectableMonths = getSelectableMonths(listStoredMonths(), currentMonth);

  // A month on screen that has never been saved, with the state it was opened with. It's only
  // saved once something changes, so a month that has merely been looked at keeps inheriting
  // income and groups, and doesn't count as having data (in backups or the month picker).
  const unsavedMonthRef = useRef<(MonthState & { month: MonthKey }) | null>(
    initialState.monthHasData
      ? null
      : {
          month: initialState.month,
          items: initialState.items,
          income: initialState.income,
          groups: initialState.groups,
        }
  );

  // Show a month's data; the effect below saves it under that month once it changes
  const showMonth = (month: MonthKey, state: MonthState) => {
    unsavedMonthRef.current = hasMonthData(month) ? null : { month, ...state };
    setCurrentMonth(month);
    setBudgetItems(state.items);
    setCurrentIncome(state.income);
    setExpenseGroups(state.groups);
  };

  // Function to handle data import - reload all state from localStorage
  const handleDataImported = () => {
    // An import replaces data wholesale, so a pending "undo clear" no longer applies
    setLastClear(null);

    const month = loadCurrentMonth();
    showMonth(month, loadMonthState(month));
    setDarkMode(loadDarkMode());
    setCurrency(loadCurrency());

    // Check and show import/export modal for first-time users who imported
    const hasSeenModal = localStorage.getItem(STORAGE_KEYS.importExportInfoSeen);
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
    localStorage.setItem(STORAGE_KEYS.currency, newCurrency);
  };

  // Save to localStorage when states change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    saveCurrentMonth(currentMonth);
  }, [currentMonth]);

  // Save the month's items, income and groups together, so a saved month never ends up with
  // some parts stored and others still inherited
  useEffect(() => {
    const unsaved = unsavedMonthRef.current;
    const isUnchanged =
      unsaved !== null &&
      unsaved.month === currentMonth &&
      unsaved.items === budgetItems &&
      unsaved.income === currentIncome &&
      unsaved.groups === expenseGroups;
    if (isUnchanged) return;

    unsavedMonthRef.current = null;
    saveMonthItems(currentMonth, budgetItems);
    saveMonthIncome(currentMonth, currentIncome);
    saveMonthGroups(currentMonth, expenseGroups);
  }, [budgetItems, currentIncome, expenseGroups, currentMonth]);

  // Show welcome modal on first visit
  useEffect(() => {
    if (initialState.isFirstVisit) {
      setShowWelcomeModal(true);
    }
  }, [initialState.isFirstVisit]);

  // Theme lives on <html> so `dark:` utilities and the colour tokens follow the toggle.
  // index.html applies the saved theme before first paint; this keeps it in sync afterwards.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Handle welcome modal close
  const handleWelcomeClose = (income: number) => {
    setCurrentIncome(income);
    setShowWelcomeModal(false);
    localStorage.setItem(STORAGE_KEYS.visited, "true");

    // Immediately check and show the import/export modal if needed
    const hasSeenImportExportModal = localStorage.getItem(STORAGE_KEYS.importExportInfoSeen);
    if (hasSeenImportExportModal !== "true") {
      setShowImportExportModal(true);
    }
  };

  // Switch months (a month opened for the first time inherits income and groups, see loadMonthState)
  const handleMonthChange = (newMonth: MonthKey) => {
    if (newMonth === currentMonth) return;
    showMonth(newMonth, loadMonthState(newMonth));
  };

  // A month's items and groups: the month on screen from state (it may not be saved yet),
  // any other month from storage
  const getMonthContents = (month: MonthKey) =>
    month === currentMonth
      ? { items: budgetItems, groups: expenseGroups }
      : { items: loadMonthItems(month), groups: loadMonthGroups(month) ?? [] };

  // Copy one month's items and groups into another
  const copyMonthExpenses = (fromMonth: MonthKey, toMonth: MonthKey): void => {
    const source = getMonthContents(fromMonth);
    if (source.items.length === 0 && source.groups.length === 0) {
      console.error(`No data found for month: ${fromMonth}`);
      return;
    }

    const updated = copyMonthContents(source, getMonthContents(toMonth));

    if (toMonth === currentMonth) {
      // The save effect stores it
      setBudgetItems(updated.items);
      setExpenseGroups(updated.groups);
    } else {
      saveMonthItems(toMonth, updated.items);
      saveMonthGroups(toMonth, updated.groups);
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

  // Clear the current month's expenses (and optionally additional income) in one go
  const handleClearMonth = (includeIncome: boolean) => {
    const { kept, removed } = partitionItemsForClear(budgetItems, includeIncome);
    setShowClearDialog(false);
    if (removed.length === 0) return;

    setBudgetItems(kept);
    setLastClear({ month: currentMonth, removedItems: removed, clearedAt: Date.now() });
  };

  // Put cleared items back, even if the user has since switched to another month
  const handleUndoClear = () => {
    if (!lastClear) return;
    const { month, removedItems } = lastClear;

    if (month === currentMonth) {
      setBudgetItems((prevItems) => restoreClearedItems(prevItems, removedItems, expenseGroups));
    } else {
      const restored = restoreClearedItems(loadMonthItems(month), removedItems, loadMonthGroups(month) ?? []);
      saveMonthItems(month, restored);
    }

    setLastClear(null);
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

  const formatAmount = (amount: number) => formatCurrency(amount, currency);
  const currencySymbol = currencies[currency].symbol;
  const currentMonthLabel = formatMonth(currentMonth);

  return (
    <div className="min-h-screen flex justify-center items-center p-2 sm:p-4 md:p-6 bg-canvas text-fg transition-colors duration-300">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        defaultIncome={currentIncome}
        currencySymbol={currencySymbol}
        onDataImported={handleDataImported}
      />

      {/* Income Editor Modal */}
      <IncomeEditor
        isOpen={showIncomeEditor}
        onClose={handleIncomeEditorClose}
        currentIncome={currentIncome}
        currencySymbol={currencySymbol}
        month={currentMonthLabel}
      />

      {/* Import/Export Info Modal */}
      <ImportExportInfoModal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
      />

      <div className="w-full max-w-4xl rounded-lg md:rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 bg-surface shadow-indigo-200/50 dark:shadow-indigo-900/20">
        {/* Header */}
        <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Month selector */}
        <MonthSelector
          currentMonth={currentMonth}
          months={selectableMonths}
          onMonthChange={handleMonthChange}
          onCopyClick={() => setShowCopyDialog(true)}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />

        {/* Copy Month Dialog */}
        <CopyMonthDialog
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
          months={selectableMonths}
          currentMonth={currentMonth}
          onCopy={copyMonthExpenses}
        />

        {/* Summary Cards */}
        <BudgetSummary
            totalBudget={totalBudget}
            currentIncome={totalIncome} // Pass total income (base + additional)
            remainingBudget={remainingBudget}
            formatCurrency={formatAmount}
            onEditIncome={() => setShowIncomeEditor(true)}
        />

        {/* Budget Items */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Expenses</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowGroupManager(true)}>
                <span aria-hidden="true">📁</span>
                Groups
              </Button>

              <Button
                  variant="primary"
                  onClick={() => setShowAddForm(!showAddForm)}
                  aria-expanded={showAddForm}
              >
                <span aria-hidden="true">{showAddForm ? "✕" : "+"}</span>
                {showAddForm ? "Cancel" : "Add Item"}
              </Button>
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
          />

          {/* Add new item form */}
          {showAddForm && (
              <div className="mb-4">
                <AddExpenseForm
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
              onToggleChecked={toggleChecked}
              onEditItem={editBudgetItem}
              onDeleteItem={deleteBudgetItem}
              formatCurrency={formatAmount}
              onAddFirstExpense={() => setShowAddForm(true)}
              currency={currency}
              onUpdateGroupCollapse={handleUpdateGroupCollapse}
              onMoveToGroup={handleMoveToGroup}
          />

          {/* Month-level destructive action, kept quiet and away from the everyday buttons */}
          {budgetItems.length > 0 && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost-danger" onClick={() => setShowClearDialog(true)}>
                  <span aria-hidden="true">🗑️</span>
                  Clear {currentMonthLabel}…
                </Button>
              </div>
          )}

          <ClearMonthDialog
              isOpen={showClearDialog}
              month={currentMonthLabel}
              items={budgetItems}
              baseIncome={currentIncome}
              formatCurrency={formatAmount}
              onConfirm={handleClearMonth}
              onCancel={() => setShowClearDialog(false)}
          />
        </div>

        {/* Budget progress */}
        <ProgressBar
            label="Budget Usage"
            value={totalBudget}
            max={totalIncome}
            color={getBudgetUsageColor()}
        />

        {/* Expenses Progress */}
        <ProgressBar
          label="Expenses Paid"
          value={usedBudget}
          max={totalBudget}
          color="bg-blue-500"
        />

        {/* Data Backup Component */}
        <div className="px-4 pb-4">
          <DataBackup onDataImported={handleDataImported} />
        </div>

        {/* Footer */}
        <AnimatedFooter />
      </div>

      {/* Undo for the most recent month clear; keyed so a new clear restarts the countdown */}
      {lastClear && (
          <UndoToast
              key={lastClear.clearedAt}
              message={describeClear(lastClear)}
              onUndo={handleUndoClear}
              onDismiss={() => setLastClear(null)}
          />
      )}
    </div>
  );
};

export default BudgetApp;
