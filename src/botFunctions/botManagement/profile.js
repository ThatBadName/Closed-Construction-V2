const {
  EmbedBuilder
} = require('discord.js')
const fs = require('fs')

function createStaffProfileEmbed(object, interaction) {
  const {
    colours
  } = require('../../constants')
  if (object === null) return null

  const embed = new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle(`[Staff View] ${object.tag}'s profile | ${object.id}`)
    .setDescription(
      `${object.bio}`
    )
    .setURL('https://google.com/')
    .setFields({
      name: 'General',
      value: `Balance: \`${parseInt(object.balance).toLocaleString()}\`\n` +
        `Level: \`${parseInt(object.level).toLocaleString()}\`\n` +
        `XP: \`${parseInt(object.xp).toLocaleString()}/${parseInt(object.requiredXp).toLocaleString()}\``,
      inline: true
    }, {
      name: 'City',
      value: `Name: \`${object.cityName}\`\n` +
        `Citizens: \`${parseInt(object.citizens).toLocaleString()}\``,
      inline: true
    }, {
      name: 'Stats',
      value: `Commands Run: \`${parseInt(object.commandsRun).toLocaleString()}\`\n` +
      `Multi: \`${parseInt(object.multi)}\``,
      inline: true
    }, {
      name: 'Staff Stuff',
      value:
        `Created: <t:${Math.round(object.created / 1000)}> (<t:${Math.round(object.created / 1000)}:R>)\n` +
        `Cooldown Immunity: ${object.cooldownImmunity}\n` +
        `Command Tracking: ${object.trackCommands}`,
      inline: true
    })

  return embed
}

function viewStaffProfile(userId, interaction) {
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
    const cooldownImmunity = fs.readFileSync(`./database/users/${userId}/admin/cooldownImmunity`, 'ascii')
    const trackCommands = fs.readFileSync(`./database/users/${userId}/admin/trackCommands`, 'ascii')
    const cityIcon = fs.readFileSync(`./database/users/${userId}/city/image`, 'ascii')
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
      cooldownImmunity,
      trackCommands,
      cityIcon,

      economyBan,
      botBan,
      reportBan,
    }

    return returned
  } else {
    return null
  }
}

module.exports = {
  createStaffProfileEmbed,
  viewStaffProfile
}