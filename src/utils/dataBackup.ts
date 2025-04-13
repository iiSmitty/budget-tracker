import { getMonths } from "./utils";

// Define TypeScript interfaces
interface BudgetItem {
  id: string;
  description: string;
  amount: number;
  checked: boolean;
  category?: string;
}

interface MonthData {
  items: BudgetItem[];
  income: number;
}

interface ExportData {
  darkMode: boolean;
  currentMonth: string | null;
  visited: boolean;
  months: {
    [month: string]: MonthData;
  };
}

// Export data to JSON file
export const exportBudgetData = () => {
  // Collect all budget data from localStorage
  const exportData: ExportData = {
    darkMode: JSON.parse(localStorage.getItem("budgetAppDarkMode") || "false"),
    currentMonth: localStorage.getItem("budgetAppCurrentMonth"),
    visited: localStorage.getItem("budgetAppVisited") === "true",
    months: {},
  };

  // Get all months data
  const allMonths = getMonths();
  
  allMonths.forEach(month => {
    // Get budget items for this month
    const itemsKey = `budgetAppItems-${month}`;
    const incomeKey = `budgetAppIncome-${month}`;
    
    const items = localStorage.getItem(itemsKey);
    const income = localStorage.getItem(incomeKey);
    
    if (items || income) {
      exportData.months[month] = {
        items: items ? JSON.parse(items) : [],
        income: income ? JSON.parse(income) : 0
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
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `budget-tracker-backup-${date}.json`;
  
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Import data from JSON file
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
        if (!importData.months || typeof importData.months !== 'object') {
          throw new Error("Invalid backup file format");
        }
        
        // Save dark mode setting
        if (importData.darkMode !== undefined) {
          localStorage.setItem("budgetAppDarkMode", JSON.stringify(importData.darkMode));
        }
        
        // Save current month
        if (importData.currentMonth) {
          localStorage.setItem("budgetAppCurrentMonth", importData.currentMonth);
        }
        
        // Save visited status
        if (importData.visited !== undefined) {
          localStorage.setItem("budgetAppVisited", importData.visited ? "true" : "false");
        }
        
        // Save all months data
        Object.keys(importData.months).forEach(month => {
          const monthData = importData.months[month];
          
          if (monthData.items) {
            localStorage.setItem(`budgetAppItems-${month}`, JSON.stringify(monthData.items));
          }
          
          if (monthData.income !== undefined) {
            localStorage.setItem(`budgetAppIncome-${month}`, JSON.stringify(monthData.income));
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