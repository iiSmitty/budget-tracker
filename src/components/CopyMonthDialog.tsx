import { useState, useEffect } from "react";

interface CopyMonthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  months: string[];
  currentMonth: string;
  darkMode: boolean;
  onCopy: (fromMonth: string, toMonth: string) => void;
}

const CopyMonthDialog = ({
  isOpen,
  onClose,
  months,
  currentMonth,
  darkMode,
  onCopy,
}: CopyMonthDialogProps) => {
  const [sourceMonth, setSourceMonth] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [mode, setMode] = useState("copyFrom"); // "copyFrom" or "copyTo"
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSourceMonth("");
      setTargetMonth(currentMonth);
      setMode("copyFrom");
      setConfirmOpen(false);
    }
  }, [isOpen, currentMonth]);

  if (!isOpen) return null;

  const handleCopyRequest = () => {
    // Show confirmation before copying
    setConfirmOpen(true);
  };

  const handleConfirmCopy = () => {
    // Get source and destination based on mode
    const fromMonth = mode === "copyFrom" ? sourceMonth : currentMonth;
    const toMonth = mode === "copyFrom" ? currentMonth : targetMonth;

    // Execute the copy
    onCopy(fromMonth, toMonth);

    // Close dialogs
    setConfirmOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`rounded-xl p-6 w-full max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Copy Month Data</h2>

        {/* Toggle between copy modes */}
        <div className="flex mb-4 rounded-lg overflow-hidden">
          <button
            onClick={() => setMode("copyFrom")}
            className={`flex-1 py-2 ${
              mode === "copyFrom"
                ? darkMode
                  ? "bg-indigo-700 text-white"
                  : "bg-indigo-600 text-white"
                : darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          >
            Copy FROM another month
          </button>
          <button
            onClick={() => setMode("copyTo")}
            className={`flex-1 py-2 ${
              mode === "copyTo"
                ? darkMode
                  ? "bg-indigo-700 text-white"
                  : "bg-indigo-600 text-white"
                : darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          >
            Copy TO another month
          </button>
        </div>

        {mode === "copyFrom" ? (
          <div>
            <p className="mb-4">Select a month to copy expenses FROM:</p>
            <select
              value={sourceMonth}
              onChange={(e) => setSourceMonth(e.target.value)}
              className={`w-full p-2 mb-4 rounded-lg ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">Select source month</option>
              {months.map(
                (month) =>
                  month !== currentMonth && (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  )
              )}
            </select>
            <p className="mb-4">
              Expenses will be copied TO your current month ({currentMonth}).
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              Your current month ({currentMonth}) expenses will be copied TO:
            </p>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className={`w-full p-2 mb-4 rounded-lg ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">Select target month</option>
              {months.map(
                (month) =>
                  month !== currentMonth && (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  )
              )}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleCopyRequest}
            disabled={
              (mode === "copyFrom" && !sourceMonth) ||
              (mode === "copyTo" && !targetMonth)
            }
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-600"
                : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            } text-white disabled:opacity-50`}
          >
            Copy Expenses
          </button>
        </div>

        {/* Confirmation dialog */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className={`rounded-xl p-6 w-full max-w-md ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <h3 className="text-lg font-bold mb-2">Confirm Copy</h3>
              <p className="mb-4">
                {mode === "copyFrom"
                  ? `This will copy all expenses from ${sourceMonth} to ${currentMonth}. Any existing expenses in ${currentMonth} will remain unchanged.`
                  : `This will copy all expenses from ${currentMonth} to ${targetMonth}. Any existing expenses in ${targetMonth} will remain unchanged.`}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCopy}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-red-700 hover:bg-red-600"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  Yes, Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyMonthDialog;
