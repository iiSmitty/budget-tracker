// Currency configuration
export type CurrencyType = "ZAR" | "EUR";

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
}

export const currencies: Record<CurrencyType, CurrencyConfig> = {
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
};

// Format currency with support for multiple currencies
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyType = "ZAR"
): string => {
  const currency = currencies[currencyCode];
  return `${currency.symbol}${amount.toFixed(2)}`;
};

// Helper function to determine category color
export const getCategoryColor = (amount: number, darkMode: boolean): string => {
  if (amount > 5000) return darkMode ? "bg-red-900" : "bg-red-100";
  if (amount > 1000) return darkMode ? "bg-orange-900" : "bg-orange-100";
  if (amount > 500) return darkMode ? "bg-yellow-900" : "bg-yellow-100";
  if (amount > 100) return darkMode ? "bg-green-900" : "bg-green-100";
  return darkMode ? "bg-blue-900" : "bg-blue-100";
};

// Load data from localStorage
export const loadFromLocalStorage = () => {
  try {
    // Check if this is the first visit
    const visitedBefore = localStorage.getItem("budgetAppVisited");
    const initialFirstVisit = visitedBefore ? false : true;

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("budgetAppDarkMode");
    const initialDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : true;

    // Load current month or use current system month
    const savedMonth = localStorage.getItem("budgetAppCurrentMonth");
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString("default", {
      month: "long",
    });
    const initialMonth = savedMonth || currentMonthName;

    // Load budget items for the current month
    const monthItemsKey = `budgetAppItems-${initialMonth}`;
    const savedItems = localStorage.getItem(monthItemsKey);
    const initialItems = savedItems ? JSON.parse(savedItems) : [];

    // Load income for the current month
    const monthIncomeKey = `budgetAppIncome-${initialMonth}`;
    const savedIncome = localStorage.getItem(monthIncomeKey);
    const initialIncome = savedIncome ? JSON.parse(savedIncome) : 0;

    // Load currency preference
    const savedCurrency = localStorage.getItem("budgetAppCurrency");
    const initialCurrency = (savedCurrency as CurrencyType) || "ZAR";

    return {
      isFirstVisit: initialFirstVisit,
      darkMode: initialDarkMode,
      month: initialMonth,
      items: initialItems,
      income: initialIncome,
      currency: initialCurrency,
    };
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    // Return defaults if there was an error, but with empty items array
    return {
      isFirstVisit: true,
      darkMode: true,
      month: new Date().toLocaleString("default", { month: "long" }),
      items: [],
      income: 0,
      currency: "ZAR",
    };
  }
};

// Get all months
export const getMonths = (): string[] => [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
