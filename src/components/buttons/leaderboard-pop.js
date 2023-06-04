const {
  EmbedBuilder
} = require("discord.js")
const {
  colours, leaderboardPositionArrayCitizens
} = require("../../constants")
const fs = require('fs')

module.exports = {
  data: {
    name: 'leaderboard-pop'
  },

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle('Citizen Leaderboard')
    .setDescription(fs.readFileSync(`./database/leaderboard/citizenLeaderboard`, 'ascii'))

    const i = Array.from(leaderboardPositionArrayCitizens)[0].findIndex(item => item.id === interaction.user.id)
    if (i > -1) embed.setFooter({text: `You are position #${i+1}`})

    interaction.reply({
      embeds: [
        embed
      ],
      ephemeral: true
    })
  }
}