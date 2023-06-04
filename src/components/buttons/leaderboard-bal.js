const {
  EmbedBuilder
} = require("discord.js")
const {
  colours, leaderboardPositionArrayBalance
} = require("../../constants")
const fs = require('fs')

module.exports = {
  data: {
    name: 'leaderboard-bal'
  },

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle('Balance Leaderboard')
    .setDescription(fs.readFileSync(`./database/leaderboard/balanceLeaderboard`, 'ascii'))

    const i = Array.from(leaderboardPositionArrayBalance)[0].findIndex(item => item.id === interaction.user.id)
    if (i > -1) embed.setFooter({text: `You are position #${i+1}`})

    interaction.reply({
      embeds: [
        embed
      ],
      ephemeral: true
    })
  }
}