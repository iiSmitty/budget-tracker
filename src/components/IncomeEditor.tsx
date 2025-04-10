import ReactDOM from "react-dom";
import { useRef, useEffect, useState } from "react";

interface IncomeEditorProps {
  isOpen: boolean;
  onClose: (income: number | null) => void;
  currentIncome: number;
  darkMode: boolean;
  month: string;
}

const IncomeEditor = ({
  isOpen,
  onClose,
  currentIncome,
  darkMode,
  month,
}: IncomeEditorProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [income, setIncome] = useState(currentIncome);

  // Reset income state when currentIncome changes
  useEffect(() => {
    setIncome(currentIncome);
  }, [currentIncome]);

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
        onClose(null); // Cancel without saving
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-purple-600 opacity-10 blur-3xl"></div>
      </div>

      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden transition-all transform relative z-10 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div
          className={`p-4 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900 to-blue-900"
              : "bg-gradient-to-r from-indigo-600 to-blue-500"
          }`}
        >
          <h2 className="text-xl font-bold text-white">
            Update {month} Income
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">
              Income Amount
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

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onClose(null)}
                className={`px-4 py-2 rounded-lg font-medium transition shadow-md ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-medium transition shadow-md ${
                  darkMode
                    ? "bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                }`}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IncomeEditor;
