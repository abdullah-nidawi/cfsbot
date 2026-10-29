const { x, y } = require("../cfg.json");

const levelScale = Number(x);
const levelExponent = Number(y);

function xpForLevel(level) {
    if (!Number.isInteger(level) || level < 0) {
        throw new RangeError("level must be a non-negative integer");
    }

    return Math.floor((level / levelScale) ** levelExponent + 100);
}

function levelForXp(xp) {
    if (!Number.isFinite(xp) || xp < 0) {
        throw new RangeError("xp must be a finite, non-negative number");
    }

    let level = 0;
    // Meet each threshold to advance, including exact-threshold XP totals.
    while (xp >= xpForLevel(level)) {
        level += 1;
    }
    return level;
}

module.exports = { xpForLevel, levelForXp };
