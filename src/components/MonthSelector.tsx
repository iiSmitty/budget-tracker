import React from "react";
import { CurrencyType } from "../utils/utils";
import { MonthKey, addMonths, formatMonth, getCurrentMonthKey } from "../utils/months";
import CurrencyIconSwitcher from "../components/CurrencySelector";
import MonthOptions from "./MonthOptions";

// Define TypeScript interface for component props
interface MonthSelectorProps {
  currentMonth: MonthKey;
  // Months offered in the dropdown, oldest first
  months: MonthKey[];
  onMonthChange: (month: MonthKey) => void;
  onCopyClick: () => void;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

const pillClass =
  "rounded-full font-medium border-2 transition-colors bg-white hover:bg-gray-100 text-indigo-800 border-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-white dark:border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  months,
  onMonthChange,
  onCopyClick,
  currency,
  onCurrencyChange,
}) => {
  const thisMonth = getCurrentMonthKey();
  const previousMonth = addMonths(currentMonth, -1);
  const nextMonth = addMonths(currentMonth, 1);

  return (
    <div className="p-3 sm:p-4 bg-indigo-100 dark:bg-indigo-800 rounded-t-lg">
      <div className="flex flex-wrap justify-between items-center gap-y-2">
        {/* Top row with title */}
        <div className="w-full sm:w-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl font-bold truncate">
              {formatMonth(currentMonth)}
              {/* Dropped on phones so the month and year always fit */}
              <span className="hidden sm:inline"> Budget</span>
            </h2>

            {/* Quick way back after browsing other months */}
            {currentMonth !== thisMonth && (
              <button
                onClick={() => onMonthChange(thisMonth)}
                className={`${pillClass} flex-shrink-0 px-3 py-1 text-xs`}
                title={`Go to ${formatMonth(thisMonth)}`}
              >
                This month
              </button>
            )}
          </div>

          {/* Currency icon on mobile - positioned on the right of the title */}
          <div className="sm:hidden">
            <CurrencyIconSwitcher
              currentCurrency={currency}
              onChange={onCurrencyChange}
            />
          </div>
        </div>

        {/* Bottom row with controls - for smaller screens */}
        <div className="w-full sm:w-auto flex justify-between items-center gap-2">
          {/* Month navigation: step with the arrows or jump with the dropdown */}
          <div className="flex flex-grow sm:flex-grow-0 items-center gap-1">
            <button
              onClick={() => onMonthChange(previousMonth)}
              aria-label={`Previous month (${formatMonth(previousMonth)})`}
              className={`${pillClass} w-10 h-10 flex-shrink-0 flex items-center justify-center text-lg leading-none`}
            >
              ‹
            </button>
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Month"
              className="flex-grow sm:flex-grow-0 min-w-0 h-10 px-3 rounded-full text-sm font-medium border-2 transition-colors duration-200 bg-white text-indigo-800 border-indigo-200 dark:bg-indigo-700 dark:text-white dark:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <MonthOptions months={months} />
            </select>
            <button
              onClick={() => onMonthChange(nextMonth)}
              aria-label={`Next month (${formatMonth(nextMonth)})`}
              className={`${pillClass} w-10 h-10 flex-shrink-0 flex items-center justify-center text-lg leading-none`}
            >
              ›
            </button>
          </div>

          {/* Controls for desktop */}
          <div className="flex items-center">
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
              className={`${pillClass} h-10 px-3 text-sm flex items-center gap-1`}
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
