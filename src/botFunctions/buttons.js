const { EmbedBuilder } = require('discord.js')
const { colours } = require('../constants')

async function lookInBox(interaction) {
  const items = require('../items/itemList')
  const boxId = interaction.customId.substring(8)

  const search = !!items.find((value) => value.id === boxId)
    if (!search) return interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle('I could not find that crate')
        .setColor('0x' + colours.error)
      ]
    })
    const itemFound = items.find((value) => value.id === boxId)

  const loot = itemFound.loot.sort((a, b) => b.chance - a.chance)
  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setThumbnail(itemFound.url || 'https://cdn.discordapp.com/emojis/1005453599800840262.webp?size=96&quality=lossless')
      .setTitle(`${itemFound.name} Rewards`)
      .setColor('0x' + colours.blend)
      .setDescription(`**Possible Rewards**:\n${loot.length === 0 ? 'No rewards possible' : loot.map(item => `\`${item.chance}%\` ${item.emoji}${item.name} (${item.max === item.min ? item.max : `${item.min} - ${item.max}`})`).join('\n')}`)
    ],
    ephemeral: true
  })
}

module.exports = {
  lookInBox
}