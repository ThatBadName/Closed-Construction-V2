const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder
} = require("discord.js")
const fs = require('fs')
const {
  colours
} = require("../../../constants")

function editCitySelectMenuCustom(interaction, client) {
  const buttonId = interaction.customId.replace('city-edit-options|', '')
  if (buttonId !== interaction.user.id && !interaction.customId.startsWith('view-cityMenu')) return interaction.deferUpdate()
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
  let firstTextBox
  let customPriceModal = new ModalBuilder()
    .setTitle(`City ${interaction.values[0]}`)
    .setCustomId(`city-edit-modal|${buttonId}|${interaction.message.id}|${interaction.values[0]}`)

  const price = new TextInputBuilder()
    .setCustomId('name')
    .setLabel(`City ${interaction.values[0]}`)
    .setMinLength(3)
    .setMaxLength(100)
    .setRequired(true)
    .setStyle('Short')
    .setValue(`${fs.readFileSync(`./database/users/${interaction.user.id}/${interaction.values[0] === 'Name' ? 'cityName' : interaction.values[0] === 'Slogan' ? `city/slogan` : 'city/image'}`)}`)

  firstTextBox = new ActionRowBuilder().addComponents(price)
  customPriceModal.addComponents(firstTextBox)
  interaction.showModal(customPriceModal)
}

module.exports = {
  editCitySelectMenuCustom
}