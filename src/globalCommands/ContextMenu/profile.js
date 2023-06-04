const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType
} = require('discord.js')
const {
  colours,
  functionsMain
} = require('../../constants')
const fs = require('fs')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('profile')
    .setDMPermission(false)
    .setType(ApplicationCommandType.User),

  async execute(interaction, client) {
    const user = interaction.targetUser
    const profile = functionsMain.viewProfile(user.id, interaction)
    if (profile === null) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription(`${user} has not got a profile`)
        .setColor(colours.blend)
      ],
      ephemeral: true
    })

    if (!fs.existsSync(`./database/users/${interaction.targetUser.id}`)) {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Secondary')
          )
        ]
      })
    } else if (user.id === interaction.targetUser.id) {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}|${interaction.targetUser.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Secondary')
          )
        ]
      })
    } else if (fs.readFileSync(`./database/users/${interaction.targetUser.id}/admin/reportBan`) === 'yes') {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Secondary')
          )
        ]
      })
    } else {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}`)
            .setLabel('Report')
            .setStyle('Secondary')
          )
        ]
      })
    }
  }
}