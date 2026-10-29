const { Schema, model } = require("mongoose");

const channelSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    cfsId: {
        type: String
    },
    rankId: {
        type: String
    },
    modLogId: {
        type: String
    },


}, { timestamps: true });

channelSchema.index({ guildId: 1 });

module.exports = model("channelSchema", channelSchema);
