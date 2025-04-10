import ReactDOM from "react-dom";
import { useRef, useEffect, useState } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (income: number) => void;
  darkMode: boolean;
  defaultIncome: number;
}

const WelcomeModal = ({
  isOpen,
  onClose,
  darkMode,
  defaultIncome,
}: WelcomeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [income, setIncome] = useState(defaultIncome);

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
  }, [isOpen, onClose, income]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(income);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-40"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-blue-600 opacity-10 blur-3xl"></div>
      </div>

      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden transition-all transform relative z-10 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div
          className={`p-6 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900 to-blue-900"
              : "bg-gradient-to-r from-indigo-600 to-blue-500"
          }`}
        >
          <h2 className="text-2xl font-bold text-white flex items-center">
            Welcome to BudgetTracker! <span className="ml-2 text-2xl">👋</span>
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              BudgetTracker helps you manage your monthly expenses by:
            </p>
            <ul
              className={`list-disc pl-5 space-y-2 mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>Tracking your planned expenses for each month</li>
              <li>Monitoring which expenses have been paid</li>
              <li>Comparing your total budget against your income</li>
              <li>Giving you a clear view of your financial situation</li>
            </ul>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Let's get started by setting your monthly income:
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">
              Your Monthly Income
            </label>
            <div className="relative mb-6">
              <span className="absolute left-3 top-3">R</span>
              <input
                ref={inputRef}
                type="number"
                value={income}
                onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-lg ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg ${
                  darkMode
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
          className={`p-4 text-center text-sm ${
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
