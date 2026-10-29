const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Level = require("../../schemas/levelSchema");
const { levelForXp } = require("../../utils/leveling");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("givexp")
        .setDescription("Give a positive whole number of XP to a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption((option) => option
            .setName("user")
            .setDescription("Member who will receive XP")
            .setRequired(true))
        .addIntegerOption((option) => option
            .setName("xp")
            .setDescription("Amount of XP to give (1–100000)")
            .setMinValue(1)
            .setMaxValue(100000)
            .setRequired(true)),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.editReply("You need Manage Server permission to give XP.");
            return;
        }

        const member = interaction.options.getUser("user", true);
        if (member.bot) {
            await interaction.editReply("You cannot give XP to bots 💀");
            return;
        }

        const user = await Level.findOne({ userId: member.id, guildId: interaction.guildId });
        if (!user) {
            await interaction.editReply("That member needs to chat and earn XP first.");
            return;
        }

        const previousLevel = user.level;
        const givenXp = interaction.options.getInteger("xp", true);
        user.xp += givenXp;
        user.level = levelForXp(user.xp);
        await user.save();

        if (user.level > previousLevel) {
            await interaction.channel.send({
                content: `Congrats ${member.username}! You advanced to **level ${user.level}** 🎉`
            }).catch((error) => console.error("Could not send level-up notice:", error));
        }

        await interaction.editReply(`Gave ${member.username} ${givenXp} XP.`);
    },

    inGuild: true
};
