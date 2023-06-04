const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')
const { cityEmbed, cityView } = require('../../botFunctions/city/view')

module.exports = {
  data: new ContextMenuCommandBuilder()
  .setName('city')
  .setDMPermission(false)
  .setType(ApplicationCommandType.User),

  async execute(interaction, client) {
    const user = interaction.targetUser
      const obj = cityView(user.id, interaction)
      if (obj === null) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${user} has not got a profile`)
          .setColor(colours.blend)
        ],
        ephemeral: true
      })
      if (user.id !== interaction.targetUser.id) return interaction.reply({
        embeds: [
          cityEmbed(obj, interaction)
        ]
      })

      interaction.reply({
        embeds: [
          cityEmbed(obj, interaction)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`view-cityMenu|${interaction.targetUser.id}`)
            .setLabel('View')
            .setStyle('Primary')
            .setDisabled(true),
            // main city overview

            new ButtonBuilder()
            .setCustomId(`edit-cityMenu|${interaction.targetUser.id}`)
            .setLabel('Customise')
            .setStyle('Secondary'),
            // city name, icon?, bio

            new ButtonBuilder()
            .setCustomId(`upgrade-cityMenu|${interaction.targetUser.id}`)
            .setLabel('Upgrades')
            .setStyle('Secondary'),
            // for city upgrades

            new ButtonBuilder()
            .setCustomId(`manage-cityMenu|${interaction.targetUser.id}`)
            .setLabel('Manage')
            .setStyle('Secondary')
            // For inv, build, bal
          )
        ]
      })
  }
}