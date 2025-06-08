import React from "react";
import { CurrencyType, currencies, getNextCurrency } from "../utils/utils";

interface CurrencySwitcherProps {
    currentCurrency: CurrencyType;
    onChange: (currency: CurrencyType) => void;
    darkMode?: boolean;
}

const CurrencyIconSwitcher: React.FC<CurrencySwitcherProps> = ({
                                                                   currentCurrency,
                                                                   onChange,
                                                                   darkMode = false,
                                                               }) => {
    const cycleCurrency = () => {
        const nextCurrency = getNextCurrency(currentCurrency);
        onChange(nextCurrency);
    };

    const getNextCurrencyName = () => {
        const nextCurrency = getNextCurrency(currentCurrency);
        return currencies[nextCurrency].name;
    };

    return (
        <button
            onClick={cycleCurrency}
            className={`flex items-center justify-center min-w-[50px] min-h-[40px] px-2 py-2 rounded-full ${
                darkMode
                    ? "bg-indigo-700/50 hover:bg-indigo-600/60 active:bg-indigo-500/70"
                    : "bg-white/20 hover:bg-white/30 active:bg-white/40"
            } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200`}
            title={`Current: ${currencies[currentCurrency].name}. Click to switch to ${getNextCurrencyName()}`}
            aria-label={`Change currency from ${currencies[currentCurrency].name} to ${getNextCurrencyName()}`}
        >
      <span className={`text-xs font-bold tracking-wider ${
          darkMode ? "text-white" : "text-gray-800"
      }`}>
        {currencies[currentCurrency].displayCode}
      </span>
        </button>
    );
};

export default CurrencyIconSwitcher;