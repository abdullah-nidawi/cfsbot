const { Schema, model } = require("mongoose");

const moderationActionSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    type: { type: String, enum: ["warn", "timeout"], required: true },
    reason: { type: String, required: true, maxlength: 512 },
    durationMs: { type: Number }
}, { timestamps: true });

moderationActionSchema.index({ guildId: 1, userId: 1, createdAt: -1 });

module.exports = model("moderationAction", moderationActionSchema);
