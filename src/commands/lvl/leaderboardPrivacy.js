const { SlashCommandBuilder } = require("discord.js");
const Level = require("../../schemas/levelSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard-privacy")
        .setDescription("Choose whether your rank appears on the server leaderboard")
        .addBooleanOption((option) => option
            .setName("hide")
            .setDescription("Set true to hide your rank, or false to appear on the leaderboard")
            .setRequired(true)),

    run: async ({ interaction }) => {
        const hide = interaction.options.getBoolean("hide", true);
        await interaction.deferReply({ ephemeral: true });
        await Level.findOneAndUpdate(
            { userId: interaction.user.id, guildId: interaction.guildId },
            {
                $set: { hideFromLeaderboard: hide },
                $setOnInsert: { userName: interaction.user.username, level: 0, xp: 0 }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await interaction.editReply({
            content: hide ? "Your rank is hidden from the server leaderboard." : "Your rank will appear on the server leaderboard.",
        });
    },

    inGuild: true
};
