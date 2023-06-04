const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const { colours } = require("../../../constants")
const fs = require('fs')

async function cityBuildMenu(interaction, client) {
  interaction.deferUpdate()
  const actions = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setCustomId(`build-building|${interaction.user.id}`)
    .setLabel('Build')
    .setStyle('Secondary')
  )
  let textAlert = ''
  if (fs.readdirSync(`./database/users/${interaction.user.id}/city/buildings`).length < 5) {
    actions.addComponents(
      new ButtonBuilder()
      .setCustomId(`upgrade-building|${interaction.user.id}`)
      .setLabel('Upgrade')
      .setStyle('Secondary')
      .setDisabled(true)
    )
      textAlert = 'You must have at least 5 buildings to upgrade'
  }
  else {
    actions.addComponents(
      new ButtonBuilder()
      .setCustomId(`upgrade-building|${interaction.user.id}`)
      .setLabel('Upgrade')
      .setStyle('Secondary')
    )
  }
  actions.addComponents(
    new ButtonBuilder()
    .setCustomId(`build-goback|${interaction.user.id}`)
    .setLabel('Return')
    .setStyle('Danger')
  )
  interaction.message.edit({
    embeds: [
      new EmbedBuilder()
      .setTitle('Building Menu')
      .setDescription('Do you want to upgrade a building or make a new one?' + `${textAlert === '' ? '' : `\n\n${textAlert}`}`)
      .setColor(colours.blend)
    ],
    components: [
      actions
    ]
  })
}

module.exports = {
  cityBuildMenu
}