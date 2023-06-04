const { scavangeCoins, scavangeItems, scavangeLosses, scavangeFails } = require('../../../constants')
const { addCoins, removeCitizens, addItem } = require('../../inventory')
const { generateLootTable } = require('../loot')

async function scavangeActivity(interaction, client) {
  let loot = await generateLootTable('scavenge')
  let description = ''
  for (let i = 0; i < loot.length; ++i) {
    let item = loot[i]
    if (item.id === 'NOTHING') description = `${scavangeFails[Math.floor(Math.random() * scavangeFails.length)]}`

    else if (item.id === 'COINS') {
      let amount = Math.round(Math.random() * (item.maxAmount - item.minAmount) + item.minAmount)
      await addCoins(amount, interaction.user.id, client)
      description = `${scavangeCoins[Math.floor(Math.random() * scavangeCoins.length)].replaceAll('{amount}', amount.toLocaleString())}`
    }

    else if (item.id === 'LOOSEPARTY') {
      let amount = Math.round(Math.random() * (item.maxAmount - item.minAmount) + item.minAmount)
      removeCitizens(amount, interaction.user.id, client)
      description = `${scavangeLosses[Math.floor(Math.random() * scavangeLosses.length)].replaceAll('{amount}', amount)}`
    }

    else {
      let amount = Math.round(Math.random() * (item.maxAmount - item.minAmount) + item.minAmount)
      await addItem(item.id, amount, interaction.user.id, client)
      description = `${scavangeItems[Math.floor(Math.random() * scavangeItems.length)].replaceAll('{item}', `${amount}x ${item.emoji}${item.name}`)}`
    }
  }
  return description
}

module.exports = {
  scavangeActivity
}