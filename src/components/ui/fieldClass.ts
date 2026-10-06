interface FieldOptions {
    // Focus ring colour: income fields use green to match the income styling
    accent?: "primary" | "income";
    // Leaves room on the left for an absolutely positioned prefix such as a currency symbol
    hasPrefix?: boolean;
}

// Shared styling for text inputs and selects. text-base keeps iOS from zooming on focus.
// Options exist instead of appending classes, because conflicting utilities have no reliable order.
export const fieldClass = ({ accent = "primary", hasPrefix = false }: FieldOptions = {}): string =>
    `w-full py-2 rounded-lg text-base bg-field text-fg border border-border-strong placeholder:text-fg-subtle focus:outline-none focus:ring-2 ${
        hasPrefix ? "pl-8 pr-3" : "px-3"
    } ${accent === "income" ? "focus:ring-green-500" : "focus:ring-primary"}`;
