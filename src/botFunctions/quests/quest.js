const fs = require('fs')

async function questCheck(type, userId, coins, itemId, itemAmount) {
  let activityQuests = []
  let coinQuests = []
  let itemQuests = []
  if (type === 'activity') {
    const dailyQuestFiles = fs.readdirSync(`./database/quests/daily`, 'ascii')
    for (const quest of dailyQuestFiles) {
      if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'ACTIVITY' && fs.existsSync(`./database/quests/daily/${quest}/itemId`)) activityQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/daily/${quest}/itemId`, 'ascii'),
        file: `daily/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'ACTIVITY') activityQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        file: `daily/${quest}`
      })
    }

    const weeklyQuestFiles = fs.readdirSync(`./database/quests/weekly`, 'ascii')
    for (const quest of weeklyQuestFiles) {
      if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'ACTIVITY' && fs.existsSync(`./database/quests/weekly/${quest}/itemId`)) activityQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/weekly/${quest}/itemId`, 'ascii'),
        file: `weekly/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'ACTIVITY') activityQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        file: `weekly/${quest}`
      })
    }
  } else if (type === 'coins') {
    const dailyQuestFiles = fs.readdirSync(`./database/quests/daily`, 'ascii')
    for (const quest of dailyQuestFiles) {
      if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'COIN' && fs.existsSync(`./database/quests/daily/${quest}/itemId`)) coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/daily/${quest}/itemId`, 'ascii'),
        file: `daily/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'COIN') coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        file: `daily/${quest}`
      })
    }

    const weeklyQuestFiles = fs.readdirSync(`./database/quests/weekly`, 'ascii')
    for (const quest of weeklyQuestFiles) {
      if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'COIN' && fs.existsSync(`./database/quests/weekly/${quest}/itemId`)) coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/weekly/${quest}/itemId`, 'ascii'),
        file: `weekly/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'COIN') coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        file: `weekly/${quest}`
      })
    }

    const vipQuestFiles = fs.readdirSync(`./database/quests/vip`, 'ascii')
    for (const quest of vipQuestFiles) {
      if (fs.readFileSync(`./database/quests/vip/${quest}/type`, 'ascii') === 'COIN' && fs.existsSync(`./database/quests/vip/${quest}/itemId`)) coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/vip/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/vip/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/vip/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/vip/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/vip/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/vip/${quest}/itemId`, 'ascii'),
        file: `vip/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/vip/${quest}/type`, 'ascii') === 'COIN') coinQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/vip/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/vip/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/vip/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/vip/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/vip/${quest}/title`, 'ascii'),
        file: `vip/${quest}`
      })
    }
  } else if (type === 'items') {
    const dailyQuestFiles = fs.readdirSync(`./database/quests/daily`, 'ascii')
    for (const quest of dailyQuestFiles) {
      if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'ITEM' && fs.existsSync(`./database/quests/daily/${quest}/itemId`) && fs.readFileSync(`./database/quests/daily/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/daily/${quest}/itemId`, 'ascii'),
        file: `daily/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/daily/${quest}/type`, 'ascii') === 'ITEM' && fs.readFileSync(`./database/quests/daily/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/daily/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/daily/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/daily/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/daily/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/daily/${quest}/title`, 'ascii'),
        file: `daily/${quest}`
      })
    }

    const weeklyQuestFiles = fs.readdirSync(`./database/quests/weekly`, 'ascii')
    for (const quest of weeklyQuestFiles) {
      if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'ITEM' && fs.existsSync(`./database/quests/weekly/${quest}/itemId`) && fs.readFileSync(`./database/quests/weekly/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/weekly/${quest}/itemId`, 'ascii'),
        file: `weekly/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/weekly/${quest}/type`, 'ascii') === 'ITEM' && fs.readFileSync(`./database/quests/weekly/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/weekly/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/weekly/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/weekly/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/weekly/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/weekly/${quest}/title`, 'ascii'),
        file: `weekly/${quest}`
      })
    }

    const vipQuestFiles = fs.readdirSync(`./database/quests/vip`, 'ascii')
    for (const quest of vipQuestFiles) {
      if (fs.readFileSync(`./database/quests/vip/${quest}/type`, 'ascii') === 'ITEM' && fs.existsSync(`./database/quests/vip/${quest}/itemId`) && fs.readFileSync(`./database/quests/vip/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/vip/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/vip/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/vip/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/vip/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/vip/${quest}/title`, 'ascii'),
        itemId: fs.readFileSync(`./database/quests/vip/${quest}/itemId`, 'ascii'),
        file: `vip/${quest}`
      })
      else if (fs.readFileSync(`./database/quests/vip/${quest}/type`, 'ascii') === 'ITEM' && fs.readFileSync(`./database/quests/vip/${quest}/itemId`, 'ascii') === itemId) itemQuests.push({
        collectAmount: fs.readFileSync(`./database/quests/vip/${quest}/collectAmount`, 'ascii'),
        reward: fs.readFileSync(`./database/quests/vip/${quest}/reward`, 'ascii'),
        rewardAmount: fs.readFileSync(`./database/quests/vip/${quest}/rewardAmount`, 'ascii'),
        rewardType: fs.readFileSync(`./database/quests/vip/${quest}/rewardType`, 'ascii'),
        title: fs.readFileSync(`./database/quests/vip/${quest}/title`, 'ascii'),
        file: `vip/${quest}`
      })
    }
  }

  let completedQuests = []
  if (type === 'activity') {
    for (const quest of activityQuests) {
      if (!fs.existsSync(`./database/quests/${quest.file}/users/${userId}`)) {
        fs.mkdirSync(`./database/quests/${quest.file}/users/${userId}`)
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, '1')
      } else if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
        //do nothing
      } else {
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) + 1).toString())
        if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
          completedQuests.push({
            complete: true,
            questTitle: quest.title,
            questReward: quest.reward
          })
          fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, quest.collectAmount)

          if (quest.rewardType === 'XP') {
            let mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
            let amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
            let level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
            let requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
            if (parseInt(level) >= 10 && mobile === 'no') return
            let amountToAdd = quest.rewardAmount
            while (amountToAdd > 0) {
              amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
              level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
              requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
              if (parseInt(level) >= 10 && mobile === 'no') return amountToAdd = 0
              if (amountToAdd >= parseInt(requiredXp)) {
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
                amountToAdd -= parseInt(requiredXp)
              } else if (parseInt(amountOwned) + amountToAdd >= parseInt(requiredXp)) {
                amountToAdd = parseInt(amountOwned) - parseInt(requiredXp) + amountToAdd
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
              } else {
                fs.writeFileSync(`./database/users/${userId}/xp`, (parseInt(amountOwned) + amountToAdd).toString())
                amountToAdd -= amountToAdd
              }
            }
          } else if (quest.rewardType === 'COINS') {
            let amountOwned = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
            fs.writeFileSync(`./database/users/${userId}/balance`, (parseInt(amountOwned) + Number(quest.rewardAmount)).toString())
          }
        }
      }
    }
  } else if (type === 'coins') {
    for (const quest of coinQuests) {
      if (!fs.existsSync(`./database/quests/${quest.file}/users/${userId}`)) {
        fs.mkdirSync(`./database/quests/${quest.file}/users/${userId}`)
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, coins.toString())
      } else if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
        //do nothing
      } else {
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) + coins).toString())
        if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
          completedQuests.push({
            complete: true,
            questTitle: quest.title,
            questReward: quest.reward
          })
          fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, quest.collectAmount)

          if (quest.rewardType === 'XP') {
            let mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
            let amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
            let level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
            let requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
            if (parseInt(level) >= 10 && mobile === 'no') return
            let amountToAdd = quest.rewardAmount
            while (amountToAdd > 0) {
              amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
              level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
              requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
              if (parseInt(level) >= 10 && mobile === 'no') return amountToAdd = 0
              if (amountToAdd >= parseInt(requiredXp)) {
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
                amountToAdd -= parseInt(requiredXp)
              } else if (parseInt(amountOwned) + amountToAdd >= parseInt(requiredXp)) {
                amountToAdd = parseInt(amountOwned) - parseInt(requiredXp) + amountToAdd
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
              } else {
                fs.writeFileSync(`./database/users/${userId}/xp`, (parseInt(amountOwned) + amountToAdd).toString())
                amountToAdd -= amountToAdd
              }
            }
          } else if (quest.rewardType === 'COINS') {
            let amountOwned = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
            fs.writeFileSync(`./database/users/${userId}/balance`, (parseInt(amountOwned) + Number(quest.rewardAmount)).toString())
          }
        }
      }
    }
  } else if (type === 'items') {
    for (const quest of itemQuests) {
      if (!fs.existsSync(`./database/quests/${quest.file}/users/${userId}`)) {
        fs.mkdirSync(`./database/quests/${quest.file}/users/${userId}`)
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, itemAmount.toString())
      } else if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
        //do nothing
      } else {
        fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) + itemAmount).toString())
        if (Number(fs.readFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, 'ascii')) >= Number(quest.collectAmount)) {
          completedQuests.push({
            complete: true,
            questTitle: quest.title,
            questReward: quest.reward
          })
          fs.writeFileSync(`./database/quests/${quest.file}/users/${userId}/rewardComplete`, quest.collectAmount)

          if (quest.rewardType === 'XP') {
            let mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
            let amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
            let level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
            let requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
            if (parseInt(level) >= 10 && mobile === 'no') return
            let amountToAdd = quest.rewardAmount
            while (amountToAdd > 0) {
              amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
              level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
              requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
              if (parseInt(level) >= 10 && mobile === 'no') return amountToAdd = 0
              if (amountToAdd >= parseInt(requiredXp)) {
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
                amountToAdd -= parseInt(requiredXp)
              } else if (parseInt(amountOwned) + amountToAdd >= parseInt(requiredXp)) {
                amountToAdd = parseInt(amountOwned) - parseInt(requiredXp) + amountToAdd
                fs.writeFileSync(`./database/users/${userId}/xp`, '0')
                fs.writeFileSync(`./database/users/${userId}/level`, (parseInt(level) + 1).toString())
                fs.writeFileSync(`./database/users/${userId}/requiredXp`, (parseInt(requiredXp) + 50).toString())
              } else {
                fs.writeFileSync(`./database/users/${userId}/xp`, (parseInt(amountOwned) + amountToAdd).toString())
                amountToAdd -= amountToAdd
              }
            }
          } else if (quest.rewardType === 'COINS') {
            let amountOwned = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
            fs.writeFileSync(`./database/users/${userId}/balance`, (parseInt(amountOwned) + Number(quest.rewardAmount)).toString())
          }
        }
      }
    }
  }

  return completedQuests
}

module.exports = {
  questCheck
}