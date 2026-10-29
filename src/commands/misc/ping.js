const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Check the bot's response latency"),

	run: async ({ interaction, client }) => {
		await interaction.reply(`Pong! ${client.ws.ping}ms`);
	},

	devOnly: true,
	inGuild: true
};
