const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js")
const {
  newSlogan,
  rename,
  newImage
} = require("../functions")
const fs = require('fs')
const {
  colours
} = require("../../../constants")

async function editCustomModal(interaction, client) {
  interaction.deferUpdate()
  const messageId = interaction.customId.replace('city-edit-modal|', '').split('|')[1]
  const type = interaction.customId.replace('city-edit-modal|', '').split('|')[2]
  const message = await interaction.channel.messages.fetch(messageId)
  let newName = interaction.fields.getTextInputValue('name')
  let latestAction
  if (type === 'Name') {
    rename(interaction.user.id, newName, client)
    latestAction = `Set city name to \`${newName.slice(0, 25)}\``
  } else if (type === 'Slogan') {
    newSlogan(interaction.user.id, newName, client)
    latestAction = `Set city slogan to \`${newName}\``
  } else if (type === 'Image') {
    if (fs.readFileSync(`./database/users/${interaction.user.id}/city/imageUnlocked`, 'ascii') === 'no') {
      latestAction = `You have not unlocked city images yet. Purchase it in the upgrades menu`
    } else if (!newName.startsWith('https://i.imgur.com/') && !newName.endsWith('.png')) {
      latestAction = `Failed to set image. Images must be hosted on imgur and links should end in \`.png\``
    } else {
      newImage(interaction.user.id, newName, client)
      latestAction = `Set city image to \`${newName}\``
    }
  }
  let options = new ActionRowBuilder()
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
  await message.edit({
    embeds: [
      new EmbedBuilder()
      .setTitle('City Customisation')
      .setDescription('Choose what you want to customise' + `\n\n**Latest Actions**:\n${latestAction}`)
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
  editCustomModal
}