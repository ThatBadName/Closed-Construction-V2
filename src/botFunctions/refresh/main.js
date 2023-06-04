const { EmbedBuilder } = require("discord.js")
const { colours } = require("../../constants")
const { createPages, inventory } = require("../inventory")
const { createProfileEmbedButton, viewProfile } = require("../main")
const fs = require('fs')

async function refreshProfile(interaction, client) {
  let type = interaction.customId.split('-')[1]
  if (interaction.user.id !== interaction.customId.split('-')[3]) return interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setColor(colours.blend)
      .setDescription('This is not for you')
    ],
    ephemeral: true
  })
  interaction.deferUpdate()
  if (type === 'profile') {
    interaction.message.edit({
      embeds: [
        await createProfileEmbedButton(viewProfile(interaction.customId.split('-')[2], interaction), interaction, client)
      ]
    })
  }
  // else if (type === 'inventory') {
  //   interaction.message.edit({
  //     embeds: await createPages(inventory(interaction.customId.split('-')[2]), fs.readFileSync(`./src/database/users/${interaction.customId.split('-')[2]}/tag`, 'ascii'), interaction.customId.split('-')[2])[0]
  //   })
  // }
}

module.exports = {
  refreshProfile
}