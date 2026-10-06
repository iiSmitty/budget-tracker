import { ChevronDown, ChevronLeft, ChevronRight, Copy, CornerUpLeft } from "lucide-react";
import { MonthKey, addMonths, formatMonth, getCurrentMonthKey, getYear } from "../utils/months";
import Button from "./ui/Button";
import MonthOptions from "./MonthOptions";

interface MonthSelectorProps {
  currentMonth: MonthKey;
  // Months offered in the dropdown, oldest first
  months: MonthKey[];
  onMonthChange: (month: MonthKey) => void;
  onCopyClick: () => void;
}

const MonthSelector = ({ currentMonth, months, onMonthChange, onCopyClick }: MonthSelectorProps) => {
  const thisMonth = getCurrentMonthKey();
  const isThisMonth = currentMonth === thisMonth;
  const previousMonth = addMonths(currentMonth, -1);
  const nextMonth = addMonths(currentMonth, 1);

  // "Back to October", with the year only when it differs from the month being viewed
  const thisMonthLabel = formatMonth(thisMonth, {
    includeYear: getYear(thisMonth) !== getYear(currentMonth),
  });

  return (
    <nav aria-label="Month" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h2 className="sr-only">{formatMonth(currentMonth)} budget</h2>

      {/* Step with the arrows, or jump with the month name (a native picker) */}
      <div className="flex items-center gap-1 -ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(previousMonth)}
          aria-label={`Previous month (${formatMonth(previousMonth)})`}
          title={formatMonth(previousMonth)}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </Button>

        {/* A select is as wide as its longest option. Here an invisible copy of the current
            label sets the width and the select is laid over it, so the chevron hugs the name */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="invisible block pl-2 pr-8 py-1 text-2xl sm:text-3xl font-bold tracking-tight whitespace-nowrap"
          >
            {formatMonth(currentMonth)}
          </span>
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            aria-label="Choose month"
            className="absolute inset-0 w-full appearance-none bg-transparent pl-2 pr-8 py-1 rounded-lg text-2xl sm:text-3xl font-bold tracking-tight cursor-pointer hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MonthOptions months={months} />
          </select>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(nextMonth)}
          aria-label={`Next month (${formatMonth(nextMonth)})`}
          title={formatMonth(nextMonth)}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Always say where you are: quietly when it's now, actionably when it isn't */}
        {isThisMonth ? (
          <span className="inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium bg-surface-muted text-fg-muted">
            Current month
          </span>
        ) : (
          <Button variant="soft" size="sm" onClick={() => onMonthChange(thisMonth)}>
            <CornerUpLeft size={16} aria-hidden="true" />
            Back to {thisMonthLabel}
          </Button>
        )}

        <Button variant="secondary" size="sm" onClick={onCopyClick} aria-label="Copy month" title="Copy month">
          <Copy size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Copy</span>
        </Button>
      </div>
    </nav>
  );
};

export default MonthSelector;
