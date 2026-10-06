import React from "react";
import { CurrencyType, getMonths } from "../utils/utils";
import CurrencyIconSwitcher from "../components/CurrencySelector";

// Define TypeScript interface for component props
interface MonthSelectorProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  onCopyClick: () => void;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  setCurrentMonth,
  onCopyClick,
  currency,
  onCurrencyChange,
}) => {
  const months = getMonths();

  return (
    <div className="p-3 sm:p-4 bg-indigo-100 dark:bg-indigo-800 rounded-t-lg">
      <div className="flex flex-wrap justify-between items-center">
        {/* Top row with title */}
        <div className="w-full sm:w-auto flex justify-between items-center mb-2 sm:mb-0">
          <h2 className="text-xl font-bold">{currentMonth} Budget</h2>

          {/* Currency icon on mobile - positioned on the right of the title */}
          <div className="sm:hidden">
            <CurrencyIconSwitcher
              currentCurrency={currency}
              onChange={onCurrencyChange}
            />
          </div>
        </div>

        {/* Bottom row with controls - for smaller screens */}
        <div className="w-full sm:w-auto flex justify-between items-center">
          {/* Month selector dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            aria-label="Month"
            className="flex-grow sm:flex-grow-0 px-3 py-2 rounded-full text-sm font-medium border-2 transition-colors duration-200 bg-white text-indigo-800 border-indigo-200 dark:bg-indigo-700 dark:text-white dark:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {/* Controls for desktop */}
          <div className="flex items-center ml-2">
            {/* Currency icon on desktop */}
            <div className="hidden sm:block mr-2">
              <CurrencyIconSwitcher
                currentCurrency={currency}
                onChange={onCurrencyChange}
              />
            </div>

            {/* Copy button */}
            <button
              onClick={onCopyClick}
              className="px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 border-2 transition-colors bg-white hover:bg-gray-100 text-indigo-800 border-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-white dark:border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="hidden sm:inline" aria-hidden="true">📋</span>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
