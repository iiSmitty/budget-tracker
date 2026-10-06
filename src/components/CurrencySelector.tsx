import React from "react";
import { CurrencyType, currencies, getNextCurrency } from "../utils/utils";

interface CurrencySwitcherProps {
    currentCurrency: CurrencyType;
    onChange: (currency: CurrencyType) => void;
}

const CurrencyIconSwitcher: React.FC<CurrencySwitcherProps> = ({
                                                                   currentCurrency,
                                                                   onChange,
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
            className="flex items-center justify-center min-w-[50px] min-h-[40px] px-2 py-2 rounded-full border-2 transition-colors duration-200 bg-white hover:bg-gray-100 border-indigo-200 text-indigo-800 dark:bg-indigo-700/50 dark:hover:bg-indigo-600/60 dark:active:bg-indigo-500/70 dark:border-transparent dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={`Current: ${currencies[currentCurrency].name}. Click to switch to ${getNextCurrencyName()}`}
            aria-label={`Change currency from ${currencies[currentCurrency].name} to ${getNextCurrencyName()}`}
        >
      <span className="text-xs font-bold tracking-wider">
        {currencies[currentCurrency].displayCode}
      </span>
        </button>
    );
};

export default CurrencyIconSwitcher;
