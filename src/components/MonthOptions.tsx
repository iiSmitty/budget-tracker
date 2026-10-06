import { MonthKey, formatMonth, getYear } from "../utils/months";

interface MonthOptionsProps {
    months: MonthKey[];
}

// <option>s for a month <select>, grouped by year
const MonthOptions = ({ months }: MonthOptionsProps) => {
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
                            {formatMonth(month)}
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};

export default MonthOptions;
