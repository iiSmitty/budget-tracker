import { describe, expect, it } from "vitest";
import {
    addMonths,
    formatMonth,
    getCurrentMonthKey,
    getMonthRange,
    getSelectableMonths,
    isMonthKey,
    legacyMonthNameToKey,
    toMonthKey,
} from "./months";

describe("toMonthKey", () => {
    it("zero-pads the month", () => {
        expect(toMonthKey(2026, 0)).toBe("2026-01");
        expect(toMonthKey(2026, 9)).toBe("2026-10");
    });

    it("rolls out-of-range months into neighbouring years", () => {
        expect(toMonthKey(2026, 12)).toBe("2027-01");
        expect(toMonthKey(2026, -1)).toBe("2025-12");
    });
});

describe("addMonths", () => {
    it("crosses year boundaries in both directions", () => {
        expect(addMonths("2026-12", 1)).toBe("2027-01");
        expect(addMonths("2026-01", -1)).toBe("2025-12");
        expect(addMonths("2026-10", -13)).toBe("2025-09");
        expect(addMonths("2026-10", 0)).toBe("2026-10");
    });
});

describe("isMonthKey", () => {
    it("accepts YYYY-MM only", () => {
        expect(isMonthKey("2026-10")).toBe(true);
        expect(isMonthKey("2026-13")).toBe(false);
        expect(isMonthKey("2026-00")).toBe(false);
        expect(isMonthKey("2026-1")).toBe(false);
        expect(isMonthKey("October")).toBe(false);
        expect(isMonthKey(null)).toBe(false);
    });
});

describe("formatMonth", () => {
    it("formats with or without the year", () => {
        expect(formatMonth("2026-10")).toBe("October 2026");
        expect(formatMonth("2026-01", { includeYear: false })).toBe("January");
    });
});

describe("getCurrentMonthKey", () => {
    it("uses the given date", () => {
        expect(getCurrentMonthKey(new Date(2026, 9, 6))).toBe("2026-10");
    });
});

describe("getMonthRange", () => {
    it("includes both ends, across a year boundary", () => {
        expect(getMonthRange("2026-11", "2027-02")).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
    });

    it("is empty when the range is reversed", () => {
        expect(getMonthRange("2026-02", "2026-01")).toEqual([]);
    });
});

describe("getSelectableMonths", () => {
    const now = new Date(2026, 9, 6);

    it("spans a year either side of today by default", () => {
        const months = getSelectableMonths([], "2026-10", now);
        expect(months[0]).toBe("2025-10");
        expect(months[months.length - 1]).toBe("2027-10");
        expect(months).toHaveLength(25);
    });

    it("widens to include months with data far outside that window", () => {
        const months = getSelectableMonths(["2020-03", "2030-01"], "2026-10", now);
        expect(months[0]).toBe("2020-03");
        expect(months[months.length - 1]).toBe("2030-01");
    });

    it("always includes the months either side of the one being viewed", () => {
        const months = getSelectableMonths([], "2010-06", now);
        expect(months).toContain("2010-05");
        expect(months).toContain("2010-07");
    });
});

describe("legacyMonthNameToKey", () => {
    it("maps English month names onto the given year", () => {
        expect(legacyMonthNameToKey("October", 2026)).toBe("2026-10");
        expect(legacyMonthNameToKey("January", 2025)).toBe("2025-01");
    });

    it("returns null for anything else", () => {
        expect(legacyMonthNameToKey("Oktober", 2026)).toBeNull();
        expect(legacyMonthNameToKey("2026-10", 2026)).toBeNull();
    });
});
