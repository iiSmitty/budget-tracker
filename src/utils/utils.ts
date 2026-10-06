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

// Order currencies are offered in
export const currencyOrder: CurrencyType[] = ["ZAR", "EUR", "NZD"];

const formatters = new Map<CurrencyType, Intl.NumberFormat>();

// Format an amount with thousands separators: "R 33,898.50", "€33,898.50", "$33,898.50".
// Amounts are typed with a "." decimal point, so every currency is shown with that same
// convention rather than its home locale's (South Africa's own style is "R 33 898,50").
export const formatCurrency = (
    amount: number,
    currencyCode: CurrencyType = "ZAR"
): string => {
  let formatter = formatters.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    });
    formatters.set(currencyCode, formatter);
  }
  return formatter.format(amount);
};

// "1 expense", "3 expenses"
export const pluralise = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;

// "today", "yesterday", "3 days ago", "2 months ago"
export const formatTimeAgo = (date: Date, now: Date = new Date()): string => {
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (days < 30) return relative.format(-days, "day");
  if (days < 365) return relative.format(-Math.floor(days / 30), "month");
  return relative.format(-Math.floor(days / 365), "year");
};
