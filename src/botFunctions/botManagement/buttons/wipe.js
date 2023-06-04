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

async function wipe(interaction, client) {
  const userId = interaction.customId.replace('wipe-', '')

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setColor(colours.blend)
      .setDescription(`Wiping user (\`${userId}\`).....`)
    ],
    ephemeral: true
  })
  fs.rm(`./database/users/${userId}`, {
    recursive: true
  }, (async() => { await createProfileId(checkForUser.id, client)}))

  const checkForUser = await client.users.fetch(userId)
  if (!checkForUser) return null

  setTimeout(() => {
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`User wiped (\`${userId}\`)`)
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
          .setStyle('Secondary')
        )
      ]
    })
  }, 1000)
}

module.exports = {
  wipe
}