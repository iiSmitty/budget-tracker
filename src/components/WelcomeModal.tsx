import ReactDOM from "react-dom";
import { useRef, useEffect, useState } from "react";
import { importBudgetData } from "../utils/dataBackup"; // Import the data import function

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (income: number) => void;
  darkMode: boolean;
  defaultIncome: number;
  onDataImported: () => void; // Add callback for data import
}

const WelcomeModal = ({
  isOpen,
  onClose,
  darkMode,
  defaultIncome,
  onDataImported,
}: WelcomeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize income as empty string to allow for blank state
  const [income, setIncome] = useState<string>(defaultIncome > 0 ? defaultIncome.toString() : "");
  // Add validation state
  const [isValid, setIsValid] = useState<boolean>(defaultIncome > 0);
  // Add import status state
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Focus on the income input when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        // Don't close on outside click - force user to use the button
        // onClose(income);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle income input change
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIncome(value);
    
    // Validate: not empty and is a valid number greater than 0
    const numValue = parseFloat(value);
    setIsValid(value !== "" && !isNaN(numValue) && numValue > 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only proceed if input is valid
    if (isValid) {
      onClose(parseFloat(income));
    }
  };

  // Handle import button click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      setImportStatus("idle");
      setErrorMessage("");
      
      await importBudgetData(file);
      setImportStatus("success");
      
      // Notify parent component about successful import
      onDataImported();
      
      // Close the welcome modal after a short delay to show success message
      setTimeout(() => {
        // Important: Since we've imported data, we should use the imported income
        const currentMonth = localStorage.getItem("budgetAppCurrentMonth") || 
          new Date().toLocaleString("default", { month: "long" });
        
        const incomeKey = `budgetAppIncome-${currentMonth}`;
        const savedIncome = localStorage.getItem(incomeKey);
        const importedIncome = savedIncome ? JSON.parse(savedIncome) : 0;
        
        console.log("Imported income:", importedIncome);
        onClose(importedIncome); // Pass the imported income to the onClose handler
      }, 1500);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-0 md:p-4">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-40"></div>

      {/* Decorative background elements - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-blue-600 opacity-10 blur-3xl"></div>
      </div>

      <div
        ref={modalRef}
        className={`w-full h-full md:h-auto md:max-w-md md:rounded-xl shadow-2xl overflow-hidden transition-all transform relative z-10 flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
        style={{ maxHeight: '100%' }}
      >
        <div
          className={`p-4 md:p-6 flex-shrink-0 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900 to-blue-900"
              : "bg-gradient-to-r from-indigo-600 to-blue-500"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            Welcome to BudgetTracker! <span className="ml-2 text-xl md:text-2xl">👋</span>
          </h2>
        </div>

        <div className="overflow-y-auto flex-grow p-4 md:p-6">
          {/* Returning User Section */}
          <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2">Returning User?</h3>
            <p className={`mb-3 text-sm md:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              If you've used BudgetTracker before and have a backup file, you can restore your data:
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <button
                onClick={handleImportClick}
                className={`px-4 py-2 rounded-lg font-medium transition shadow-md hover:shadow-lg ${
                  darkMode
                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                Import Backup
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              
              {importStatus === "success" && (
                <span className="text-green-500 mt-2 md:mt-0 md:ml-2 text-sm md:text-base">
                  ✓ Data restored successfully!
                </span>
              )}
              
              {importStatus === "error" && (
                <span className="text-red-500 mt-2 md:mt-0 md:ml-2 text-sm md:text-base break-words">
                  ✗ {errorMessage || "Import failed"}
                </span>
              )}
            </div>
          </div>

          {/* New User Section */}
          <div className="mb-5">
            <h3 className="text-lg font-medium mb-2">New User?</h3>
            <p className={`mb-3 text-sm md:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              BudgetTracker helps you manage your monthly expenses by:
            </p>
            <ul
              className={`list-disc pl-5 space-y-1.5 mb-4 text-sm md:text-base ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>Tracking your planned expenses for each month</li>
              <li>Monitoring which expenses have been paid</li>
              <li>Comparing your total budget against your income</li>
              <li>Giving you a clear view of your financial situation</li>
            </ul>
            <p
              className={`mb-3 text-sm md:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Let's get started by setting your monthly income:
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">
              Your Monthly Income
            </label>
            <div className="relative mb-5">
              <span className="absolute left-3 top-3 text-sm md:text-base">R</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={income}
                onChange={handleIncomeChange}
                placeholder="Enter your monthly income"
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-base md:text-lg ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isValid}
                className={`px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg w-full md:w-auto ${
                  !isValid
                    ? darkMode
                      ? "bg-gray-600 cursor-not-allowed opacity-70"
                      : "bg-gray-400 cursor-not-allowed opacity-70"
                    : darkMode
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                }`}
              >
                Get Started
              </button>
            </div>
          </form>
        </div>

        <div
          className={`p-3 md:p-4 text-center text-xs md:text-sm flex-shrink-0 ${
            darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
          }`}
        >
          <p>Don't worry, you can change your income anytime later.</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeModal;