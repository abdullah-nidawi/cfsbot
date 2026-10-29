const Channels = require("../schemas/channelSchema");

module.exports = async (interaction, commandObj) => {
    if (!interaction.inGuild() || commandObj.name !== "confess") return false;

    try {
        const guildChannels = await Channels.findOne({ guildId: interaction.guild.id });
        if (!guildChannels) {
            await interaction.reply({ content: "Use /setup-channels first to assign a channel for this command.", ephemeral: true });
            return true;
        }
        if (interaction.channelId !== guildChannels.cfsId) {
            await interaction.reply({ content: `This command is only available in <#${guildChannels.cfsId}>`, ephemeral: true });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Could not validate confession channel:", error);
        await interaction.reply({ content: "Channel settings could not be checked. Please try again later.", ephemeral: true });
        return true;
    }
};
