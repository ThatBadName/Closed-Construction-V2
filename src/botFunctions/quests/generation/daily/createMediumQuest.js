const {
  mediumDailyQuest, mediumWeeklyQuest
} = require("../../../../items/questTable")
const questTypes = ['coin', 'item', 'activity']
const fs = require('fs')
const itemList = require("../../../../items/itemList")
const { abbreviateNumber } = require("../../../main")

async function createMediumQuest(type) {
  if (type === 'daily') {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = mediumDailyQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/daily/medium`)) fs.rmSync(`./database/quests/daily/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/medium`)
      fs.mkdirSync(`./database/quests/daily/medium/users`)
      fs.writeFileSync(`./database/quests/daily/medium/type`, 'COIN')
      fs.writeFileSync(`./database/quests/daily/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/medium/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/daily/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/medium/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = mediumDailyQuest[0].itemQuest

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

      if (fs.existsSync(`./database/quests/daily/medium`)) fs.rmSync(`./database/quests/daily/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/medium`)
      fs.mkdirSync(`./database/quests/daily/medium/users`)
      fs.writeFileSync(`./database/quests/daily/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/medium/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/daily/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/medium/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/daily/medium/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/daily/medium/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = mediumDailyQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/daily/medium`)) fs.rmSync(`./database/quests/daily/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/daily/medium`)
      fs.mkdirSync(`./database/quests/daily/medium/users`)
      fs.writeFileSync(`./database/quests/daily/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/daily/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/daily/medium/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/daily/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/daily/medium/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/daily/medium/rewardType`, reward.type)
    }
  }
  else if (type === 'weekly') {
    const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
    if (questType === 'coin') {
      const data = mediumWeeklyQuest[1].coinsQuest

      let questTitle = data.title
      const amountOfCoinsToCollect = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 100) * 100

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfCoinsToCollect, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/weekly/medium`)) fs.rmSync(`./database/quests/weekly/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/medium`)
      fs.mkdirSync(`./database/quests/weekly/medium/users`)
      fs.writeFileSync(`./database/quests/weekly/medium/type`, 'COIN')
      fs.writeFileSync(`./database/quests/weekly/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/medium/rewardType`, reward.type)
      fs.writeFileSync(`./database/quests/weekly/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/medium/collectAmount`, amountOfCoinsToCollect.toString())
    } else if (questType === 'item') {
      const data = mediumWeeklyQuest[0].itemQuest

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

      if (fs.existsSync(`./database/quests/weekly/medium`)) fs.rmSync(`./database/quests/weekly/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/medium`)
      fs.mkdirSync(`./database/quests/weekly/medium/users`)
      fs.writeFileSync(`./database/quests/weekly/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/medium/type`, 'ITEM')
      fs.writeFileSync(`./database/quests/weekly/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/medium/collectAmount`, amountToCollect.toString())
      fs.writeFileSync(`./database/quests/weekly/medium/itemId`, itemToCollect.itemId)
      fs.writeFileSync(`./database/quests/weekly/medium/rewardType`, reward.type)
    } else if (questType === 'activity') {
      const data = mediumWeeklyQuest[2].activityQuest

      let questTitle = data.title
      const amountOfActivities = Math.ceil(Math.floor(Math.random() * (data.max - data.min) + data.min) / 10) * 10

      const reward = data.rewards[Math.floor(Math.random() * data.rewards.length)]
      let rewardText = reward.text
      let amountAsReward = Math.ceil(Math.floor(Math.random() * (reward.max - reward.min) + reward.min) / 5) * 5

      questTitle = questTitle.replaceAll('{amount}', `${abbreviateNumber(amountOfActivities, 2)}`)
      rewardText = rewardText.replaceAll('{rewardAmount}', `${amountAsReward.toLocaleString()}`)

      if (fs.existsSync(`./database/quests/weekly/medium`)) fs.rmSync(`./database/quests/weekly/medium`, {
        recursive: true
      })
      fs.mkdirSync(`./database/quests/weekly/medium`)
      fs.mkdirSync(`./database/quests/weekly/medium/users`)
      fs.writeFileSync(`./database/quests/weekly/medium/title`, questTitle)
      fs.writeFileSync(`./database/quests/weekly/medium/reward`, rewardText)
      fs.writeFileSync(`./database/quests/weekly/medium/type`, 'ACTIVITY')
      fs.writeFileSync(`./database/quests/weekly/medium/rewardAmount`, amountAsReward.toString())
      fs.writeFileSync(`./database/quests/weekly/medium/collectAmount`, amountOfActivities.toString())
      fs.writeFileSync(`./database/quests/weekly/medium/rewardType`, reward.type)
    }
  }
}

module.exports = {
  createMediumQuest
}