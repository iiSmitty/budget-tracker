import { useEffect, useRef, useState } from "react";
import { CircleCheck, Download, Moon, Settings, Sun, TriangleAlert, Upload } from "lucide-react";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import SegmentedControl from "./ui/SegmentedControl";
import { importBudgetData } from "../utils/dataBackup";
import { CurrencyType, currencies, currencyOrder, formatTimeAgo } from "../utils/utils";

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    onDarkModeChange: (darkMode: boolean) => void;
    currency: CurrencyType;
    onCurrencyChange: (currency: CurrencyType) => void;
    lastBackupAt: Date | null;
    onExport: () => void;
    onDataImported: () => void;
}

type ImportStatus = { state: "idle" } | { state: "success" } | { state: "error"; message: string };

const sectionTitleClass = "text-sm font-semibold mb-2";

const SettingsDialog = ({
                            isOpen,
                            onClose,
                            darkMode,
                            onDarkModeChange,
                            currency,
                            onCurrencyChange,
                            lastBackupAt,
                            onExport,
                            onDataImported,
                        }: SettingsDialogProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importStatus, setImportStatus] = useState<ImportStatus>({ state: "idle" });

    // Don't show a previous import's result next time
    useEffect(() => {
        if (isOpen) setImportStatus({ state: "idle" });
    }, [isOpen]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
            await importBudgetData(file);
            setImportStatus({ state: "success" });
            onDataImported();
        } catch (error) {
            setImportStatus({
                state: "error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            });
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            icon={<Settings size={20} />}
            title="Settings"
            footer={
                <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                    Done
                </Button>
            }
        >
            <div className="space-y-6">
                <section>
                    <h3 className={sectionTitleClass}>Appearance</h3>
                    <SegmentedControl
                        label="Theme"
                        fullWidth
                        value={darkMode ? "dark" : "light"}
                        onChange={(theme) => onDarkModeChange(theme === "dark")}
                        options={[
                            { value: "light", label: <><Sun size={16} aria-hidden="true" /> Light</> },
                            { value: "dark", label: <><Moon size={16} aria-hidden="true" /> Dark</> },
                        ]}
                    />
                </section>

                <section>
                    <h3 className={sectionTitleClass}>Currency</h3>
                    <SegmentedControl
                        label="Currency"
                        fullWidth
                        value={currency}
                        onChange={onCurrencyChange}
                        options={currencyOrder.map((code) => ({
                            value: code,
                            label: (
                                <>
                                    <span aria-hidden="true" className="text-fg-subtle">{currencies[code].symbol}</span>
                                    {currencies[code].displayCode}
                                </>
                            ),
                        }))}
                    />
                    <p className="mt-2 text-sm text-fg-muted">
                        {currencies[currency].name}. This only changes the symbol shown; amounts aren't converted.
                    </p>
                </section>

                <section>
                    <h3 className={sectionTitleClass}>Backup &amp; restore</h3>
                    <p className="text-sm text-fg-muted">
                        Your budget is stored only in this browser. Download a backup to keep it safe or
                        move it to another device.
                    </p>
                    <p className="mt-2 text-sm">
                        <span className="text-fg-muted">Last backup: </span>
                        <span className="font-medium">
                            {lastBackupAt
                                ? `${lastBackupAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} (${formatTimeAgo(lastBackupAt)})`
                                : "never"}
                        </span>
                    </p>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button variant="primary" onClick={onExport}>
                            <Download size={16} aria-hidden="true" />
                            Download backup
                        </Button>
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={16} aria-hidden="true" />
                            Restore from file
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json,application/json"
                            className="hidden"
                        />
                    </div>

                    <div role="status" aria-live="polite">
                        {importStatus.state === "success" && (
                            <p className="mt-3 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                                <CircleCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                                Backup restored.
                            </p>
                        )}
                        {importStatus.state === "error" && (
                            <p className="mt-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                                <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                                Couldn't restore: {importStatus.message}
                            </p>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-fg-subtle">
                        Restoring replaces the months in the file; other months are kept.
                    </p>
                </section>
            </div>
        </Dialog>
    );
};

export default SettingsDialog;
