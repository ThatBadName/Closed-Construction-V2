const { settingEmbed, settingComponents } = require("../constants")

function alertsSettings(interaction, client) {
  interaction.message.edit({
    embeds: [settingEmbed('alerts')],
    components: settingComponents(interaction.user.id, 'alerts')
  })
}

module.exports = {
  alertsSettings
}