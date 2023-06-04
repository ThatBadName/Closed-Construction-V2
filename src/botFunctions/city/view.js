const {
  EmbedBuilder
} = require('discord.js')
const fs = require('fs')
const {
  colours
} = require('../../constants')
const {
  progressBar
} = require('../inventory')
const {
  abbreviateNumber,
  createProfile,
  viewProfile
} = require('../main')

function cityEmbed(object, interaction) {
  if (!object) return null
  const profile = viewProfile(interaction.user.id, interaction)
  const bar = progressBar(parseInt(profile.xp), parseInt(profile.requiredXp), 21)
  return new EmbedBuilder()
    .setColor(colours.blend)
    .setTitle(object.cityName)
    .setDescription(object.slogan)
    .setThumbnail(object.image)
    .setFields({
      name: 'General',
      value:
        `Citizens: \`${abbreviateNumber(object.citizens)}\`\n` +
        `Balance: \`${abbreviateNumber(profile.balance)}\``,
      inline: true
    }, {
      name: 'Leveling',
      value: `Level: \`${parseInt(profile.level).toLocaleString()}\`\n` +
        `XP: \`${abbreviateNumber(parseInt(profile.xp))}/${abbreviateNumber(parseInt(profile.requiredXp))}\` (${bar.percentageComplete})\n`,
      inline: true
    }, {
      name: ' ',
      value: `${bar.progressBar}`
    })
}

function cityView(userId, interaction) {
  if (fs.existsSync(`./database/users/${userId}/`)) {
    const id = fs.readFileSync(`./database/users/${userId}/id`, 'ascii')
    const citizens = fs.readFileSync(`./database/users/${userId}/citizens`, 'ascii')
    const tag = fs.readFileSync(`./database/users/${userId}/tag`, 'ascii')
    const cityName = fs.readFileSync(`./database/users/${userId}/cityName`, 'ascii')
    const position = fs.readFileSync(`./database/users/${userId}/city/position`, 'ascii')
    const attack = fs.readFileSync(`./database/users/${userId}/city/attack`, 'ascii')
    const defence = fs.readFileSync(`./database/users/${userId}/city/defence`, 'ascii')
    const efficiency = fs.readFileSync(`./database/users/${userId}/city/efficiency`, 'ascii')
    const engine = fs.readFileSync(`./database/users/${userId}/city/engine`, 'ascii')
    const mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
    const topSpeed = fs.readFileSync(`./database/users/${userId}/city/topSpeed`, 'ascii')
    const weight = fs.readFileSync(`./database/users/${userId}/city/weight`, 'ascii')
    const radar = fs.readFileSync(`./database/users/${userId}/city/radar`, 'ascii')
    const slogan = fs.readFileSync(`./database/users/${userId}/city/slogan`, 'ascii')
    const image = fs.readFileSync(`./database/users/${userId}/city/image`, 'ascii')
    const returned = {
      id,
      citizens,
      tag,
      cityName,
      position,
      attack,
      defence,
      efficiency,
      engine,
      mobile,
      topSpeed,
      weight,
      radar,
      slogan,
      image
    }

    return returned
  } else {
    if (userId !== interaction.user.id) return null
    createProfile(interaction)
    const id = fs.readFileSync(`./database/users/${userId}/id`, 'ascii')
    const citizens = fs.readFileSync(`./database/users/${userId}/citizens`, 'ascii')
    const tag = fs.readFileSync(`./database/users/${userId}/tag`, 'ascii')
    const cityName = fs.readFileSync(`./database/users/${userId}/cityName`, 'ascii')
    const position = fs.readFileSync(`./database/users/${userId}/city/position`, 'ascii')
    const attack = fs.readFileSync(`./database/users/${userId}/city/attack`, 'ascii')
    const defence = fs.readFileSync(`./database/users/${userId}/city/defence`, 'ascii')
    const efficiency = fs.readFileSync(`./database/users/${userId}/city/efficiency`, 'ascii')
    const engine = fs.readFileSync(`./database/users/${userId}/city/engine`, 'ascii')
    const mobile = fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii')
    const topSpeed = fs.readFileSync(`./database/users/${userId}/city/topSpeed`, 'ascii')
    const weight = fs.readFileSync(`./database/users/${userId}/city/weight`, 'ascii')
    const radar = fs.readFileSync(`./database/users/${userId}/city/radar`, 'ascii')
    const slogan = fs.readFileSync(`./database/users/${userId}/city/slogan`, 'ascii')
    const image = fs.readFileSync(`./database/users/${userId}/city/image`, 'ascii')
    const returned = {
      id,
      citizens,
      tag,
      cityName,
      position,
      attack,
      defence,
      efficiency,
      engine,
      mobile,
      topSpeed,
      weight,
      radar,
      slogan,
      image
    }

    return returned
  }
}

module.exports = {
  cityEmbed,
  cityView
}