module.exports = function withCommandErrorHandling(commandName, run) {
    return async (context) => {
        try {
            return await run(context);
        } catch (error) {
            console.error(`Command /${commandName} failed:`, error);
            const { interaction } = context;
            const message = "Something went wrong while running this command. Please try again later.";

            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: message, embeds: [], files: [], components: [] });
                } else {
                    await interaction.reply({ content: message, ephemeral: true });
                }
            } catch (replyError) {
                console.error(`Could not report failure for /${commandName}:`, replyError);
            }
        }
    };
};
