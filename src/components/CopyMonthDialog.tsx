import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import Dialog from "./ui/Dialog";
import SegmentedControl from "./ui/SegmentedControl";
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

  // Keyed per step so each step mounts fresh and focus moves into it
  if (isConfirming) {
    return (
      <Dialog
        key="confirm"
        isOpen={isOpen}
        onClose={onClose}
        icon={<Copy size={20} />}
        iconTone="primary"
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
      icon={<Copy size={20} />}
      iconTone="primary"
      title="Copy month"
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
            Continue
          </Button>
        </>
      }
    >
      {/* Toggle between copy modes */}
      <div className="mb-4">
        <SegmentedControl
          label="Copy direction"
          fullWidth
          value={mode}
          onChange={setMode}
          options={[
            { value: "copyFrom", label: "Into this month" },
            { value: "copyTo", label: "From this month" },
          ]}
        />
      </div>

      <label htmlFor="copy-month-select" className="block mb-1 text-sm font-medium">
        {mode === "copyFrom" ? "Copy items from" : `Copy ${currentLabel} items to`}
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
          Choose a month
        </option>
        <MonthOptions months={otherMonths} />
      </select>

      <p className="mt-3 text-sm text-fg-muted">
        Items are added {mode === "copyFrom" ? `to ${currentLabel}` : "to the month you choose"}, unpaid.
        Nothing already there is removed.
      </p>
    </Dialog>
  );
};

export default CopyMonthDialog;
