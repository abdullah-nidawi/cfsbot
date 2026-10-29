const test = require("node:test");
const assert = require("node:assert/strict");
const { NO_REASON, normalizeReason, canModerateTarget } = require("../src/utils/moderation");

test("moderation reasons have a safe default and maximum length", () => {
    assert.equal(normalizeReason("   "), NO_REASON);
    assert.equal(normalizeReason("  spam  "), "spam");
    assert.equal(normalizeReason("x".repeat(600)).length, 512);
});

test("moderators cannot act on themselves, the owner, or higher roles", () => {
    const actor = { id: "actor", roles: { highest: { comparePositionTo: () => 0 } } };
    const lowerTarget = { id: "member", roles: { highest: { comparePositionTo: () => -1 } } };
    const higherTarget = { id: "admin", roles: { highest: { comparePositionTo: () => 1 } } };
    const guild = { ownerId: "owner" };
    const owner = { id: "owner", roles: { highest: { comparePositionTo: () => -1 } } };

    assert.equal(canModerateTarget(actor, lowerTarget, guild), true);
    assert.equal(canModerateTarget(actor, higherTarget, guild), false);
    assert.equal(canModerateTarget(actor, actor, guild), false);
    assert.equal(canModerateTarget(actor, { ...lowerTarget, id: "owner" }, guild), false);
    assert.equal(canModerateTarget(owner, higherTarget, guild), true);
});
