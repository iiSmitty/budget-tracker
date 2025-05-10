import React from "react";
import { CurrencyType } from "../utils/utils";
import CurrencyIconSwitcher from "../components/CurrencySelector";

// Define TypeScript interface for component props
interface MonthSelectorProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  darkMode: boolean;
  onCopyClick: () => void;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  setCurrentMonth,
  darkMode,
  onCopyClick,
  currency,
  onCurrencyChange,
}) => {
  const months = [
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

  return (
    <div
      className={`p-3 sm:p-4 ${
        darkMode ? "bg-indigo-800" : "bg-indigo-100"
      } rounded-t-lg`}
    >
      <div className="flex flex-wrap justify-between items-center">
        {/* Top row with title */}
        <div className="w-full sm:w-auto flex justify-between items-center mb-2 sm:mb-0">
          <h2 className="text-xl font-bold">{currentMonth} Budget</h2>

          {/* Currency icon on mobile - positioned on the right of the title */}
          <div className="sm:hidden">
            <CurrencyIconSwitcher
              currentCurrency={currency}
              onChange={onCurrencyChange}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Bottom row with controls - for smaller screens */}
        <div className="w-full sm:w-auto flex justify-between items-center">
          {/* Month selector dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className={`flex-grow sm:flex-grow-0 px-3 py-2 rounded-full text-sm font-medium ${
              darkMode
                ? "bg-indigo-700 text-white border-indigo-600"
                : "bg-white text-indigo-800 border-indigo-200"
            } border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200`}
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
                darkMode={darkMode}
              />
            </div>

            {/* Copy button */}
            <button
              onClick={onCopyClick}
              className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
                darkMode
                  ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                  : "bg-white hover:bg-gray-100 text-indigo-800 border-indigo-200 border-2"
              }`}
            >
              <span className="hidden sm:inline">📋</span>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
