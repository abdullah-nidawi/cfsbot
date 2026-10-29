const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Level = require("../../schemas/levelSchema");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("resetxp")
        .setDescription("Reset a member's XP and level")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("who do you wanna reset?")
                .setRequired(true)),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.editReply({ content: "You need Manage Server permission to reset XP." });
            return;
        }

        const member = interaction.options.getUser("user", true);

        if (member.bot) {
            await interaction.editReply({
                content: `Can't use this command on bots 💀.`
            });

            return;
        }

        const user = await Level.findOne({
            userId: member.id,
            guildId: interaction.guild.id
        });

        if (!user || user.xp === 0) {
            await interaction.editReply({
                content: `Nah chill 💀.`
            });

            return;
        }

        user.xp = 0;
        user.level = 0;
        await user.save();
        await interaction.editReply({
            content: `${member.username}'s rank has been reset 💀.`
        });
    },

    inGuild: true
};
