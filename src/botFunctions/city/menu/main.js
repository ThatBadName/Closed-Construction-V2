const { editCity } = require("./edit")
const { manageCity } = require("./manage")
const { upgradeCity } = require("./upgrade")
const { viewCityButton } = require("./view")

async function cityMenu(interaction, client) {
  if (interaction.customId.startsWith('edit')) return editCity(interaction, client)
  if (interaction.customId.startsWith('upgrade')) return upgradeCity(interaction, client)
  if (interaction.customId.startsWith('view')) return viewCityButton(interaction, client)
  if (interaction.customId.startsWith('manage')) return manageCity(interaction, client)
}

module.exports = {
  cityMenu
}