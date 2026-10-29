const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const Channels = require("../../schemas/channelSchema");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setup-channels")
		.setDescription("Configure confession, level-up, and moderation log channels")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addChannelOption((option) => option
			.setName("confessions")
			.setDescription("Channel for confession posts")
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
		.addChannelOption((option) => option
			.setName("level-updates")
			.setDescription("Channel for level-up notices")
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
		.addChannelOption((option) => option
			.setName("moderation-log")
			.setDescription("Optional channel for moderation actions")
			.addChannelTypes(ChannelType.GuildText)),

	run: async ({ interaction }) => {
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
			await interaction.reply({ content: "You need Manage Server permission to configure channels.", ephemeral: true });
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		const confessionChannel = interaction.options.getChannel("confessions", true);
		const levelChannel = interaction.options.getChannel("level-updates", true);
		const modLogChannel = interaction.options.getChannel("moderation-log");
		const update = { cfsId: confessionChannel.id, rankId: levelChannel.id };
		if (modLogChannel) update.modLogId = modLogChannel.id;

		const savedChannels = await Channels.findOneAndUpdate(
			{ guildId: interaction.guildId },
			{ $set: update, $setOnInsert: { guildId: interaction.guildId } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		// Older versions inserted a new settings document each time; keep the selected one.
		await Channels.deleteMany({ guildId: interaction.guildId, _id: { $ne: savedChannels._id } });

		const modLogText = modLogChannel ? ` Moderation logs will go to <#${modLogChannel.id}>.` : "";
		await interaction.editReply(`Confessions: <#${confessionChannel.id}> · Level updates: <#${levelChannel.id}>.${modLogText}`);
	},

	inGuild: true
};
