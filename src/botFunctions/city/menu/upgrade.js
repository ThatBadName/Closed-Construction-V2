const {
  StringSelectMenuBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js")
const { colours } = require("../../../constants")
const { optionBuilder } = require("../upgrade-option-builder")

async function upgradeCity(interaction, client) {
  const buttonId = interaction.customId.replace('upgrade-cityMenu|', '')
  if (interaction.user.id !== buttonId) return interaction.deferUpdate()
  interaction.deferUpdate().catch(() => {})

  const optionArr = optionBuilder(interaction.user.id)
  if (optionArr.length === 0) hasOption = false
  else hasOption = true

  if (hasOption === true) {
    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
        .setTitle('City Upgrades')
        .setDescription('Choose what you want to upgrade')
        .setColor(colours.blend)
      ],
      ephemeral: true,
      fetchReply: true,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId(`view-cityMenu|${interaction.user.id}`)
          .setLabel('View')
          .setStyle('Secondary'),
  
          new ButtonBuilder()
          .setCustomId(`edit-cityMenu|${interaction.user.id}`)
          .setLabel('Customise')
          .setStyle('Secondary'),
  
          new ButtonBuilder()
          .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
          .setLabel('Upgrades')
          .setStyle('Primary')
          .setDisabled(true),
  
          new ButtonBuilder()
          .setCustomId(`manage-cityMenu|${interaction.user.id}`)
          .setLabel('Manage')
          .setStyle('Secondary'),

          new ButtonBuilder()
            .setCustomId(`activity|${interaction.user.id}`)
            .setLabel('Activity')
            .setStyle('Secondary')
        ),
        new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
          .setCustomId(`city-upgrade-options|${interaction.user.id}`)
          .setMinValues(1)
          .setMaxValues(1)
          .setPlaceholder('Choose an option from the list')
          .addOptions(optionArr)
        )
      ]
    })
  } else {
    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
        .setTitle('City Upgrades')
        .setDescription('You have unlocked all upgrades available to you (check back later for more)')
        .setColor(colours.blend)
      ],
      ephemeral: true,
      fetchReply: true,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId(`view-cityMenu|${interaction.user.id}`)
          .setLabel('View')
          .setStyle('Secondary'),
  
          new ButtonBuilder()
          .setCustomId(`edit-cityMenu|${interaction.user.id}`)
          .setLabel('Customise')
          .setStyle('Secondary'),
  
          new ButtonBuilder()
          .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
          .setLabel('Upgrades')
          .setStyle('Primary')
          .setDisabled(true),
  
          new ButtonBuilder()
          .setCustomId(`manage-cityMenu|${interaction.user.id}`)
          .setLabel('Manage')
          .setStyle('Secondary'),

          new ButtonBuilder()
            .setCustomId(`activity|${interaction.user.id}`)
            .setLabel('Activity')
            .setStyle('Secondary')
        ),
        new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
          .setCustomId(`city-upgrade-options|${interaction.user.id}`)
          .setMinValues(1)
          .setMaxValues(1)
          .setPlaceholder('Choose an option from the list')
          .setDisabled(true)
          .addOptions([{label: 'NULL', description: 'NULL', value: 'null'}])
        )
      ]
    })
  }
}

module.exports = {
  upgradeCity
}