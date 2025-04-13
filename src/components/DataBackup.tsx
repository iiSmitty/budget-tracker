import { useState, useRef } from "react";
import { exportBudgetData, importBudgetData } from "../utils/dataBackup";

interface DataBackupProps {
  darkMode: boolean;
  onDataImported: () => void; // Callback to reload app state after import
}

const DataBackup: React.FC<DataBackupProps> = ({ darkMode, onDataImported }) => {
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
    <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
      <h3 className="text-lg font-medium mb-3">Backup & Restore Data</h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className={`px-4 py-2 rounded-md font-medium ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Export Data
        </button>
        
        <button
          onClick={handleImportClick}
          className={`px-4 py-2 rounded-md font-medium ${
            darkMode
              ? "bg-purple-600 hover:bg-purple-500 text-white"
              : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}
        >
          Import Data
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>
      
      {importStatus === "success" && (
        <div className="mt-3 p-2 bg-green-100 text-green-800 rounded">
          Data imported successfully! Your budget information has been restored.
        </div>
      )}
      
      {importStatus === "error" && (
        <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">
          Import failed: {errorMessage || "Invalid file format"}
        </div>
      )}
      
      <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        Exporting creates a backup file of all your budget data. Import this file on any device to restore your data.
      </p>
    </div>
  );
};

export default DataBackup;