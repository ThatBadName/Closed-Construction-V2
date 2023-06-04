const { EmbedBuilder } = require("discord.js")
const fs = require('fs')
const { settingsFile } = require("../../../constants")
const { settingEmbed, settingComponents } = require("../constants")

function settingsToggle(interaction, client) {
  const buttonId = interaction.customId.split('|')[2]
  if (buttonId !== interaction.user.id) return interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setDescription('This is not for you')
      .setColor(colours.blend)
    ],
    ephemeral: true
  })
  interaction.deferUpdate()
  const file = interaction.customId.split('|')[1]
  if (fs.existsSync(`./database/users/${interaction.user.id}/settings/${file}`)) {
    const currentSetting = fs.readFileSync(`./database/users/${interaction.user.id}/settings/${file}`, 'ascii')
    if (currentSetting === 'yes') {
      fs.writeFileSync(`./database/users/${interaction.user.id}/settings/${file}`, 'no')
    } else {
      fs.writeFileSync(`./database/users/${interaction.user.id}/settings/${file}`, 'yes')
    }
  } else {
    fs.writeFileSync(`./database/users/${interaction.user.id}/settings/${file}`, 'yes')
  }

  interaction.message.edit({
    embeds: [settingEmbed(settingsFile[file].id)],
    components: settingComponents(interaction.user.id, settingsFile[file].id)
  })
}

module.exports = {
  settingsToggle
}