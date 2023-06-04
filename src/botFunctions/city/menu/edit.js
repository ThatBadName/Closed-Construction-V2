const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder
} = require('discord.js')
const {
  colours
} = require('../../../constants')
const fs = require('fs')

async function editCity(interaction, client) {
  const buttonId = interaction.customId.replace('edit-cityMenu|', '')
  if (interaction.user.id !== buttonId) return interaction.deferUpdate()
  interaction.deferUpdate().catch(() => {})

  const options = new ActionRowBuilder()
  if (fs.readFileSync(`./database/users/${interaction.user.id}/city/imageUnlocked`, 'ascii') === 'no') {
    options.addComponents(
      new StringSelectMenuBuilder()
      .setCustomId(`city-edit-options|${interaction.user.id}`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder('Choose an option from the list')
      .addOptions([{
        label: 'Name',
        description: 'Edit your city name',
        value: 'Name'
      }, {
        label: 'Slogan',
        description: 'Edit your city slogan',
        value: 'Slogan'
      }])
    )
  } else {
    options.addComponents(
      new StringSelectMenuBuilder()
      .setCustomId(`city-edit-options|${interaction.user.id}`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder('Choose an option from the list')
      .addOptions([{
        label: 'Name',
        description: 'Edit your city name',
        value: 'Name'
      }, {
        label: 'Slogan',
        description: 'Edit your city slogan',
        value: 'Slogan'
      }, {
        label: 'Image',
        description: 'Edit your city image',
        value: 'Image'
      }])
    )
  }

  interaction.message.edit({
    embeds: [
      new EmbedBuilder()
      .setTitle('City Customisation')
      .setDescription('Choose what you want to customise')
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
        .setStyle('Primary')
        .setDisabled(true),

        new ButtonBuilder()
        .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
        .setLabel('Upgrades')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`manage-cityMenu|${interaction.user.id}`)
        .setLabel('Manage')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`activity|${interaction.user.id}`)
        .setLabel('Activity')
        .setStyle('Secondary')
      ),
      options
    ]
  })
}

module.exports = {
  editCity
}