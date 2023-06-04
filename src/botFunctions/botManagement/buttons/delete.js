const {
  emojis,
  colours
} = require('../../../constants')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const fs = require('fs')

async function remove(interaction, client) {
  const userId = interaction.customId.replace('delete-', '')

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setColor(colours.blend)
      .setDescription(`Deleting user (\`${userId}\`).....`)
    ],
    ephemeral: true
  })
  fs.rm(`./database/users/${userId}`, {
    recursive: true
  }, (() => {}))

  setTimeout(() => {
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`User deleted (\`${userId}\`)`)
      ],
      ephemeral: true
    })
    interaction.message.edit({
      embeds: [
        new EmbedBuilder().setColor(colours.blend).setTitle(`[Staff View] No profile found`)
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId(`create-${userId}`)
          .setLabel('Create Profile')
          .setStyle('Secondary')
        )
      ]
    })
  }, 1000)
}

module.exports = {
  remove
}