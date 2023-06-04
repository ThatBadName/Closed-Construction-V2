const { settingEmbed, settingComponents } = require("../constants")

function compactModeSettings(interaction, client) {
  interaction.message.edit({
    embeds: [settingEmbed('compactMode')],
    components: settingComponents(interaction.user.id, 'compactMode')
  })
}

module.exports = {
  compactModeSettings
}