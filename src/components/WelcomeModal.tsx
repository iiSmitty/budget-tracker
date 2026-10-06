import { useId, useRef, useState } from "react";
import { importBudgetData } from "../utils/dataBackup"; // Import the data import function
import { loadCurrentMonth, loadMonthIncome } from "../utils/storage";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import { fieldClass } from "./ui/fieldClass";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (income: number) => void;
  defaultIncome: number;
  currencySymbol: string;
  onDataImported: () => void; // Add callback for data import
}

const WelcomeModal = ({
  isOpen,
  onClose,
  defaultIncome,
  currencySymbol,
  onDataImported,
}: WelcomeModalProps) => {
  const formId = useId();
  const incomeInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize income as empty string to allow for blank state
  const [income, setIncome] = useState<string>(defaultIncome > 0 ? defaultIncome.toString() : "");
  // Add validation state
  const [isValid, setIsValid] = useState<boolean>(defaultIncome > 0);
  // Add import status state
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

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
        const importedIncome = loadMonthIncome(loadCurrentMonth()) ?? 0;
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

  const mutedText = "text-sm md:text-base text-fg-muted";

  return (
    <Dialog
      isOpen={isOpen}
      // The user must either import a backup or set an income, so there's no way to dismiss
      onClose={() => {}}
      dismissible={false}
      initialFocusRef={inputRef}
      title={
        <>
          Welcome to BudgetTracker! <span aria-hidden="true">👋</span>
        </>
      }
      description="Don't worry, you can change your income anytime later."
      footer={
        <Button
          type="submit"
          form={formId}
          variant="primary"
          size="lg"
          disabled={!isValid}
          className="w-full sm:w-auto"
        >
          Get Started
        </Button>
      }
    >
      {/* Returning User Section */}
      <section className="mb-5 pb-5 border-b border-border">
        <h3 className="text-lg font-medium mb-2">Returning User?</h3>
        <p className={`mb-3 ${mutedText}`}>
          If you've used BudgetTracker before and have a backup file, you can restore your data:
        </p>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <Button variant="secondary" onClick={handleImportClick}>
            Import Backup
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <div role="status" aria-live="polite">
            {importStatus === "success" && (
              <span className="text-green-600 dark:text-green-400 mt-2 md:mt-0 md:ml-2 text-sm md:text-base">
                ✓ Data restored successfully!
              </span>
            )}

            {importStatus === "error" && (
              <span className="text-red-600 dark:text-red-400 mt-2 md:mt-0 md:ml-2 text-sm md:text-base break-words">
                ✗ {errorMessage || "Import failed"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* New User Section */}
      <section className="mb-5">
        <h3 className="text-lg font-medium mb-2">New User?</h3>
        <p className={`mb-3 ${mutedText}`}>
          BudgetTracker helps you manage your monthly expenses by:
        </p>
        <ul className={`list-disc pl-5 space-y-1.5 mb-4 ${mutedText}`}>
          <li>Tracking your planned expenses for each month</li>
          <li>Monitoring which expenses have been paid</li>
          <li>Comparing your total budget against your income</li>
          <li>Giving you a clear view of your financial situation</li>
        </ul>
        <p className={mutedText}>Let's get started by setting your monthly income:</p>
      </section>

      <form id={formId} onSubmit={handleSubmit}>
        <label htmlFor={incomeInputId} className="block text-sm font-medium mb-2">
          Your Monthly Income
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
            {currencySymbol}
          </span>
          <input
            id={incomeInputId}
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={income}
            onChange={handleIncomeChange}
            placeholder="Enter your monthly income"
            className={fieldClass({ hasPrefix: true })}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default WelcomeModal;
