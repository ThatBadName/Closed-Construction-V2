const { settingEmbed, settingComponents } = require("../constants")

function hiddenSettings(interaction, client) {
  interaction.message.edit({
    embeds: [settingEmbed('hidden')],
    components: settingComponents(interaction.user.id, 'hidden')
  })
}

module.exports = {
  hiddenSettings
}