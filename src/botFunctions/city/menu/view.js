const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js")
const {
  colours
} = require("../../../constants")
const {
  cityView,
  cityEmbed
} = require("../view")

function viewCityButton(interaction, client, timeout) {
  const buttonId = interaction.customId.replace('view-cityMenu|', '')
  if (!timeout && interaction.user.id !== buttonId) return interaction.deferUpdate()
  interaction.deferUpdate().catch(() => {})
  const obj = cityView(interaction.user.id, interaction)
  if (obj === null) return interaction.message.edit({
    embeds: [
      new EmbedBuilder()
      .setDescription(`${interaction.user.username} has not got a profile`)
      .setColor(colours.blend)
    ],
    ephemeral: true
  })
  interaction.message.edit({
    embeds: [
      cityEmbed(obj, interaction)
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId(`view-cityMenu|${interaction.user.id}`)
        .setLabel('View')
        .setStyle('Primary')
        .setDisabled(true),
        // main city overview

        new ButtonBuilder()
        .setCustomId(`edit-cityMenu|${interaction.user.id}`)
        .setLabel('Customise')
        .setStyle('Secondary'),
        // city name, icon?, bio

        new ButtonBuilder()
        .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
        .setLabel('Upgrades')
        .setStyle('Secondary'),
        // for city upgrades

        new ButtonBuilder()
        .setCustomId(`manage-cityMenu|${interaction.user.id}`)
        .setLabel('Manage')
        .setStyle('Secondary'),
        // For inv, build, bal

        new ButtonBuilder()
        .setCustomId(`activity|${interaction.user.id}`)
        .setLabel('Activity')
        .setStyle('Secondary')
      )
    ]
  })
}

module.exports = {
  viewCityButton
}