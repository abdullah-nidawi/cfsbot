const UserSchema = require("../schemas/confessionsSchema");

module.exports = async (interaction, commandObj) => {
    if (!interaction.inGuild() || commandObj.name !== "confess") return false;

    try {
        const userProfile = await UserSchema.findOne({ userId: interaction.user.id });
        const confessions = userProfile?.confessions || [];
        const lastConfession = confessions[confessions.length - 1];

        if (lastConfession?.confDate) {
            const elapsedMinutes = (Date.now() - lastConfession.confDate.getTime()) / 60_000;
            if (elapsedMinutes < 10) {
                await interaction.reply({
                    content: `You can confess again in ${Math.ceil(10 - elapsedMinutes)} min.`,
                    ephemeral: true
                });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Could not check confession cooldown:", error);
        await interaction.reply({ content: "The confession cooldown could not be checked. Please try again later.", ephemeral: true });
        return true;
    }
};
