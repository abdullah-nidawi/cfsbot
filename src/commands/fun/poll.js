const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function pollEmbed(question, options, votes) {
    const counts = options.map((_, index) => [...votes.values()].filter((vote) => vote === index).length);
    const choices = options.map((option, index) => `**${index + 1}. ${option}** — ${counts[index]} vote(s)`).join("\n");
    return new EmbedBuilder()
        .setTitle(question)
        .setDescription(`${choices}\n\nVote using a button below. You can change your vote while the poll is open.`)
        .setColor("DarkPurple");
}

function pollButtons(interactionId, options, disabled = false) {
    return new ActionRowBuilder().addComponents(options.map((option, index) => new ButtonBuilder()
        .setCustomId(`poll:${interactionId}:${index}`)
        .setLabel(option)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled)));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a two-choice poll")
        .addStringOption((option) => option.setName("question").setDescription("What should people vote on?").setRequired(true).setMaxLength(200))
        .addStringOption((option) => option.setName("option-one").setDescription("First choice").setRequired(true).setMaxLength(80))
        .addStringOption((option) => option.setName("option-two").setDescription("Second choice").setRequired(true).setMaxLength(80))
        .addIntegerOption((option) => option.setName("minutes").setDescription("How long the poll stays open (1–1440)").setMinValue(1).setMaxValue(1440)),

    run: async ({ interaction }) => {
        const question = interaction.options.getString("question", true);
        const options = [
            interaction.options.getString("option-one", true),
            interaction.options.getString("option-two", true)
        ];
        const duration = (interaction.options.getInteger("minutes") || 60) * 60_000;
        const votes = new Map();

        await interaction.reply({
            embeds: [pollEmbed(question, options, votes)],
            components: [pollButtons(interaction.id, options)]
        });

        const message = await interaction.fetchReply();
        const collector = message.createMessageComponentCollector({
            filter: (component) => component.customId.startsWith(`poll:${interaction.id}:`),
            time: duration
        });

        collector.on("collect", async (component) => {
            const selectedIndex = Number(component.customId.split(":").at(-1));
            votes.set(component.user.id, selectedIndex);
            await component.update({
                embeds: [pollEmbed(question, options, votes)],
                components: [pollButtons(interaction.id, options)]
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({
                embeds: [pollEmbed(question, options, votes).setFooter({ text: "Poll closed" })],
                components: [pollButtons(interaction.id, options, true)]
            }).catch(() => {});
        });
    }
};
