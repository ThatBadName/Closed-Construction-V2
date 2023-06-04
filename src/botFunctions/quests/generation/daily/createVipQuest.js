const {
  vipQuest
} = require("../../../../items/questTable")
const questTypes = ['coin', 'item', 'activity']
const fs = require('fs')
const itemList = require("../../../../items/itemList")
const {
  abbreviateNumber
} = require("../../../main")

async function createVipQuest() {
  for (let i = 0; i <= 1; i++) {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = vipQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/vip/${i}`)) fs.rmSync(`./database/quests/vip/${i}`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/vip/${i}`)
      fs.mkdirSync(`./database/quests/vip/${i}/users`)
      fs.writeFileSync(`./database/quests/vip/${i}/type`, 'COIN')
      fs.writeFileSync(`./database/quests/vip/${i}/title`, questTitle)
      fs.writeFileSync(`./database/quests/vip/${i}/reward`, rewardText)
      fs.writeFileSync(`./database/quests/vip/${i}/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/vip/${i}/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/vip/${i}/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = vipQuest[0].itemQuest

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

      if (fs.existsSync(`./database/quests/vip/${i}`)) fs.rmSync(`./database/quests/vip/${i}`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/vip/${i}`)
      fs.mkdirSync(`./database/quests/vip/${i}/users`)
      fs.writeFileSync(`./database/quests/vip/${i}/title`, questTitle)
      fs.writeFileSync(`./database/quests/vip/${i}/reward`, rewardText)
      fs.writeFileSync(`./database/quests/vip/${i}/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/vip/${i}/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/vip/${i}/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/vip/${i}/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/vip/${i}/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = vipQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward}`)

      if (fs.existsSync(`./database/quests/vip/${i}`)) fs.rmSync(`./database/quests/vip/${i}`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/vip/${i}`)
      fs.mkdirSync(`./database/quests/vip/${i}/users`)
      fs.writeFileSync(`./database/quests/vip/${i}/title`, questTitle)
      fs.writeFileSync(`./database/quests/vip/${i}/reward`, rewardText)
      fs.writeFileSync(`./database/quests/vip/${i}/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/vip/${i}/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/vip/${i}/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/vip/${i}/rewardType`, reward.type)
    }
  }
}

module.exports = {
  createVipQuest
}