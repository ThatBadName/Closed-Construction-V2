const {
  globalQuest
} = require("../../../../items/questTable")
const questTypes = ['coin', 'item', 'activity']
const fs = require('fs')
const itemList = require("../../../../items/itemList")
const { abbreviateNumber } = require("../../../main")

async function createGlobalQuest() {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = globalQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/global`)) fs.rmSync(`./database/quests/global`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/global`)
      fs.mkdirSync(`./database/quests/global/users`)
      fs.writeFileSync(`./database/quests/global/type`, 'COIN')
      fs.writeFileSync(`./database/quests/global/amountComplete`, '0')
      fs.writeFileSync(`./database/quests/global/title`, questTitle)
      fs.writeFileSync(`./database/quests/global/reward`, rewardText)
      fs.writeFileSync(`./database/quests/global/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/global/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/global/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = globalQuest[0].itemQuest

      let questTitle = data.title

      const itemToCollect = data.possibleItems[Math.floor(Math.random() * data.possibleItems.length)]
      const amountToCollect = Math.ceil(Math.floor(Math.random() * (itemToCollect.max - itemToCollect.min) + itemToCollect.min) / 5) * 5
      const reward = itemToCollect.rewards[Math.floor(Math.random() * itemToCollect.rewards.length)]
      const amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.max) / 10) * 10

      const search = !!itemList.find((value) => value.id === itemToCollect.itemId)
      if (!search) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('I could not find that item')
          .setColor('0x' + colours.error)
        ]
      })
      const itemFound = itemList.find((value) => value.id === itemToCollect.itemId)

      let rewardText = reward.text
      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountToCollect, 2)}`).replaceAll('{item}', `${itemFound.emoji}${itemFound.name}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/global`)) fs.rmSync(`./database/quests/global`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/global`)
      fs.mkdirSync(`./database/quests/global/users`)
      fs.writeFileSync(`./database/quests/global/title`, questTitle)
      fs.writeFileSync(`./database/quests/global/reward`, rewardText)
      fs.writeFileSync(`./database/quests/global/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/global/amountComplete`, '0')
      fs.writeFileSync(`./database/quests/global/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/global/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/global/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/global/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = globalQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward}`)

      if (fs.existsSync(`./database/quests/global`)) fs.rmSync(`./database/quests/global`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/global`)
      fs.mkdirSync(`./database/quests/global/users`)
      fs.writeFileSync(`./database/quests/global/title`, questTitle)
      fs.writeFileSync(`./database/quests/global/reward`, rewardText)
      fs.writeFileSync(`./database/quests/global/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/global/amountComplete`, '0')
      fs.writeFileSync(`./database/quests/global/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/global/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/global/rewardType`, reward.type)
    }
}

module.exports = {
  createGlobalQuest
}