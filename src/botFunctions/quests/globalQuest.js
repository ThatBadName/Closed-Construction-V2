const fs = require('fs')

async function checkGlobalQuests(type, userId, coins, itemId, itemAmount) {
  let quest
  if (fs.readFileSync(`./database/quests/global/type`, 'ascii') === 'ACTIVITY' && fs.existsSync(`./database/quests/global/itemId`)) globalQuest = {
    collectAmount: fs.readFileSync(`./database/quests/global/collectAmount`, 'ascii'),
    reward: fs.readFileSync(`./database/quests/global/reward`, 'ascii'),
    amountComplete: fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii'),
    rewardAmount: fs.readFileSync(`./database/quests/global/rewardAmount`, 'ascii'),
    rewardType: fs.readFileSync(`./database/quests/global/rewardType`, 'ascii'),
    title: fs.readFileSync(`./database/quests/global/title`, 'ascii'),
    itemId: fs.readFileSync(`./database/quests/global/itemId`, 'ascii'),
    file: `global`
  }
  else if (fs.readFileSync(`./database/quests/global/type`, 'ascii') === 'ACTIVITY') globalQuest = {
    collectAmount: fs.readFileSync(`./database/quests/global/collectAmount`, 'ascii'),
    reward: fs.readFileSync(`./database/quests/global/reward`, 'ascii'),
    amountComplete: fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii'),
    rewardAmount: fs.readFileSync(`./database/quests/global/rewardAmount`, 'ascii'),
    rewardType: fs.readFileSync(`./database/quests/global/rewardType`, 'ascii'),
    title: fs.readFileSync(`./database/quests/global/title`, 'ascii'),
    file: `global`
  }

  let globalQuestComplete = false
  if (type === 'COINS') {
    if (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) >= Number(quest.collectAmount)) {
      //do nothing
    } else {
      fs.writeFileSync(`./database/quests/global/amountComplete`, (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) + coins).toString())
      if (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) >= Number(quest.collectAmount)) {
        fs.writeFileSync(`./database/quests/global/amountComplete`, quest.collectAmount)
        fs.writeFileSync(`./database/quests/global/users/${userId}`, quest.collectAmount)
        globalQuestComplete = true
      }
    }
  }
  else if (type === 'ITEMS') {
    if (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) >= Number(quest.collectAmount)) {
      //do nothing
    } else {
      fs.writeFileSync(`./database/quests/global/amountComplete`, (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) + coins).toString())
      if (Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) >= Number(quest.collectAmount)) {
        fs.writeFileSync(`./database/quests/global/amountComplete`, quest.collectAmount)
        globalQuestComplete = true
      }
    }
  }

  if (globalQuestComplete === true) {
    for (const user of fs.readdirSync(`./database/quests/global/users`)) {
      const amountOfReward = Number(fs.readFileSync(`./database/quests/global/users/${user}/`))
    }
  }
}