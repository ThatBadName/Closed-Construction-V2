const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder
} = require('discord.js')
const {
  colours
} = require('../../../constants')

async function manageCity(interaction, client) {
  const buttonId = interaction.customId.replace('manage-cityMenu|', '')
  if (interaction.user.id !== buttonId) return interaction.deferUpdate()
  interaction.deferUpdate().catch(() => {})

  interaction.message.edit({
    embeds: [
      new EmbedBuilder()
      .setTitle('City Management')
      .setDescription('Use the menu bellow to choose what to manage')
      .setColor(colours.blend)
    ],
    ephemeral: true,
    fetchReply: true,
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId(`view-cityMenu|${interaction.user.id}`)
        .setLabel('View')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`edit-cityMenu|${interaction.user.id}`)
        .setLabel('Customise')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
        .setLabel('Upgrades')
        .setStyle('Secondary'),

        new ButtonBuilder()
        .setCustomId(`manage-cityMenu|${interaction.user.id}`)
        .setLabel('Manage')
        .setStyle('Primary')
        .setDisabled(true),

        new ButtonBuilder()
        .setCustomId(`activity|${interaction.user.id}`)
        .setLabel('Activity')
        .setStyle('Secondary')
      ),

      new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId(`city-management-options|${interaction.user.id}`)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder('Choose what you want to manage')
        .addOptions([{
          label: 'Build',
          description: 'Bring up the building menu',
          value: 'city-build'
        }])
      )
    ]
  })
}

module.exports = {
  manageCity
}