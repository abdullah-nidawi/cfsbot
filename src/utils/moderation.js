const { EmbedBuilder } = require("discord.js");
const ModerationAction = require("../schemas/moderationActionSchema");
const Channels = require("../schemas/channelSchema");

const NO_REASON = "No reason provided.";

function normalizeReason(reason) {
    return String(reason || NO_REASON).trim().slice(0, 512) || NO_REASON;
}

function canModerateTarget(actor, target, guild) {
    return !target.user?.bot &&
        target.id !== actor.id &&
        target.id !== guild.ownerId &&
        (actor.id === guild.ownerId || target.roles.highest.comparePositionTo(actor.roles.highest) < 0);
}

async function recordModerationAction({ interaction, target, type, reason, durationMs }) {
    const action = await ModerationAction.create({
        guildId: interaction.guildId,
        userId: target.id,
        moderatorId: interaction.user.id,
        type,
        reason: normalizeReason(reason),
        durationMs
    });

    try {
        const config = await Channels.findOne({ guildId: interaction.guildId });
        if (config?.modLogId) {
            const channel = await interaction.guild.channels.fetch(config.modLogId).catch(() => null);
            if (channel?.isTextBased()) {
                const details = new EmbedBuilder()
                    .setColor(type === "timeout" ? "Orange" : "Yellow")
                    .setTitle(`Member ${type}`)
                    .addFields(
                        { name: "Member", value: `<@${target.id}> (${target.user.tag})`, inline: true },
                        { name: "Moderator", value: `<@${interaction.user.id}>`, inline: true },
                        { name: "Reason", value: action.reason }
                    )
                    .setTimestamp(action.createdAt);

                if (durationMs) {
                    details.addFields({ name: "Duration", value: `${Math.round(durationMs / 60_000)} minutes`, inline: true });
                }

                await channel.send({ embeds: [details], allowedMentions: { parse: [] } });
            }
        }
    } catch (error) {
        console.error("Could not write moderation log:", error);
    }

    return action;
}

module.exports = { NO_REASON, normalizeReason, canModerateTarget, recordModerationAction };
