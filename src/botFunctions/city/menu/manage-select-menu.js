const { cityBuildMenu } = require("./build-menu")

async function manageSelectMenu(interaction, client) {
  const buttonId = interaction.customId.replace('city-management-options|', '')
  if (buttonId !== interaction.user.id && !interaction.customId.startsWith('view-cityMenu')) return interaction.deferUpdate()
  if (interaction.values[0] === 'city-build') return cityBuildMenu(interaction, client)
}

module.exports = {
  manageSelectMenu
}