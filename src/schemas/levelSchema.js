const { Schema, model } = require("mongoose");

const levelSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String
    },
    guildId: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    hideFromLeaderboard: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });

levelSchema.index({ guildId: 1, level: -1, xp: -1, userId: 1 });

module.exports = model("levelSchema", levelSchema);
