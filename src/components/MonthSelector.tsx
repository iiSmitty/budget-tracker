import React from "react";

// Define TypeScript interface for component props
interface MonthSelectorProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  darkMode: boolean;
  onCopyClick: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  setCurrentMonth,
  darkMode,
  onCopyClick,
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
      className={`flex justify-between items-center gap-2 p-4 ${
        darkMode ? "bg-indigo-800" : "bg-indigo-100"
      } rounded-t-lg`}
    >
      <div className="flex items-center">
        <h2 className="text-xl font-bold self-center">{currentMonth} Budget</h2>
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className={`px-3 py-2 rounded-full ml-4 font-medium ${
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
      </div>

      {/* Add Copy button */}
      <button
        onClick={onCopyClick}
        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
          darkMode
            ? "bg-indigo-700 hover:bg-indigo-600 text-white"
            : "bg-white hover:bg-gray-100 text-indigo-800 border-indigo-200 border-2"
        }`}
      >
        <span>📋</span>
        <span>Copy Expenses</span>
      </button>
    </div>
  );
};

export default MonthSelector;
