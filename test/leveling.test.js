const test = require("node:test");
const assert = require("node:assert/strict");
const { xpForLevel, levelForXp } = require("../src/utils/leveling");

test("XP thresholds advance at the exact threshold", () => {
    assert.equal(xpForLevel(0), 100);
    assert.equal(levelForXp(99), 0);
    assert.equal(levelForXp(100), 1);
    assert.equal(levelForXp(xpForLevel(1) - 1), 1);
    assert.equal(levelForXp(xpForLevel(1)), 2);
});

test("XP and levels must be finite non-negative values", () => {
    assert.throws(() => levelForXp(-1), RangeError);
    assert.throws(() => levelForXp(Number.NaN), RangeError);
    assert.throws(() => xpForLevel(-1), RangeError);
    assert.throws(() => xpForLevel(1.5), RangeError);
});
