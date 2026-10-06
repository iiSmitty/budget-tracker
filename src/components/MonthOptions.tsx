import { MonthKey, formatMonth, getYear } from "../utils/months";

interface MonthOptionsProps {
    months: MonthKey[];
    // Whether each option repeats its group's year ("October 2026" vs "October"). Keep it when
    // the closed select shows the option's text, so the chosen value is never ambiguous.
    includeYear?: boolean;
}

// <option>s for a month <select>, grouped by year
const MonthOptions = ({ months, includeYear = true }: MonthOptionsProps) => {
    const monthsByYear = new Map<number, MonthKey[]>();
    months.forEach((month) => {
        const year = getYear(month);
        monthsByYear.set(year, [...(monthsByYear.get(year) ?? []), month]);
    });

    return (
        <>
            {[...monthsByYear].map(([year, yearMonths]) => (
                <optgroup key={year} label={String(year)}>
                    {yearMonths.map((month) => (
                        <option key={month} value={month}>
                            {formatMonth(month, { includeYear })}
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};

export default MonthOptions;
