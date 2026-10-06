import { describe, expect, it } from "vitest";
import { formatCurrency, formatTimeAgo, pluralise } from "./utils";

// Intl uses non-breaking spaces; compare with ordinary ones
const plain = (text: string) => text.replace(/\u00a0/g, " ");

describe("formatCurrency", () => {
    it("adds thousands separators and two decimals, with a '.' decimal point for every currency", () => {
        expect(plain(formatCurrency(33898.5, "ZAR"))).toBe("R 33,898.50");
        expect(formatCurrency(33898.5, "EUR")).toBe("€33,898.50");
        expect(formatCurrency(33898.5, "NZD")).toBe("$33,898.50");
    });

    it("handles zero and negative amounts", () => {
        expect(plain(formatCurrency(0, "ZAR"))).toBe("R 0.00");
        expect(formatCurrency(-1200, "EUR")).toBe("-€1,200.00");
    });
});

describe("formatTimeAgo", () => {
    const now = new Date(2026, 9, 6, 12);
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

    it("uses days, then months, then years", () => {
        expect(formatTimeAgo(daysAgo(0), now)).toBe("today");
        expect(formatTimeAgo(daysAgo(1), now)).toBe("yesterday");
        expect(formatTimeAgo(daysAgo(12), now)).toBe("12 days ago");
        expect(formatTimeAgo(daysAgo(65), now)).toBe("2 months ago");
        expect(formatTimeAgo(daysAgo(400), now)).toBe("last year");
    });
});

describe("pluralise", () => {
    it("picks the singular for exactly one", () => {
        expect(pluralise(1, "expense")).toBe("1 expense");
        expect(pluralise(0, "expense")).toBe("0 expenses");
        expect(pluralise(3, "entry", "entries")).toBe("3 entries");
    });
});
