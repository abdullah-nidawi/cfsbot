const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Level = require("../../schemas/levelSchema");

const compact = new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" });

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show the server's top members by level and XP"),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const members = await Level.find({
            guildId: interaction.guildId,
            hideFromLeaderboard: { $ne: true },
            xp: { $gt: 0 }
        })
            .sort({ level: -1, xp: -1, userId: 1 })
            .limit(15)
            .select("-_id userId level xp");

        const medals = ["🥇", "🥈", "🥉"];
        const rows = members.map((member, index) => {
            const position = index + 1;
            const label = medals[index] || `#${position}`;
            return `**${label}** <@${member.userId}> · Level ${member.level} · ${compact.format(member.xp)} XP`;
        });

        const guildIcon = interaction.guild.iconURL();
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, ...(guildIcon ? { iconURL: guildIcon } : {}) })
            .setTitle("Server leaderboard")
            .setDescription(rows.length ? rows.join("\n") : "No leaderboard entries yet.")
            .setFooter({ text: "Use /leaderboard-privacy to hide or show your rank." })
            .setColor("DarkPurple")
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
    },

    inGuild: true
};
