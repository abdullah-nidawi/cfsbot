const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ModerationAction = require("../../schemas/moderationActionSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("View recent warnings and timeouts for a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => option.setName("user").setDescription("Member history to view").setRequired(true)),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.editReply("You need Moderate Members permission to view moderation history.");
            return;
        }

        const user = interaction.options.getUser("user", true);
        const actions = await ModerationAction.find({ guildId: interaction.guildId, userId: user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("type reason moderatorId durationMs createdAt");

        const description = actions.length
            ? actions.map((action) => {
                const date = action.createdAt.toISOString().slice(0, 10);
                const duration = action.durationMs ? ` (${Math.round(action.durationMs / 60_000)} min)` : "";
                return `**${action.type}**${duration} · ${date} · <@${action.moderatorId}>\n${action.reason.slice(0, 220)}`;
            }).join("\n\n")
            : "No moderation history found.";

        const embed = new EmbedBuilder()
            .setTitle(`Recent moderation history for ${user.username}`)
            .setDescription(description.slice(0, 4_000))
            .setColor("DarkPurple");

        await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
    },

    inGuild: true
};
