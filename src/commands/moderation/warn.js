const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { canModerateTarget, normalizeReason, recordModerationAction } = require("../../utils/moderation");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Record a warning for a server member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => option.setName("user").setDescription("Member to warn").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Why you are warning them").setMaxLength(512)),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.editReply("You need Moderate Members permission to warn someone.");
            return;
        }

        const user = interaction.options.getUser("user", true);
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) {
            await interaction.editReply("That user is not a member of this server.");
            return;
        }
        if (!canModerateTarget(interaction.member, target, interaction.guild)) {
            await interaction.editReply("You can only warn members below your highest role, and you cannot warn yourself or the server owner.");
            return;
        }

        try {
            const reason = normalizeReason(interaction.options.getString("reason"));
            await recordModerationAction({ interaction, target, type: "warn", reason });
            await interaction.editReply({
                content: `Warning recorded for <@${target.id}>. Reason: ${reason}`,
                allowedMentions: { parse: [] }
            });
        } catch (error) {
            console.error("Could not record warning:", error);
            await interaction.editReply("The warning could not be recorded. Please try again later.");
        }
    },

    inGuild: true
};
