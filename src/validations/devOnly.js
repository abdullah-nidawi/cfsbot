const developerId = process.env.DEV_USER_ID;

module.exports = async (interaction, commandObj, handler, client) => {
	if (commandObj.devOnly) {
		if (!developerId || interaction.user.id !== developerId) {
			await interaction.reply({ content: "This command is for the developer only ⛔", ephemeral: true });
			return true; // This must be added to stop the command from being executed.
		}
	}
};
