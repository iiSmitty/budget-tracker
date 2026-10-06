import { ReactNode, useId } from "react";

interface SegmentedControlOption<T extends string> {
    value: T;
    label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
    // Accessible name for the group (visually hidden)
    label: string;
    options: SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
    // Stretch to the container's width instead of fitting the options
    fullWidth?: boolean;
}

/**
 * Pick one of a few options. Built on native radio buttons, so it gets arrow-key navigation
 * and screen reader semantics for free; the radios are hidden and their labels styled.
 */
const SegmentedControl = <T extends string>({
                                                label,
                                                options,
                                                value,
                                                onChange,
                                                fullWidth = false,
                                            }: SegmentedControlProps<T>) => {
    const name = useId();

    return (
        <fieldset className={fullWidth ? "w-full" : "inline-block"}>
            <legend className="sr-only">{label}</legend>
            <div className="flex gap-1 p-1 rounded-lg bg-surface-muted">
                {options.map((option) => (
                    <label key={option.value} className="flex-1 min-w-0">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="peer sr-only"
                        />
                        <span className="flex items-center justify-center gap-2 h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors text-fg-muted hover:text-fg peer-checked:bg-surface peer-checked:text-fg peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
};

export default SegmentedControl;
