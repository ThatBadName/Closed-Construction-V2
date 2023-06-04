const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js')
const { cityEmbed, cityView } = require('../../botFunctions/city/view')

module.exports = {
  data: new SlashCommandBuilder()
  .setName('city')
  .setDescription('Manage your ship')
  .setDMPermission(false)
  .addUserOption(option =>
    option.setName('user')
    .setDescription('The user to view')
  ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user
      const obj = cityView(user.id, interaction)
      if (obj === null) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${user} has not got a profile`)
          .setColor(colours.blend)
        ],
        ephemeral: true
      })
      if (user.id !== interaction.user.id) return interaction.reply({
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
            .setCustomId(`view-cityMenu|${interaction.user.id}`)
            .setLabel('View')
            .setStyle('Primary')
            .setDisabled(true),

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
            .setStyle('Secondary'),

            new ButtonBuilder()
            .setCustomId(`activity|${interaction.user.id}`)
            .setLabel('Activity')
            .setStyle('Secondary')
          )
        ]
      })
  }
}