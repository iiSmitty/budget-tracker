import { useEffect, useId, useState } from "react";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import { fieldClass } from "./ui/fieldClass";

interface IncomeEditorProps {
  isOpen: boolean;
  onClose: (income: number | null) => void;
  currentIncome: number;
  currencySymbol: string;
  month: string;
}

const IncomeEditor = ({
  isOpen,
  onClose,
  currentIncome,
  currencySymbol,
  month,
}: IncomeEditorProps) => {
  const formId = useId();
  const inputId = useId();
  // Keep the raw text so the field can be emptied while typing; it's parsed on save
  const [income, setIncome] = useState(String(currentIncome));

  // Start from the saved income every time the editor opens
  useEffect(() => {
    if (isOpen) {
      setIncome(String(currentIncome));
    }
  }, [isOpen, currentIncome]);

  const parsedIncome = parseFloat(income);
  const isValid = income.trim() !== "" && !isNaN(parsedIncome) && parsedIncome >= 0;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onClose(parsedIncome);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => onClose(null)}
      title={`Update ${month} income`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onClose(null)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="success" disabled={!isValid}>
            Save
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="block text-sm font-medium mb-2">
          Income Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
            {currencySymbol}
          </span>
          <input
            id={inputId}
            type="number"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${fieldClass({ hasPrefix: true })} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default IncomeEditor;
