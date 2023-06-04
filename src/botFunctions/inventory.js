const {
  EmbedBuilder
} = require('discord.js')
const fs = require('fs')
const {
  colours,
  badges,
  emojis
} = require('../constants')
const {
  createProfileId,
  checkSettings
} = require('./main')
const {
  questCheck
} = require('./quests/quest')

function inventory(userId) {
  let arr = []

  if (!fs.existsSync(`./database/users/${userId}/inventory`)) return null
  const inventoryFolders = fs.readdirSync(`./database/users/${userId}/inventory`)
  for (const folder of inventoryFolders) {
    if (!fs.existsSync(`./database/users/${userId}/inventory/${folder}/name`)) return null

    const name = fs.readFileSync(`./database/users/${userId}/inventory/${folder}/name`, 'ascii')
    const emoji = fs.readFileSync(`./database/users/${userId}/inventory/${folder}/emoji`, 'ascii')
    const id = fs.readFileSync(`./database/users/${userId}/inventory/${folder}/id`, 'ascii')
    const amount = fs.readFileSync(`./database/users/${userId}/inventory/${folder}/amount`, 'ascii')
    const type = fs.readFileSync(`./database/users/${userId}/inventory/${folder}/type`, 'ascii')

    arr.push({
      name: name,
      id: id,
      emoji: emoji,
      amount: amount,
      type: type
    })
  }
  return arr
}

async function createPages(arr, tag, id) {
  const embeds = []
  let k = 8
  for (let i = 0; i < arr.length; i += 8) {
    const current = arr.slice(i, k)
    let j = i
    k += 8
    let info = ``
    if (checkSettings(id).compactMode === true) info = current.map(item => `[${parseInt(item.amount).toLocaleString()}] ${item.emoji}${item.name}`).join('\n')
    else info = current.map(item => `[${parseInt(item.amount).toLocaleString()}] ${item.emoji}${item.name} - \`${item.id}\`\n${item.type}`).join('\n\n')
    const embed = new EmbedBuilder()
      .setColor(colours.blend)
      .setTitle(`${tag}'s inventory`)
      .setDescription(info)
    embeds.push(embed)
  }
  return embeds
}

function generateCrateLoot(crate) {
  const items = require('../items/itemList')

  const search = !!items.find((value) => value.id === crate)
  if (!search) return interaction.editReply({
    embeds: [
      new EmbedBuilder()
      .setTitle('I could not find that crate')
      .setColor('0x' + colours.error)
    ]
  })
  const itemFound = items.find((value) => value.id === crate)
  const lootTable = itemFound.loot
  let amountOfItems = Math.round(Math.random() * (itemFound.maxItems - itemFound.minItems) + itemFound.minItems)
  let rewardArray = []
  for (let a = 0; a < amountOfItems; ++a) {
    let random = chooseRandom(lootTable)
    let found = false
    for (let item = 0; item < rewardArray.length; ++item) {
      if (rewardArray[item].split('|').includes(random.split('|')[0])) found = true
    }
    if (found === false) {
      rewardArray.push(random)
    }
  }
  rewardArray.push(Math.round(Math.random() * (itemFound.maxCoins - itemFound.minCoins) + itemFound.minCoins))
  return rewardArray
}

function chooseRandom(lootTable) {
  let picked = null;
  let roll = Math.floor(Math.random() * 100);
  for (let i = 0, len = lootTable.length; i < len; ++i) {
    const loot = lootTable[i];
    const {
      chance
    } = loot;
    if (roll < chance) {
      picked = loot;
      let returned = picked.id + '|' + Math.round(Math.random() * (picked.max - picked.min) + picked.min)
      return returned
    }
    roll -= chance;
  }
}

function removeItem(fileId, amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/inventory/${fileId}/amount`, 'ascii')
  if (parseInt(amountOwned) < amount) amount = parseInt(amountOwned)

  if (parseInt(amountOwned) - amount <= 0) fs.rm(`./database/users/${userId}/inventory/${fileId}`, {
    recursive: true
  }, (() => {}))
  else fs.writeFileSync(`./database/users/${userId}/inventory/${fileId}/amount`, (parseInt(amountOwned) - amount).toString())
}

async function addItem(itemId, amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/`)) createProfileId(userId, client)
  const items = require('../items/itemList')
  const search = !!items.find((value) => value.id === itemId)
  if (!search) return
  const itemFound = items.find((value) => value.id === itemId)

  const quest = await questCheck('items', userId, null, itemId, amount)
  if (quest.length >= 1) {
    if (fs.readFileSync(`./database/users/${userId}/admin/unlockedQuest`, 'ascii') === 'no') {
      fs.writeFileSync(`./database/users/${userId}/admin/unlockedQuest`, quest.map(item => `**${item.questTitle}**\n${emojis.reply}You recieved: ${item.questReward}`).join('\n\n'))
    } else {
      fs.writeFileSync(`./database/users/${userId}/admin/unlockedQuest`, fs.readFileSync(`./database/users/${userId}/admin/unlockedQuest`, 'ascii') += quest.map(item => `**${item.questTitle}**\n${emojis.reply}You recieved: ${item.questReward}`).join('\n\n'))
    }
  }

  if (!fs.existsSync(`./database/users/${userId}/inventory/${itemFound.fileId}`)) {
    fs.mkdirSync(`./database/users/${userId}/inventory/${itemFound.fileId}`)
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/id`, itemFound.id)
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/name`, itemFound.name)
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/emoji`, itemFound.emoji)
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/type`, itemFound.type)
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/amount`, amount.toString())
  } else {
    let amountOwned = fs.readFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/amount`, 'ascii')
    fs.writeFileSync(`./database/users/${userId}/inventory/${itemFound.fileId}/amount`, (parseInt(amountOwned) + amount).toString())
  }
}

async function addCoins(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/balance`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
  fs.writeFileSync(`./database/users/${userId}/balance`, (parseInt(amountOwned) + amount).toString())

  const quest = await questCheck('coins', userId, amount)
  if (quest.length >= 1) {
    if (fs.readFileSync(`./database/users/${userId}/admin/unlockedQuest`, 'ascii') === 'no') {
      fs.writeFileSync(`./database/users/${userId}/admin/unlockedQuest`, quest.map(item => `**${item.questTitle}**\n${emojis.reply}You recieved: ${item.questReward}`).join('\n\n'))
    } else {
      fs.writeFileSync(`./database/users/${userId}/admin/unlockedQuest`, fs.readFileSync(`./database/users/${userId}/admin/unlockedQuest`, 'ascii') += quest.map(item => `**${item.questTitle}**\n${emojis.reply}You recieved: ${item.questReward}`).join('\n\n'))
    }
  }
}

function addMaxPop(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/city/maxPop`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/city/maxPop`, 'ascii')
  fs.writeFileSync(`./database/users/${userId}/city/maxPop`, (parseInt(amountOwned) + amount).toString())
}

function removeCoins(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/balance`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
  if (parseInt(amountOwned) - amount < 0) amount = parseInt(amountOwned)
  fs.writeFileSync(`./database/users/${userId}/balance`, (parseInt(amountOwned) - amount).toString())
}

function addCitizens(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/citizens`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/citizens`, 'ascii')
  fs.writeFileSync(`./database/users/${userId}/citizens`, (parseInt(amountOwned) + amount).toString())
}

function removeCitizens(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/citizens`)) createProfileId(userId, client)
  let amountOwned = fs.readFileSync(`./database/users/${userId}/citizens`, 'ascii')
  if (parseInt(amountOwned) - amount < 50) amount = parseInt(amountOwned) - 50
  fs.writeFileSync(`./database/users/${userId}/citizens`, (parseInt(amountOwned) - amount).toString())
}

function progressBar(value, maxValue, size) {
  const {
    progressBarEmojis
  } = emojis
  const {
    startFull,
    startEmpty,
    middleFull,
    middleEmpty,
    endFull,
    endEmpty
  } = progressBarEmojis
  const percentage = value / maxValue
  const progress = Math.round(size * percentage)
  const emptyProgress = size - progress
  const progressText = middleFull.repeat(progress)
  const emptyProgressText = middleEmpty.repeat(emptyProgress)
  const percentageComplete = Math.round(percentage * 100) + '%'

  let progressBar = progressFormat(`${progressText}${emptyProgressText}`)
  return {
    progressBar,
    percentageComplete
  };

  function progressFormat(str) {
    let strArr = str.trim().split(' ')

    if (strArr[0] === middleEmpty.trim()) strArr[0] = startEmpty.trim()
    if (strArr[0] === middleFull.trim()) strArr[0] = startFull.trim()

    if (strArr[strArr.length - 1] === middleEmpty.trim()) strArr[strArr.length - 1] = endEmpty.trim()
    if (strArr[strArr.length - 1] === middleFull.trim()) strArr[strArr.length - 1] = endFull.trim()

    return strArr.join('').replaceAll(' ', '')
  }
};

//todo this

async function addBadge(userId, badgeId, client) {
  if (!fs.existsSync(`./database/users/${userId}`)) await createProfileId(userId, client)
  if (fs.existsSync(`./database/users/${userId}/badges/${badgeId}`)) return
  else {
    var dateDaily = new Date()
    var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
    fs.mkdirSync(`./database/users/${userId}/badges/${badgeId}`)
    fs.writeFileSync(`./database/users/${userId}/badges/${badgeId}/name`, `${badges[badgeId].name}`)
    fs.writeFileSync(`./database/users/${userId}/badges/${badgeId}/emoji`, `${badges[badgeId].emoji}`)
    fs.writeFileSync(`./database/users/${userId}/badges/${badgeId}/added`, `${nowUTC}`)
  }
}

function addXp(amount, userId, client) {
  if (!fs.existsSync(`./database/users/${userId}/`)) {
    createProfileId(userId, client)
    return 'first'
  }
  let mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
  let amountOwned = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
  let level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
  let requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
  if (parseInt(level) >= 10 && mobile === 'no') return
  let amountToAdd = amount
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
}

function setXp(amount, userId) {
  if (!fs.existsSync(`./database/users/${userId}/balance`)) createProfileId(userId, client)
  let amountToAdd = amount
  fs.writeFileSync(`./database/users/${userId}/xp`, amountToAdd.toString())
}

function setLevel(amount, userId) {
  if (!fs.existsSync(`./database/users/${userId}/balance`)) createProfileId(userId, client)
  let amountToAdd = amount
  fs.writeFileSync(`./database/users/${userId}/level`, amountToAdd.toString())
}

function setRequiredXp(amount, userId) {
  if (!fs.existsSync(`./database/users/${userId}/balance`)) createProfileId(userId, client)
  let amountToAdd = amount
  fs.writeFileSync(`./database/users/${userId}/requiredXp`, amountToAdd.toString())
}

function addBuilding(userId, type, max, pop, name) {
  if (!type) type === 'Basic'
  if (!max) max === 10
  if (!pop) pop === 0
}

module.exports = {
  inventory,
  createPages,
  generateCrateLoot,
  removeItem,
  addItem,
  addCoins,
  removeCoins,
  addCitizens,
  removeCitizens,
  addXp,
  setXp,
  setRequiredXp,
  setLevel,
  addMaxPop,
  progressBar,
  addBadge
}