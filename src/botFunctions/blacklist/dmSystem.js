const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const { colours, supportServerUrl } = require("../../constants")
const fs = require('fs')

async function dmAddBlacklist(interaction, userId, expires, reason, caseId, blacklist, type, client) {
  const user = await client.users.fetch(userId)
  if (type === 'Guild') return 
  if (!user) return {
    status: 'Failed',
    reason: 'Could not find user'
  }

  let failed = false
  await user.send({
    embeds: [
      new EmbedBuilder()
      .setTitle(`Blacklist Confirmation - You have been blacklisted from using ${client.user.username}`)
      .setColor(colours.warn)
      .setDescription(`This message has been sent to notify you that you have been banned from using ${client.user.username}\nInformation on the punishment can be found bellow:`)
      .setFields({
        name: 'Information',
        value:
          `Date Added: <t:${caseId}> (<t:${caseId}:R>)\nExpires: ${expires === 'never' ? 'Never' : `<t:${Math.floor(Math.round(expires / 1000))}> (<t:${Math.floor(Math.round(expires / 1000))}:R>)`}\n` +
          `You have been blacklisted from using the following:\n${blacklist.includes('a') ? '- Main bot\n- Economy commands\n- Report system\n' : `${blacklist.includes('b') ? '- Main bot\n' : ''} ${blacklist.includes('e') ? '- Economy commands\n' : ''} ${blacklist.includes('r') ? '- Report system\n' : ''}`}` +
          `Reason for blacklist:\n\`\`\`\n${reason}\n\`\`\``
      })
      .setFooter({text: `If you believe this is an error you can appeal in the support server`})
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setURL(supportServerUrl)
        .setLabel('Support Server')
        .setStyle('Link')
      )
    ]
  }).catch(() => {
    failed = true
    return {
    status: 'Failed',
    reason: 'Could not DM user'
  }})
  if (failed === false) return {
    status: 'Success',
    reason: 'DM Sent'
  }
  else return {
    status: 'Failed',
    reason: 'Could not DM user'
  }
}

async function dmRemoveBlacklist(interaction, userId, expires, reason, caseId, blacklist, type, client, active) {
  const user = await client.users.fetch(userId)
  if (type === 'Guild') return 
  if (!user) return {
    status: 'Failed',
    reason: 'Could not find user'
  }
  let unbannedTotal = false
  let botBan = false
  let ecoBan = false
  let reportBan = false

  if (!fs.existsSync(`./database/blacklist/${userId}`)) unbannedTotal = true
  else {
    if (fs.readFileSync(`./database/blacklist/${userId}/botBan`, 'ascii') === 'yes') botBan = true
    if (fs.readFileSync(`./database/blacklist/${userId}/ecoBan`, 'ascii') === 'yes') ecoBan = true
    if (fs.readFileSync(`./database/blacklist/${userId}/reportBan`, 'ascii') === 'yes') reportBan = true
    if (botBan === false && ecoBan === false && reportBan === false) unbannedTotal = true
  }

  let failed = false
  await user.send({
    embeds: [
      new EmbedBuilder()
      .setTitle(`Blacklist Confirmation - You have been removed from ${client.user.username}'s blacklist`)
      .setColor(colours.success)
      .setDescription(`This message has been sent to notify you that you have been unbanned from using ${client.user.username}.\nInformation on the punishment can be found bellow:`)
      .setFields({
        name: 'Information',
        value:
          `Date of blacklist: <t:${caseId}> (<t:${caseId}:R>)\n` +
          `${unbannedTotal === true ? 'You are no longer blacklisted\n' : `You're now banned from using:\n${botBan === true ? '- Main bot\n' : ''}${ecoBan === true ? '- Economy commands\n' : ''}${reportBan === true ? '- Report system\n' : ''}`}` +
          `Reason for blacklist:\n\`\`\`\n${reason}\n\`\`\``
      })
      .setFooter({text: `If you believe this is an error you can appeal in the support server`})
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setURL(supportServerUrl)
        .setLabel('Support Server')
        .setStyle('Link')
      )
    ]
  }).catch(() => {
    failed = true
    return {
    status: 'Failed',
    reason: 'Could not DM user'
  }})
  if (failed === false) return {
    status: 'Success',
    reason: 'DM Sent'
  }
  else return {
    status: 'Failed',
    reason: 'Could not DM user'
  }
}

module.exports = {
  dmAddBlacklist,
  dmRemoveBlacklist
}