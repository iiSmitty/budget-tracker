import { Pencil, TriangleAlert } from "lucide-react";
import Button from "./ui/Button";

interface BudgetSummaryProps {
    baseIncome: number;
    additionalIncome: number;
    // Sum of all expenses, and of those marked as paid
    plannedExpenses: number;
    paidExpenses: number;
    formatCurrency: (amount: number) => string;
    onEditIncome: () => void;
}

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/**
 * The month at a glance: what's left (the one big number), then a meter of income showing
 * how much is already paid and how much is still to pay.
 */
const BudgetSummary = ({
                           baseIncome,
                           additionalIncome,
                           plannedExpenses,
                           paidExpenses,
                           formatCurrency,
                           onEditIncome,
                       }: BudgetSummaryProps) => {
    const totalIncome = baseIncome + additionalIncome;
    const remaining = totalIncome - plannedExpenses;
    const toPay = plannedExpenses - paidExpenses;
    const isOverBudget = remaining < 0;

    // The meter spans income, or all expenses when they exceed it (then a marker shows where income ends)
    const scale = Math.max(totalIncome, plannedExpenses);
    const widthOf = (amount: number) => (scale > 0 ? (amount / scale) * 100 : 0);

    return (
        <section aria-label="Summary" className="rounded-2xl bg-surface border border-border p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                    <p className="text-sm font-medium text-fg-muted">
                        {isOverBudget ? "Over budget by" : "Remaining"}
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold tracking-tight">
                        {formatCurrency(Math.abs(remaining))}
                    </p>
                </div>

                {isOverBudget && (
                    <p className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        <TriangleAlert size={14} aria-hidden="true" />
                        Over budget
                    </p>
                )}
            </div>

            {/* Income, with the way to change it right where it's shown */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
                <span>
                    of <span className="font-medium text-fg">{formatCurrency(totalIncome)}</span> income
                    {additionalIncome > 0 && (
                        <span className="text-fg-subtle"> (incl. {formatCurrency(additionalIncome)} extra)</span>
                    )}
                </span>
                <Button variant="ghost" size="xs" onClick={onEditIncome} className="-ml-1">
                    <Pencil size={14} aria-hidden="true" />
                    Edit income
                </Button>
            </div>

            {/* Meter: paid and still-to-pay segments on a track of the whole income */}
            <div
                className="relative mt-5 flex h-3 rounded-full bg-meter-track"
                role="img"
                aria-label={`${formatCurrency(paidExpenses)} paid and ${formatCurrency(toPay)} still to pay, of ${formatCurrency(totalIncome)} income`}
            >
                {paidExpenses > 0 && (
                    <div
                        className="relative z-10 h-full rounded-full bg-meter-paid shadow-[2px_0_0_0_var(--color-surface)] transition-[width] duration-300"
                        style={{ width: `${widthOf(paidExpenses)}%` }}
                    />
                )}
                {toPay > 0 && (
                    <div
                        className="h-full rounded-full bg-meter-planned transition-[width] duration-300"
                        style={{ width: `${widthOf(toPay)}%` }}
                    />
                )}
                {isOverBudget && totalIncome > 0 && (
                    <div
                        className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-red-600 dark:bg-red-400 ring-2 ring-surface"
                        style={{ left: `${widthOf(totalIncome)}%` }}
                        title="Income"
                    />
                )}
            </div>

            {/* Legend: identity is never colour alone, and it doubles as the meter's values */}
            {plannedExpenses === 0 ? (
                <p className="mt-3 text-sm text-fg-subtle">No expenses planned yet.</p>
            ) : (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-meter-paid" aria-hidden="true" />
                            <span className="text-fg-muted">Paid</span>
                            <span className="font-medium">{formatCurrency(paidExpenses)}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-meter-planned" aria-hidden="true" />
                            <span className="text-fg-muted">To pay</span>
                            <span className="font-medium">{formatCurrency(toPay)}</span>
                        </span>
                    </div>
                    <span className="text-fg-subtle">
                        {percent(plannedExpenses, totalIncome)}% of income planned
                        {` · ${percent(paidExpenses, plannedExpenses)}% paid`}
                    </span>
                </div>
            )}
        </section>
    );
};

export default BudgetSummary;
