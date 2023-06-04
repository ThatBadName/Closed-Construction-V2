const { EmbedBuilder } = require("discord.js")
const { colours, emojis } = require("../../../constants")
const { progressBar } = require('../../inventory')
const fs = require('fs')
const { abbreviateNumber } = require("../../main")

async function dailyQuestEmbed(interaction, client) {
  questDescription = '\n\n'

  questDescription += `**[Easy] ${fs.readFileSync(`./database/quests/daily/easy/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/daily/easy/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/daily/easy/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/easy/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/daily/easy/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/easy/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/daily/easy/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/easy/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[Medium] ${fs.readFileSync(`./database/quests/daily/medium/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/daily/medium/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/daily/medium/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/medium/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/daily/medium/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/medium/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/daily/medium/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/medium/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[Hard] ${fs.readFileSync(`./database/quests/daily/hard/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/daily/hard/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/daily/hard/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/hard/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/daily/hard/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/daily/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/daily/hard/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/daily/hard/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/daily/hard/collectAmount`, 'ascii')), 2)} \``
  
  const embed = new EmbedBuilder()
  .setTitle('Daily Quests')
  .setURL('https://google.com/')
  .setDescription(`Resets <t:${Math.round(Number(fs.readFileSync(`./database/quests/refresh/daily`, 'ascii')) / 1000)}:t> (<t:${Math.round(Number(fs.readFileSync(`./database/quests/refresh/daily`, 'ascii')) / 1000)}:R>)` + questDescription)
  .setColor(colours.blend)

  return embed
}

module.exports = {
  dailyQuestEmbed
}