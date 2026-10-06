import { useState, useEffect } from "react";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import { fieldClass } from "./ui/fieldClass";
import MonthOptions from "./MonthOptions";
import { MonthKey, addMonths, formatMonth } from "../utils/months";

interface CopyMonthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Months that can be picked, oldest first
  months: MonthKey[];
  currentMonth: MonthKey;
  onCopy: (fromMonth: MonthKey, toMonth: MonthKey) => void;
}

type CopyMode = "copyFrom" | "copyTo";

const CopyMonthDialog = ({
  isOpen,
  onClose,
  months,
  currentMonth,
  onCopy,
}: CopyMonthDialogProps) => {
  const [sourceMonth, setSourceMonth] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [mode, setMode] = useState<CopyMode>("copyFrom");
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset state when the dialog opens, suggesting the usual choices: copy last month's
  // budget into this one, or this month's into next month
  useEffect(() => {
    if (isOpen) {
      setSourceMonth(addMonths(currentMonth, -1));
      setTargetMonth(addMonths(currentMonth, 1));
      setMode("copyFrom");
      setIsConfirming(false);
    }
  }, [isOpen, currentMonth]);

  // Get source and destination based on mode
  const fromMonth = mode === "copyFrom" ? sourceMonth : currentMonth;
  const toMonth = mode === "copyFrom" ? currentMonth : targetMonth;
  const otherMonth = mode === "copyFrom" ? sourceMonth : targetMonth;

  const fromLabel = fromMonth && formatMonth(fromMonth);
  const toLabel = toMonth && formatMonth(toMonth);
  const currentLabel = formatMonth(currentMonth);

  const handleConfirmCopy = () => {
    onCopy(fromMonth, toMonth);
    onClose();
  };

  const otherMonths = months.filter((month) => month !== currentMonth);

  const modeButtonClass = (buttonMode: CopyMode) =>
    `flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      mode === buttonMode
        ? "bg-primary text-white shadow-sm"
        : "text-fg-muted hover:text-fg"
    }`;

  // Keyed per step so each step mounts fresh and focus moves into it
  if (isConfirming) {
    return (
      <Dialog
        key="confirm"
        isOpen={isOpen}
        onClose={onClose}
        title="Confirm copy"
        description={`This will copy all items from ${fromLabel} to ${toLabel}. Anything already in ${toLabel} stays as it is.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirming(false)}>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirmCopy}>
              Copy to {toLabel}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <Dialog
      key="choose"
      isOpen={isOpen}
      onClose={onClose}
      title="Copy month data"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsConfirming(true)}
            disabled={!otherMonth}
          >
            Copy Expenses
          </Button>
        </>
      }
    >
      {/* Toggle between copy modes */}
      <div className="flex gap-1 p-1 mb-4 rounded-lg bg-surface-muted" role="group" aria-label="Copy direction">
        <button
          type="button"
          onClick={() => setMode("copyFrom")}
          aria-pressed={mode === "copyFrom"}
          className={modeButtonClass("copyFrom")}
        >
          Copy FROM another month
        </button>
        <button
          type="button"
          onClick={() => setMode("copyTo")}
          aria-pressed={mode === "copyTo"}
          className={modeButtonClass("copyTo")}
        >
          Copy TO another month
        </button>
      </div>

      <label htmlFor="copy-month-select" className="block mb-2 text-sm text-fg-muted">
        {mode === "copyFrom"
          ? "Select a month to copy expenses FROM:"
          : `Your current month (${currentLabel}) expenses will be copied TO:`}
      </label>
      <select
        id="copy-month-select"
        value={otherMonth}
        onChange={(e) =>
          mode === "copyFrom"
            ? setSourceMonth(e.target.value)
            : setTargetMonth(e.target.value)
        }
        className={fieldClass()}
      >
        <option value="">
          {mode === "copyFrom" ? "Select source month" : "Select target month"}
        </option>
        <MonthOptions months={otherMonths} />
      </select>

      {mode === "copyFrom" && (
        <p className="mt-3 text-sm text-fg-muted">
          Expenses will be copied TO your current month ({currentLabel}).
        </p>
      )}
    </Dialog>
  );
};

export default CopyMonthDialog;
