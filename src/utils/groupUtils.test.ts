import { describe, expect, it } from "vitest";
import { sortGroupsByName } from "./groupUtils";

const group = (name: string) => ({ id: name, name });

describe("sortGroupsByName", () => {
    it("sorts by name, ignoring case, with numbers in natural order", () => {
        const sorted = sortGroupsByName(
            ["Transport", "savings", "Core Living Costs", "A&A", "Group 10", "Group 2"].map(group)
        );
        expect(sorted.map((g) => g.name)).toEqual([
            "A&A",
            "Core Living Costs",
            "Group 2",
            "Group 10",
            "savings",
            "Transport",
        ]);
    });

    it("returns a sorted copy, leaving the stored order alone", () => {
        const groups = ["B", "A"].map(group);
        sortGroupsByName(groups);
        expect(groups.map((g) => g.name)).toEqual(["B", "A"]);
    });
});
