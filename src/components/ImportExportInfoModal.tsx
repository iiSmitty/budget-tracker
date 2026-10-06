import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import { STORAGE_KEYS } from "../utils/storage";

interface ImportExportInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportExportInfoModal = ({
  isOpen,
  onClose,
}: ImportExportInfoModalProps) => {
  // However the modal is closed, remember that it has been seen so it only ever shows once
  const handleClose = () => {
    localStorage.setItem(STORAGE_KEYS.importExportInfoSeen, "true");
    onClose();
  };

  const listClass = "list-disc pl-5 space-y-1.5 text-sm md:text-base text-fg-muted";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon="💾"
      title="Data backup and restore"
      description="This message only appears once."
      footer={
        <Button variant="primary" onClick={handleClose} className="w-full sm:w-auto">
          Got it!
        </Button>
      }
    >
      <div className="space-y-5">
        <section>
          <h3 className="text-base md:text-lg font-medium mb-2">Why is this important?</h3>
          <p className="mb-2 text-sm md:text-base text-fg-muted">
            BudgetTracker stores all your data locally in your browser. This means:
          </p>
          <ul className={listClass}>
            <li>
              <strong>Clearing cache</strong> will delete your budget data
            </li>
            <li>
              <strong>Different devices</strong> won't share your data
            </li>
            <li>No automatic cloud backup is available</li>
          </ul>
        </section>

        <section className="pb-5 border-b border-border">
          <h3 className="text-base md:text-lg font-medium mb-2">How to use Import/Export</h3>
          <ul className={listClass}>
            <li>
              <strong>Export</strong>: Save a backup file of your budget data
            </li>
            <li>
              <strong>Import</strong>: Restore data from a previous backup
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-medium mb-2">When to use this feature</h3>
          <ul className={listClass}>
            <li>Before switching devices</li>
            <li>Before clearing cache</li>
            <li>Monthly as backup</li>
            <li>To share between devices</li>
          </ul>
        </section>
      </div>
    </Dialog>
  );
};

export default ImportExportInfoModal;
