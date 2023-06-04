const {
  emojis,
  colours
} = require('../../../constants')
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const fs = require('fs')
const {
  viewStaffProfile,
  createStaffProfileEmbed
} = require('../profile')
const {
  createProfileId
} = require('../../main')

async function create(interaction, client) {
  const userId = interaction.customId.replace('create-', '')

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setColor(colours.blend)
      .setDescription(`Creating user (\`${userId}\`).....`)
    ],
    ephemeral: true
  })
  const checkForUser = await client.users.fetch(userId)
  if (!checkForUser) return null
  await createProfileId(checkForUser.id, client)

  setTimeout(() => {
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`User created (\`${userId}\`)`)
      ],
      ephemeral: true
    })
    const obj = viewStaffProfile(userId, interaction)
    interaction.message.edit({
      embeds: [
        createStaffProfileEmbed(obj, interaction)
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId(`wipe-${userId}`)
          .setLabel('Wipe user')
          .setStyle('Secondary'),

          new ButtonBuilder()
          .setCustomId(`delete-${userId}`)
          .setLabel('Delete user')
          .setStyle('Secondary')
        )
      ]
    })
  }, 1000)
}

module.exports = {
  create
}