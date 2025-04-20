import ReactDOM from "react-dom";
import { useRef, useEffect, useState } from "react";

interface ImportExportInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const ImportExportInfoModal = ({
  isOpen,
  onClose,
  darkMode,
}: ImportExportInfoModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [hasViewedModal, setHasViewedModal] = useState<boolean>(false);

  // Check if the user has seen this modal before
  useEffect(() => {
    const hasViewed = localStorage.getItem("budgetAppImportExportInfoSeen");
    if (hasViewed === "true") {
      setHasViewedModal(true);
    }
  }, []);

  // Handle closing the modal and setting the viewed flag
  const handleClose = () => {
    localStorage.setItem("budgetAppImportExportInfoSeen", "true");
    setHasViewedModal(true);
    onClose();
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // If the user has already seen the modal or it's not open, don't show it
  if (!isOpen || hasViewedModal) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-0 md:p-4">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-40"></div>

      {/* Decorative background elements - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-600 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-blue-600 opacity-10 blur-3xl"></div>
      </div>

      <div
        ref={modalRef}
        className={`w-full h-full md:h-auto md:max-w-md md:rounded-xl shadow-2xl overflow-hidden transition-all transform relative z-10 flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div
          className={`p-3 md:p-6 flex-shrink-0 ${
            darkMode
              ? "bg-gradient-to-r from-teal-900 to-blue-900"
              : "bg-gradient-to-r from-teal-600 to-blue-500"
          }`}
        >
          <h2 className="text-lg md:text-2xl font-bold text-white flex items-center">
            Data Backup and Restore{" "}
            <span className="ml-2 text-xl md:text-2xl">💾</span>
          </h2>
        </div>

        <div className="overflow-y-auto flex-grow p-3 md:p-6">
          <div className="mb-4 md:mb-5">
            <h3 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">
              Why is this important?
            </h3>
            <p
              className={`mb-2 md:mb-3 text-sm md:text-base ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              BudgetTracker stores all your data locally in your browser. This
              means:
            </p>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>
                <strong>Clearing cache</strong> will delete your budget data
              </li>
              <li>
                <strong>Different devices</strong> won't share your data
              </li>
              <li>No automatic cloud backup is available</li>
            </ul>
          </div>

          <div className="mb-4 md:mb-5 pb-3 md:pb-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">
              How to use Import/Export
            </h3>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>
                <strong>Export</strong>: Save a backup file of your budget data
              </li>
              <li>
                <strong>Import</strong>: Restore data from a previous backup
              </li>
            </ul>
          </div>

          <div className="mb-4 md:mb-5">
            <h3 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">
              When to use this feature
            </h3>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>Before switching devices</li>
              <li>Before clearing cache</li>
              <li>Monthly as backup</li>
              <li>To share between devices</li>
            </ul>
          </div>

          <div className="flex justify-center md:justify-end mt-2 md:mt-4">
            <button
              onClick={handleClose}
              className={`w-full md:w-auto px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg ${
                darkMode
                  ? "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                  : "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
              }`}
            >
              Got it!
            </button>
          </div>
        </div>

        <div
          className={`p-2 md:p-4 text-center text-xs md:text-sm flex-shrink-0 ${
            darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
          }`}
        >
          <p>This message only appears once.</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImportExportInfoModal;
