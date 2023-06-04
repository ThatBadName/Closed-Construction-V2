const {
  EmbedBuilder
} = require('discord.js')
const fs = require('fs')

async function createProfile(interaction) {
  const {
    emojis
  } = require('../constants')
  const userId = interaction.user.id
  var dateDaily = new Date()
  var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
  if (fs.existsSync(`./database/users/${userId}/`)) return false
  fs.mkdirSync(`./database/users/${userId}`)
  fs.mkdirSync(`./database/users/${userId}/inventory`)
  fs.mkdirSync(`./database/users/${userId}/admin`)
  fs.mkdirSync(`./database/users/${userId}/inventory/starterCrate`)
  fs.mkdirSync(`./database/users/${userId}/city`)
  fs.mkdirSync(`./database/users/${userId}/city/activity`)
  fs.mkdirSync(`./database/users/${userId}/settings`)
  fs.mkdirSync(`./database/users/${userId}/city/buildings`)
  fs.mkdirSync(`./database/users/${userId}/badges`)
  fs.mkdirSync(`./database/users/${userId}/quests`)
  fs.mkdirSync(`./database/users/${userId}/quests/active`)
  fs.writeFileSync(`./database/users/${userId}/quests/completed`, `0`)
  fs.writeFileSync(`./database/users/${userId}/id`, userId)
  fs.writeFileSync(`./database/users/${userId}/tag`, interaction.user.tag)
  fs.writeFileSync(`./database/users/${userId}/bio`, `Hi I'm ${interaction.user.tag}`)
  fs.writeFileSync(`./database/users/${userId}/balance`, '10000')
  fs.writeFileSync(`./database/users/${userId}/citizens`, '100')
  fs.writeFileSync(`./database/users/${userId}/level`, '1')
  fs.writeFileSync(`./database/users/${userId}/xp`, '0')
  fs.writeFileSync(`./database/users/${userId}/requiredXp`, '100')
  fs.writeFileSync(`./database/users/${userId}/cityName`, `${interaction.user.username}'s city`)
  fs.writeFileSync(`./database/users/${userId}/created`, `${nowUTC}`)
  fs.writeFileSync(`./database/users/${userId}/commandsRun`, `1`)
  fs.writeFileSync(`./database/users/${userId}/multi`, `0`)
  fs.writeFileSync(`./database/users/${userId}/happyness`, `100`)
  fs.writeFileSync(`./database/users/${userId}/admin/cooldownImmunity`, `none`)
  fs.writeFileSync(`./database/users/${userId}/admin/trackCommands`, `never`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/id`, `starter crate`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/amount`, `1`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/name`, `Starter Crate`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/emoji`, emojis.starterCrate)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/type`, 'Crate')
  fs.writeFileSync(`./database/users/${userId}/city/position`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/topSpeed`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/mobile`, `no`)
  fs.writeFileSync(`./database/users/${userId}/city/weight`, `100`)
  fs.writeFileSync(`./database/users/${userId}/city/attack`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/defence`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/engine`, `none`)
  fs.writeFileSync(`./database/users/${userId}/city/efficiency`, `none`)
  fs.writeFileSync(`./database/users/${userId}/city/radar`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/hostile`, `no`)
  fs.writeFileSync(`./database/users/${userId}/city/activity/shifts`, `1`)
  fs.writeFileSync(`./database/users/${userId}/city/maxPop`, `100`)
  fs.writeFileSync(`./database/users/${userId}/city/slogan`, `${interaction.user.username}'s city`)
  fs.writeFileSync(`./database/users/${userId}/city/image`, `https://i.imgur.com/cYaZ35V.png`)
  fs.writeFileSync(`./database/users/${userId}/city/imageUnlocked`, `no`)
  fs.writeFileSync(`./database/users/${userId}/settings/newAlerts`, `yes`)
  return true
}

async function createProfileId(userId, client) {
  const checkForUser = await client.users.fetch(userId).catch(() => {})
  if (!checkForUser) return null

  const {
    emojis
  } = require('../constants')
  var dateDaily = new Date()
  var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
  if (fs.existsSync(`./database/users/${userId}/`)) return false
  fs.mkdirSync(`./database/users/${userId}`)
  fs.mkdirSync(`./database/users/${userId}/inventory`)
  fs.mkdirSync(`./database/users/${userId}/admin`)
  fs.mkdirSync(`./database/users/${userId}/inventory/starterCrate`)
  fs.mkdirSync(`./database/users/${userId}/city`)
  fs.mkdirSync(`./database/users/${userId}/settings`)
  fs.mkdirSync(`./database/users/${userId}/city/buildings`)
  fs.mkdirSync(`./database/users/${userId}/city/activity`)
  fs.mkdirSync(`./database/users/${userId}/badges`)
  fs.mkdirSync(`./database/users/${userId}/quests`)
  fs.mkdirSync(`./database/users/${userId}/quests/active`)
  fs.writeFileSync(`./database/users/${userId}/quests/completed`, `0`)
  fs.writeFileSync(`./database/users/${userId}/id`, userId)
  fs.writeFileSync(`./database/users/${userId}/tag`, checkForUser.tag)
  fs.writeFileSync(`./database/users/${userId}/bio`, `Hi I'm ${checkForUser.tag}`)
  fs.writeFileSync(`./database/users/${userId}/balance`, '10000')
  fs.writeFileSync(`./database/users/${userId}/citizens`, '100')
  fs.writeFileSync(`./database/users/${userId}/admin/unlockedQuest`, 'no')
  fs.writeFileSync(`./database/users/${userId}/level`, '1')
  fs.writeFileSync(`./database/users/${userId}/xp`, '0')
  fs.writeFileSync(`./database/users/${userId}/requiredXp`, '100')
  fs.writeFileSync(`./database/users/${userId}/cityName`, `${checkForUser.username}'s city`)
  fs.writeFileSync(`./database/users/${userId}/created`, `${nowUTC}`)
  fs.writeFileSync(`./database/users/${userId}/commandsRun`, `1`)
  fs.writeFileSync(`./database/users/${userId}/multi`, `0`)
  fs.writeFileSync(`./database/users/${userId}/happyness`, `100`)
  fs.writeFileSync(`./database/users/${userId}/admin/cooldownImmunity`, `none`)
  fs.writeFileSync(`./database/users/${userId}/admin/trackCommands`, `never`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/id`, `starter crate`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/amount`, `1`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/name`, `Starter Crate`)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/emoji`, emojis.starterCrate)
  fs.writeFileSync(`./database/users/${userId}/inventory/starterCrate/type`, 'Crate')
  fs.writeFileSync(`./database/users/${userId}/city/position`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/topSpeed`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/mobile`, `no`)
  fs.writeFileSync(`./database/users/${userId}/city/weight`, `100`)
  fs.writeFileSync(`./database/users/${userId}/city/attack`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/defence`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/engine`, `none`)
  fs.writeFileSync(`./database/users/${userId}/city/efficiency`, `none`)
  fs.writeFileSync(`./database/users/${userId}/city/radar`, `0`)
  fs.writeFileSync(`./database/users/${userId}/city/maxPop`, `100`)
  fs.writeFileSync(`./database/users/${userId}/city/activity/shifts`, `1`)
  fs.writeFileSync(`./database/users/${userId}/city/hostile`, `no`)
  fs.writeFileSync(`./database/users/${userId}/city/slogan`, `${checkForUser.username}'s city`)
  fs.writeFileSync(`./database/users/${userId}/city/image`, `https://i.imgur.com/cYaZ35V.png`)
  fs.writeFileSync(`./database/users/${userId}/city/imageUnlocked`, `no`)
  fs.writeFileSync(`./database/users/${userId}/settings/newAlerts`, `yes`)
  return true
}
function viewProfile(userId, interaction) {
  if (fs.existsSync(`./database/users/${userId}/`)) {
    const id = fs.readFileSync(`./database/users/${userId}/id`, 'ascii')
    const tag = fs.readFileSync(`./database/users/${userId}/tag`, 'ascii')
    const bio = fs.readFileSync(`./database/users/${userId}/bio`, 'ascii')
    const balance = fs.readFileSync(`./database/users/${userId}/balance`, 'ascii')
    const citizens = fs.readFileSync(`./database/users/${userId}/citizens`, 'ascii')
    const level = fs.readFileSync(`./database/users/${userId}/level`, 'ascii')
    const xp = fs.readFileSync(`./database/users/${userId}/xp`, 'ascii')
    const requiredXp = fs.readFileSync(`./database/users/${userId}/requiredXp`, 'ascii')
    const cityName = fs.readFileSync(`./database/users/${userId}/cityName`, 'ascii')
    const created = fs.readFileSync(`./database/users/${userId}/created`, 'ascii')
    const commandsRun = fs.readFileSync(`./database/users/${userId}/commandsRun`, 'ascii')
    const multi = fs.readFileSync(`./database/users/${userId}/multi`, 'ascii')
    const mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
    const cooldownImmunity = fs.readFileSync(`./database/users/${userId}/admin/cooldownImmunity`, 'ascii')
    const trackCommands = fs.readFileSync(`./database/users/${userId}/admin/trackCommands`, 'ascii')
    const cityIcon = fs.readFileSync(`./database/users/${userId}/city/image`, 'ascii')
    let badges = []
    for (const dir of fs.readdirSync(`./database/users/${userId}/badges`, 'ascii')) {
      badges.push({
        name: fs.readFileSync(`./database/users/${userId}/badges/${dir}/name`, 'ascii'),
        emoji: fs.readFileSync(`./database/users/${userId}/badges/${dir}/emoji`, 'ascii'),
        added: fs.readFileSync(`./database/users/${userId}/badges/${dir}/added`, 'ascii')
      })
    }

    let economyBan = 'no'
    let reportBan = 'no'
    let botBan = 'no'
    if (fs.existsSync(`./database/blacklist/${userId}`)) {
      if (fs.readFileSync(`./database/blacklist/${userId}/botBan`, 'ascii') === 'yes') botBan = 'yes'
      if (fs.readFileSync(`./database/blacklist/${userId}/ecoBan`, 'ascii') === 'yes') economyBan = 'yes'
      if (fs.readFileSync(`./database/blacklist/${userId}/reportBan`, 'ascii') === 'yes') reportBan = 'yes'
    }
    const returned = {
      id,
      tag,
      bio,
      balance,
      citizens,
      level,
      xp,
      requiredXp,
      cityName,
      created,
      commandsRun,
      multi,
      hasProfile: 'Yes',
      mobile,
      cooldownImmunity,
      trackCommands,
      cityIcon,
      badges,

      economyBan,
      botBan,
      reportBan,
    }

    return returned
  } else {
    if (userId !== interaction.user.id) return null
    createProfile(interaction)
    var dateDaily = new Date()
    var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
    const returned = {
      id: interaction.user.id,
      tag: interaction.user.tag,
      bio: `Hi I'm ${interaction.user.tag}`,
      balance: '10000',
      citizens: '100',
      level: '1',
      xp: '0',
      requiredXp: '100',
      cityName: `${interaction.user.tag}'s city`,
      created: `${nowUTC}`,
      commandsRun: `1`,
      multi: `0`,
      economyBan: 'no',
      botBan: 'no',
      mobile: 'no',
      hasProfile: 'no',
      cooldownImmunity: 'none',
      reportBan: 'no',
      trackCommands: 'never',
      cityIcon: 'https://i.imgur.com/cYaZ35V.png'
    }

    return returned
  }
}

function createProfileEmbed(object, interaction) {
  const {
    colours
  } = require('../constants')
  let avatarUrl
  if (object.cityIcon === 'https://i.imgur.com/cYaZ35V.png') {
    if (interaction.options.getUser('user')) avatarUrl = interaction.options.getUser('user').displayAvatarURL({
      dynamic: true,
      size: 1024
    })
    else avatarUrl = interaction.user.displayAvatarURL({
      dynamic: true,
      size: 1024
    })
  } else avatarUrl = object.cityIcon
  const embed = new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle(`${object.tag}'s profile`)
    .setDescription(
      `${object.badges.map(b => b.emoji).join(' ')}${object.badges.length === 0 ? '' : '\n'}` +
      `${object.bio}`
    )
    .setURL('https://google.com/')
    .setThumbnail(avatarUrl)
    .setFields({
      name: 'General',
      value:
        `Balance: \`${abbreviateNumber(parseInt(object.balance))}\`\n` +
        `Level: \`${parseInt(object.level).toLocaleString()}\`\n` +
        `XP: \`${abbreviateNumber(parseInt(object.xp))}/${abbreviateNumber(parseInt(object.requiredXp))}\``,
      inline: true
    }, {
      name: 'City',
      value:
        `Name: \`${object.cityName}\`\n` +
        `Citizens: \`${abbreviateNumber(parseInt(object.citizens))}\``,
      inline: true
    }, {
      name: 'Stats',
      value:
        `Commands Run: \`${abbreviateNumber(parseInt(object.commandsRun))}\`\n` +
        `Multi: \`${abbreviateNumber(parseInt(object.multi))}\``,
      inline: false
    })

  return embed
}

async function createProfileEmbedButton(object, interaction, client) {
  const {
    colours
  } = require('../constants')
  let avatarUrl
  const user = await client.users.fetch(interaction.customId.split('-')[2])
  if (object.cityIcon === 'https://i.imgur.com/cYaZ35V.png') {
    avatarUrl = `https://cdn.discordapp.com/avatars/${object.id}/${user.avatar}`
  } else avatarUrl = object.cityIcon
  const embed = new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle(`${object.tag}'s profile`)
    .setDescription(
      `${object.badges.map(b => b.emoji).join(' ')}${object.badges.length === 0 ? '' : '\n'}` +
      `${object.bio}`
    )
    .setURL('https://google.com/')
    .setThumbnail(avatarUrl)
    .setFields({
      name: 'General',
      value:
        `Balance: \`${abbreviateNumber(parseInt(object.balance))}\`\n` +
        `Level: \`${parseInt(object.level).toLocaleString()}\`\n` +
        `XP: \`${abbreviateNumber(parseInt(object.xp))}/${abbreviateNumber(parseInt(object.requiredXp))}\``,
      inline: true
    }, {
      name: 'City',
      value:
        `Name: \`${object.cityName}\`\n` +
        `Citizens: \`${abbreviateNumber(parseInt(object.citizens))}\``,
      inline: true
    }, {
      name: 'Stats',
      value:
        `Commands Run: \`${abbreviateNumber(parseInt(object.commandsRun))}\`\n` +
        `Multi: \`${abbreviateNumber(parseInt(object.multi))}\``,
      inline: false
    })
  return embed
}

function abbreviateNumber(number, decPlaces) {
  if (!decPlaces) decPlaces = Math.pow(10, 0)
  else decPlaces = Math.pow(10, decPlaces)

  var abbrev = ['K', ' M', ' Billion', ' Trillion']

  for (var i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3)

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1
        i++
      }

      number += abbrev[i]

      break
    }
  }

  return number
}

function addCommandRun(interaction) {
  if (!fs.existsSync(`./database/users/${interaction.user.id}`)) return
  let commandsRun = fs.readFileSync(`./database/users/${interaction.user.id}/commandsRun`, 'ascii')
  fs.writeFileSync(`./database/users/${interaction.user.id}/commandsRun`, (parseInt(commandsRun) + 1).toString())
}

function checkSettings(userId) {
  let newAlerts = false
  let dmNotifs = false
  let compactMode = false
  let hideMe = false
  if (fs.existsSync(`./database/users/${userId}/settings/newAlerts`)) if (fs.readFileSync(`./database/users/${userId}/settings/newAlerts`, 'ascii') === 'yes') newAlerts = true
  if (fs.existsSync(`./database/users/${userId}/settings/dmNotifs`)) if (fs.readFileSync(`./database/users/${userId}/settings/dmNotifs`, 'ascii') === 'yes') dmNotifs = true
  if (fs.existsSync(`./database/users/${userId}/settings/compactMode`)) if (fs.readFileSync(`./database/users/${userId}/settings/compactMode`, 'ascii') === 'yes') compactMode = true
  if (fs.existsSync(`./database/users/${userId}/settings/hideMe`)) if (fs.readFileSync(`./database/users/${userId}/settings/hideMe`, 'ascii') === 'yes') hideMe = true


  return {
    newAlerts,
    dmNotifs,
    compactMode,
    hideMe
  }
}


module.exports = {
  createProfile,
  viewProfile,
  createProfileEmbed,
  abbreviateNumber,
  addCommandRun,
  createProfileId,
  checkSettings,
  createProfileEmbedButton
}