const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder
} = require("discord.js")
const {
  colours
} = require("../../../constants")
const { dailyQuestEmbed } = require("./dailyQuests")
const { specialQuestEmbed } = require("./specialQuests")
const { weeklyQuestEmbed } = require("./weeklyQuests")

async function questIntitialInteraction(interaction, client) {
  const buttonId = interaction.customId.split('|')[1]
  if (buttonId !== interaction.user.id) return interaction.reply({
    embeds: [new EmbedBuilder().setColor(colours.blend).setDescription('This is not for you')],
    ephemeral: true
  })
  interaction.deferUpdate()
  if (interaction.customId.split('-')[1].startsWith('special')) return interaction.message.edit({
    embeds: [
      await specialQuestEmbed(interaction, client)
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        // new ButtonBuilder()
        // .setCustomId(`quests-special|${interaction.user.id}`)
        // .setLabel('Special Quests')
        // .setStyle('Primary'),

        new ButtonBuilder()
        .setCustomId(`quests-daily|${interaction.user.id}`)
        .setLabel('Daily Quests')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`quests-weekly|${interaction.user.id}`)
        .setLabel('Weekly Quests')
        .setStyle('Secondary')
      )
    ]
  })
  if (interaction.customId.split('-')[1].startsWith('daily')) return interaction.message.edit({
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
  if (interaction.customId.split('-')[1].startsWith('weekly')) return interaction.message.edit({
    embeds: [
      await weeklyQuestEmbed(interaction, client)
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
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`quests-weekly|${interaction.user.id}`)
        .setLabel('Weekly Quests')
        .setStyle('Primary')
      )
    ]
  })
}

module.exports = {
  questIntitialInteraction
}