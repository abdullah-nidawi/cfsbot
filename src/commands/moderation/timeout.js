const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { canModerateTarget, normalizeReason, recordModerationAction } = require("../../utils/moderation");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Temporarily prevent a member from participating")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => option.setName("user").setDescription("Member to timeout").setRequired(true))
        .addIntegerOption((option) => option
            .setName("minutes")
            .setDescription("Timeout length, from 1 minute to 28 days")
            .setMinValue(1)
            .setMaxValue(40_320)
            .setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Why you are timing them out").setMaxLength(512)),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.editReply("You need Moderate Members permission to use timeouts.");
            return;
        }

        const user = interaction.options.getUser("user", true);
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) {
            await interaction.editReply("That user is not a member of this server.");
            return;
        }
        if (!canModerateTarget(interaction.member, target, interaction.guild) || !target.moderatable) {
            await interaction.editReply("You cannot timeout that member. Check role order and the bot's permissions.");
            return;
        }

        const minutes = interaction.options.getInteger("minutes", true);
        const durationMs = minutes * 60_000;
        const reason = normalizeReason(interaction.options.getString("reason"));

        try {
            await target.timeout(durationMs, reason);
        } catch (error) {
            console.error("Could not apply timeout:", error);
            await interaction.editReply("The timeout could not be completed. Check the bot's permissions and role position.");
            return;
        }

        try {
            await recordModerationAction({ interaction, target, type: "timeout", reason, durationMs });
        } catch (error) {
            console.error("Timeout applied, but moderation history could not be saved:", error);
            await interaction.editReply("The timeout was applied, but its moderation history could not be saved.");
            return;
        }

        try {
            await interaction.editReply({
                content: `<@${target.id}> was timed out for ${minutes} minute(s). Reason: ${reason}`,
                allowedMentions: { parse: [] }
            });
        } catch (error) {
            console.error("Could not respond after applying timeout:", error);
        }
    },

    inGuild: true
};
