const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const canvacord = require("canvacord");
const Level = require("../../schemas/levelSchema");
const { xpForLevel } = require("../../utils/leveling");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("View your rank card or another member's public rank")
        .addUserOption((option) => option
            .setName("user")
            .setDescription("Member whose rank you want to view")),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const selectedUser = interaction.options.getUser("user");
        const member = selectedUser || interaction.user;
        if (member.bot) {
            await interaction.editReply("Bots don't have ranks 💀");
            return;
        }

        const level = await Level.findOne({ userId: member.id, guildId: interaction.guildId });
        if (!level || level.xp === 0) {
            await interaction.editReply(selectedUser ? "That member hasn't earned XP yet." : "You haven't earned XP yet.");
            return;
        }

        if (selectedUser && selectedUser.id !== interaction.user.id && level.hideFromLeaderboard) {
            await interaction.editReply("That member has hidden their rank.");
            return;
        }

        const higherRankedUsers = await Level.countDocuments({
            guildId: interaction.guildId,
            hideFromLeaderboard: { $ne: true },
            $or: [
                { level: { $gt: level.level } },
                { level: level.level, xp: { $gt: level.xp } },
                { level: level.level, xp: level.xp, userId: { $lt: member.id } }
            ]
        });
        const currentRank = higherRankedUsers + 1;

        const rankCard = new canvacord.Rank()
            .setAvatar(member.displayAvatarURL({ size: 256 }))
            .setRank(currentRank)
            .setRankColor("#94ffda")
            .setLevel(level.level)
            .setLevelColor("#94ffda")
            .setCurrentXP(level.xp, "#f9cfff")
            .setRequiredXP(xpForLevel(level.level), "#f9cfff")
            .setProgressBar(["#f9cfff", "#ea5592"], "GRADIENT")
            .setUsername(member.username)
            .setCustomStatusColor("#fff");

        const image = await rankCard.build();
        await interaction.editReply({
            content: `${member.username}: level ${level.level}, ${level.xp} XP, rank #${currentRank}.`,
            files: [new AttachmentBuilder(image)]
        });
    },

    inGuild: true
};
