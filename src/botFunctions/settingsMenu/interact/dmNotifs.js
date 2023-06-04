const { settingEmbed, settingComponents } = require("../constants")

function dmNotifsSettings(interaction, client) {
  interaction.message.edit({
    embeds: [settingEmbed('dmNotifs')],
    components: settingComponents(interaction.user.id, 'dmNotifs')
  })
}

module.exports = {
  dmNotifsSettings
}