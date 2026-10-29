const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Confessions = require("../../schemas/confessionsSchema");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("confess")
		.setDescription("Submit an anonymous confession")
		.addStringOption((option) => option
			.setName("confession")
			.setDescription("Confession text (up to 1000 characters)")
			.setMaxLength(1000)
			.setRequired(true)),

	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true });

		const confession = interaction.options.getString("confession", true);
		let profile = await Confessions.findOne({ userId: interaction.user.id });
		if (!profile) {
			profile = new Confessions({ userName: interaction.user.username, userId: interaction.user.id });
		}

		profile.confessions.push({ confText: confession, confDate: new Date() });
		await profile.save();

		await interaction.channel.send({
			embeds: [new EmbedBuilder()
				.setDescription(`"${confession}"`)
				.setTitle("Anonymous confession")
				.setFooter({ text: "Report abuse or misuse to the moderators." })
				.setColor("DarkPurple")
				.setTimestamp()],
			allowedMentions: { parse: [] }
		});

		await interaction.editReply("Your confession has been submitted.");
	},

	inGuild: true
};
