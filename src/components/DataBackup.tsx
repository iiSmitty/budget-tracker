import { useState, useRef } from "react";
import { exportBudgetData, importBudgetData } from "../utils/dataBackup";
import Button from "./ui/Button";

interface DataBackupProps {
  onDataImported: () => void; // Callback to reload app state after import
}

const DataBackup: React.FC<DataBackupProps> = ({ onDataImported }) => {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportBudgetData();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus("idle");
      setErrorMessage("");

      await importBudgetData(file);
      setImportStatus("success");

      // Call the callback to reload app state
      onDataImported();

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

  return (
    <div className="mt-6 p-4 rounded-lg bg-surface-muted">
      <h3 className="text-lg font-medium mb-3">Backup & Restore Data</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={handleExport}>
          Export Data
        </Button>

        <Button variant="secondary" onClick={handleImportClick}>
          Import Data
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      <div role="status" aria-live="polite">
        {importStatus === "success" && (
          <div className="mt-3 p-2 rounded bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
            Data imported successfully! Your budget information has been restored.
          </div>
        )}

        {importStatus === "error" && (
          <div className="mt-3 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
            Import failed: {errorMessage || "Invalid file format"}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-fg-muted">
        Exporting creates a backup file of all your budget data. Import this file on any device to restore your data.
      </p>
    </div>
  );
};

export default DataBackup;
