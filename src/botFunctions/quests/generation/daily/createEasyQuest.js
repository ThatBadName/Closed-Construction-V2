const {
  easyDailyQuest, easyWeeklyQuest
} = require("../../../../items/questTable")
const questTypes = ['coin', 'item', 'activity']
const fs = require('fs')
const itemList = require("../../../../items/itemList")
const { abbreviateNumber } = require("../../../main")

async function createEasyQuest(type) {
  if (type === 'daily') {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = easyDailyQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/daily/easy`)) fs.rmSync(`./database/quests/daily/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/easy`)
      fs.mkdirSync(`./database/quests/daily/easy/users`)
      fs.writeFileSync(`./database/quests/daily/easy/type`, 'COIN')
      fs.writeFileSync(`./database/quests/daily/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/easy/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/daily/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/easy/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = easyDailyQuest[0].itemQuest

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

      if (fs.existsSync(`./database/quests/daily/easy`)) fs.rmSync(`./database/quests/daily/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/easy`)
      fs.mkdirSync(`./database/quests/daily/easy/users`)
      fs.writeFileSync(`./database/quests/daily/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/easy/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/daily/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/easy/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/daily/easy/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/daily/easy/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = easyDailyQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward}`)

      if (fs.existsSync(`./database/quests/daily/easy`)) fs.rmSync(`./database/quests/daily/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/easy`)
      fs.mkdirSync(`./database/quests/daily/easy/users`)
      fs.writeFileSync(`./database/quests/daily/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/easy/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/daily/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/easy/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/daily/easy/rewardType`, reward.type)
    }
  }
  else if (type === 'weekly') {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = easyWeeklyQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/weekly/easy`)) fs.rmSync(`./database/quests/weekly/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/easy`)
      fs.mkdirSync(`./database/quests/weekly/easy/users`)
      fs.writeFileSync(`./database/quests/weekly/easy/type`, 'COIN')
      fs.writeFileSync(`./database/quests/weekly/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/easy/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/weekly/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/easy/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = easyWeeklyQuest[0].itemQuest

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

      if (fs.existsSync(`./database/quests/weekly/easy`)) fs.rmSync(`./database/quests/weekly/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/easy`)
      fs.mkdirSync(`./database/quests/weekly/easy/users`)
      fs.writeFileSync(`./database/quests/weekly/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/easy/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/weekly/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/easy/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/weekly/easy/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/weekly/easy/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = easyWeeklyQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/weekly/easy`)) fs.rmSync(`./database/quests/weekly/easy`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/easy`)
      fs.mkdirSync(`./database/quests/weekly/easy/users`)
      fs.writeFileSync(`./database/quests/weekly/easy/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/easy/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/easy/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/weekly/easy/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/easy/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/weekly/easy/rewardType`, reward.type)
    }
  }
}

module.exports = {
  createEasyQuest
}