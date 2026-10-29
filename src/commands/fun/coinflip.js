const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flip a coin"),

    run: async ({ interaction }) => {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        await interaction.reply(`${interaction.user.username} flipped **${result}**!`);
    }
};
