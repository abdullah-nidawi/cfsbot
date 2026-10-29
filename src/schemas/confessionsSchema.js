const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    confessions: [{
        confText: String,
        confDate: Date
    }]


}, { timestamps: true });

userSchema.index({ userId: 1 });

module.exports = model("userSchema", userSchema);
