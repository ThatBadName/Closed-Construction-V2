const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { colours } = require('../../constants')

module.exports = {
  data: new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the best players on the bot'),

  async execute(interaction, client) {
    interaction.reply({embeds: [
      new EmbedBuilder()
      .setDescription('Pick the leaderboard to display')
      .setColor(colours.blend)
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId('leaderboard-bal')
        .setLabel('Balance')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId('leaderboard-lvl')
        .setLabel('Level')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId('leaderboard-pop')
        .setLabel('Citizens')
        .setStyle('Secondary')
      )
    ]
  })
  }
}