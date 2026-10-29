const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const questions = require("../../data/triviaQuestions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("Answer a quick multiple-choice trivia question"),

    run: async ({ interaction }) => {
        const question = questions[Math.floor(Math.random() * questions.length)];
        const row = new ActionRowBuilder().addComponents(
            question.options.map((option, index) => new ButtonBuilder()
                .setCustomId(`trivia:${interaction.id}:${index}`)
                .setLabel(option)
                .setStyle(ButtonStyle.Secondary))
        );

        await interaction.reply({
            content: `**Quick trivia**\n${question.question}`,
            components: [row],
            ephemeral: true
        });

        const reply = await interaction.fetchReply();
        const collector = reply.createMessageComponentCollector({
            filter: (component) => component.user.id === interaction.user.id,
            time: 30_000,
            max: 1
        });

        collector.on("collect", async (component) => {
            const selectedIndex = Number(component.customId.split(":").at(-1));
            const isCorrect = selectedIndex === question.answerIndex;
            await component.update({
                content: `${isCorrect ? "Correct! 🎉" : "Not quite."} ${question.question}\nAnswer: **${question.options[question.answerIndex]}**`,
                components: []
            });
        });

        collector.on("end", async (_, reason) => {
            if (reason === "time") {
                await interaction.editReply({ content: `Time's up! The answer was **${question.options[question.answerIndex]}**.`, components: [] }).catch(() => {});
            }
        });
    }
};
