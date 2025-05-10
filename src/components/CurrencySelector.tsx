import React from "react";
import { CurrencyType, currencies } from "../utils/utils";

// Import SVG files
import flagZAR from "../assets/icons/flag-za.svg";
import flagEUR from "../assets/icons/flag-uk.png";

// Flag icons mapping
const flagIcons: Record<CurrencyType, string> = {
  ZAR: flagZAR,
  EUR: flagEUR,
};

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
  const toggleCurrency = () => {
    const newCurrency = currentCurrency === "ZAR" ? "EUR" : "ZAR";
    onChange(newCurrency);
  };

  return (
    <button
      onClick={toggleCurrency}
      className={`flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-full ${
        darkMode
          ? "bg-indigo-700/50 hover:bg-indigo-600/60 active:bg-indigo-500/70"
          : "bg-white/20 hover:bg-white/30 active:bg-white/40"
      } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200`}
      title={`Switch to ${
        currentCurrency === "ZAR" ? "Euro" : "South African Rand"
      }`}
      aria-label={`Change currency from ${
        currencies[currentCurrency].name
      } to ${currencies[currentCurrency === "ZAR" ? "EUR" : "ZAR"].name}`}
    >
      <img
        src={flagIcons[currentCurrency]}
        alt=""
        className="w-6 h-4 object-contain"
        style={{
          imageRendering: currentCurrency === "EUR" ? "crisp-edges" : "auto",
        }}
      />
    </button>
  );
};

export default CurrencyIconSwitcher;
