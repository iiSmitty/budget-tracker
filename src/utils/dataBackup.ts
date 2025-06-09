import { getMonths, CurrencyType } from "./utils";
import { BudgetItemType, ExpenseGroup } from "../types/budget";

// Updated interfaces to support groups
interface MonthData {
  items: BudgetItemType[];
  income: number;
  groups: ExpenseGroup[]; // Add groups support
}

interface ExportData {
  darkMode: boolean;
  currentMonth: string | null;
  visited: boolean;
  currency: CurrencyType;
  months: {
    [month: string]: MonthData;
  };
}

// Export data to JSON file with groups support
export const exportBudgetData = () => {
  // Collect all budget data from localStorage
  const exportData: ExportData = {
    darkMode: JSON.parse(localStorage.getItem("budgetAppDarkMode") || "false"),
    currentMonth: localStorage.getItem("budgetAppCurrentMonth"),
    visited: localStorage.getItem("budgetAppVisited") === "true",
    currency: (localStorage.getItem("budgetAppCurrency") || "ZAR") as CurrencyType,
    months: {},
  };

  // Get all months data
  const allMonths = getMonths();

  allMonths.forEach((month) => {
    // Get budget items, income, and groups for this month
    const itemsKey = `budgetAppItems-${month}`;
    const incomeKey = `budgetAppIncome-${month}`;
    const groupsKey = `budgetAppGroups-${month}`; // Add groups

    const items = localStorage.getItem(itemsKey);
    const income = localStorage.getItem(incomeKey);
    const groups = localStorage.getItem(groupsKey); // Add groups

    if (items || income || groups) {
      exportData.months[month] = {
        items: items ? JSON.parse(items) : [],
        income: income ? JSON.parse(income) : 0,
        groups: groups ? JSON.parse(groups) : [], // Add groups
      };
    }
  });

  // Convert to JSON and create a Blob
  const jsonData = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Create a filename with the current date
  const date = new Date().toISOString().split("T")[0];
  const filename = `budget-tracker-backup-${date}.json`;

  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
};

// Import data from JSON file with groups support
export const importBudgetData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }

        const importData = JSON.parse(event.target.result as string) as ExportData;

        // Validate the data structure
        if (!importData.months || typeof importData.months !== "object") {
          throw new Error("Invalid backup file format");
        }

        // Save preferences
        if (importData.darkMode !== undefined) {
          localStorage.setItem("budgetAppDarkMode", JSON.stringify(importData.darkMode));
        }

        if (importData.currentMonth) {
          localStorage.setItem("budgetAppCurrentMonth", importData.currentMonth);
        }

        if (importData.visited !== undefined) {
          localStorage.setItem("budgetAppVisited", importData.visited ? "true" : "false");
        }

        if (importData.currency) {
          localStorage.setItem("budgetAppCurrency", importData.currency);
        } else {
          localStorage.setItem("budgetAppCurrency", "ZAR");
        }

        // Save all months data including groups
        Object.keys(importData.months).forEach((month) => {
          const monthData = importData.months[month];

          if (monthData.items) {
            localStorage.setItem(`budgetAppItems-${month}`, JSON.stringify(monthData.items));
          }

          if (monthData.income !== undefined) {
            localStorage.setItem(`budgetAppIncome-${month}`, JSON.stringify(monthData.income));
          }

          // Import groups if they exist (backward compatibility)
          if (monthData.groups) {
            localStorage.setItem(`budgetAppGroups-${month}`, JSON.stringify(monthData.groups));
          }
        });

        resolve(true);
      } catch (error) {
        console.error("Import error:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };

    reader.readAsText(file);
  });
};