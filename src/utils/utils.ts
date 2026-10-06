// Currency configuration
export type CurrencyType = "ZAR" | "EUR" | "NZD";

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  displayCode: string;
}

export const currencies: Record<CurrencyType, CurrencyConfig> = {
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    displayCode: "ZAR"
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    displayCode: "EUR"
  },
  NZD: {
    code: "NZD",
    symbol: "$",
    name: "New Zealand Dollar",
    displayCode: "NZD"
  },
};

// Currency cycle order for the button
export const currencyOrder: CurrencyType[] = ["ZAR", "EUR", "NZD"];

// Get next currency in the cycle
export const getNextCurrency = (currentCurrency: CurrencyType): CurrencyType => {
  const currentIndex = currencyOrder.indexOf(currentCurrency);
  const nextIndex = (currentIndex + 1) % currencyOrder.length;
  return currencyOrder[nextIndex];
};

// Format currency with support for multiple currencies
export const formatCurrency = (
    amount: number,
    currencyCode: CurrencyType = "ZAR"
): string => {
  const currency = currencies[currencyCode];
  return `${currency.symbol}${amount.toFixed(2)}`;
};

// "1 expense", "3 expenses"
export const pluralise = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;

// Helper function to determine category color
export const getCategoryColor = (amount: number): string => {
  if (amount > 5000) return "bg-red-100 dark:bg-red-900";
  if (amount > 1000) return "bg-orange-100 dark:bg-orange-900";
  if (amount > 500) return "bg-yellow-100 dark:bg-yellow-900";
  if (amount > 100) return "bg-green-100 dark:bg-green-900";
  return "bg-blue-100 dark:bg-blue-900";
};
