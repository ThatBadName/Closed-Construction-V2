const { EmbedBuilder } = require("discord.js")
const { colours } = require("../../../constants")
const { alertsSettings } = require("./alerts")
const { compactModeSettings } = require("./compactMode")
const { dmNotifsSettings } = require("./dmNotifs")
const { hiddenSettings } = require("./hideMe")

function settingsMenuInteraction(interaction, client) {
  const buttonId = interaction.customId.replace('profile-settings|', '')
  if (buttonId !== interaction.user.id) return interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setDescription('This is not for you')
      .setColor(colours.blend)
    ],
    ephemeral: true
  })
  const value = interaction.values[0]
  interaction.deferUpdate()
  if (value === 'alerts') alertsSettings(interaction, client) 
  if (value === 'dmNotifs') dmNotifsSettings(interaction, client) 
  if (value === 'compactMode') compactModeSettings(interaction, client) 
  if (value === 'hidden') hiddenSettings(interaction, client) 
}

module.exports = {
  settingsMenuInteraction
}