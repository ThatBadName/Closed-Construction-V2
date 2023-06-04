const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const { dailyQuestEmbed } = require('../../botFunctions/quests/menu/dailyQuests')
const {
  colours
} = require('../../constants')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quests')
    .setDescription('View the active quests'),

  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        await dailyQuestEmbed(interaction, client)
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          // new ButtonBuilder()
          // .setCustomId(`quests-special|${interaction.user.id}`)
          // .setLabel('Special Quests')
          // .setStyle('Secondary'),

          new ButtonBuilder()
          .setCustomId(`quests-daily|${interaction.user.id}`)
          .setLabel('Daily Quests')
          .setStyle('Primary'),

          new ButtonBuilder()
          .setCustomId(`quests-weekly|${interaction.user.id}`)
          .setLabel('Weekly Quests')
          .setStyle('Secondary')
        )
      ]
    })
  }
}