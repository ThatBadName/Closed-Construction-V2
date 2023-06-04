const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const {
  colours,
  functionsMain,
  emojis
} = require('../../constants')
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDMPermission(false)
    .setDescription('View a bot profile')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('View another user\'s profile')
      .setRequired(false)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user
    const profile = functionsMain.viewProfile(user.id, interaction)
    if (profile === null) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription(`${user} has not got a profile`)
        .setColor(colours.blend)
      ],
      ephemeral: true
    })

    if (!fs.existsSync(`./database/users/${interaction.user.id}`)) {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Danger')
          )
        ]
      })
    } else if (user.id === interaction.user.id) {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}|${interaction.user.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Danger')
          )
        ]
      })
    } else if (fs.existsSync(`./database/users/${interaction.user.id}/admin/reportBan`) && fs.readFileSync(`./database/users/${interaction.user.id}/admin/reportBan`) === 'yes') {
      interaction.reply({
        embeds: [functionsMain.createProfileEmbed(profile, interaction)],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`report-${user.id}`)
            .setDisabled(true)
            .setLabel('Report')
            .setStyle('Danger')
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
            .setStyle('Danger')
          )
        ]
      })
    }
  }
}