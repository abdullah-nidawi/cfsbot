const levelSchema = require("../../schemas/levelSchema");
const Channels = require("../../schemas/channelSchema");
const { levelForXp } = require("../../utils/leveling");

const cooldowns = new Map();
const COOLDOWN_MS = 60_000;
const randomIntegerInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = async (message, client) => {
    if (!message.inGuild() || message.author.bot) return;

    // Include the guild so activity in one server never blocks XP in another.
    const cooldownKey = `${message.guild.id}:${message.author.id}`;
    if (cooldowns.has(cooldownKey)) return;

    const timer = setTimeout(() => cooldowns.delete(cooldownKey), COOLDOWN_MS);
    timer.unref?.();
    cooldowns.set(cooldownKey, timer);

    try {
        const msgXp = randomIntegerInRange(15, 25);
        const user = await levelSchema.findOneAndUpdate(
            { userId: message.author.id, guildId: message.guild.id },
            {
                $set: { userName: message.author.username },
                $inc: { xp: msgXp },
                $setOnInsert: { level: 0 }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const nextLevel = levelForXp(user.xp);
        if (nextLevel <= user.level) return;

        user.level = nextLevel;
        await user.save();

        const guildChannels = await Channels.findOne({ guildId: message.guild.id });
        if (!guildChannels?.rankId) return;

        const levelChannel = await message.guild.channels.fetch(guildChannels.rankId).catch(() => null);
        if (!levelChannel?.isTextBased()) return;

        await levelChannel.send({
            content: `Congrats <@${message.author.id}>! You advanced to **level ${user.level}** 🎉`,
            allowedMentions: { users: [message.author.id] }
        });
    } catch (error) {
        clearTimeout(timer);
        cooldowns.delete(cooldownKey);
        console.error("Error giving message XP:", error);
    }
};

