const { EmbedBuilder } = require("discord.js")
const { colours } = require("../../constants")
const itemList = require("../../items/itemList")
const {
  removeItem, generateCrateLoot, addItem, addCoins
} = require("../inventory")

async function use(interaction, amount) {
  removeItem('starterCrate', amount, interaction.user.id)

  const crate = await generateCrateLoot('starter crate')
  const amountOfCoins = crate.pop()

  let addedItems = []
  if (amountOfCoins > 0) addedItems.push(`${(amountOfCoins * amount).toLocaleString()} coins`)
  for (let i = 0; i < crate.length; ++i) {
    let itemQuery = crate[i].split('|')[0]
    itemQuery = itemQuery.toLowerCase()

    const search = !!itemList.find((value) => value.id === itemQuery)
    if (!search) continue
    const itemFound = itemList.find((value) => value.id === itemQuery)

    addItem(itemFound.id, crate[i].split('|')[1] * amount, interaction.user.id)

    addedItems.push(`[${crate[i].split('|')[1] * amount}] ${itemFound.emoji}${itemFound.name}`)
  }
  addCoins(amountOfCoins * amount, interaction.user.id)

  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setTitle(`${interaction.user.tag}'s loot haul`)
      .setColor(colours.blend)
      .setFooter({
        text: `${amount}x Starter Crate${amount === 1 ? '' : 's'} opened`
      })
      .setDescription(addedItems.join('\n'))
      .setThumbnail('https://i.imgur.com/8UFyotO.png')
    ]
  })
}

module.exports = {
  use
}