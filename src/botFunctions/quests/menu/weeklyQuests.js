const { EmbedBuilder } = require("discord.js")
const { colours, emojis } = require("../../../constants")
const { progressBar } = require('../../inventory')
const fs = require('fs')
const { abbreviateNumber } = require("../../main")

async function weeklyQuestEmbed(interaction, client) {
  questDescription = '\n\n'

  questDescription += `**[Easy] ${fs.readFileSync(`./database/quests/weekly/easy/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/weekly/easy/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/weekly/easy/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/easy/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/weekly/easy/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/easy/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/weekly/easy/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/easy/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/easy/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[Medium] ${fs.readFileSync(`./database/quests/weekly/medium/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/weekly/medium/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/weekly/medium/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/medium/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/weekly/medium/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/medium/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/weekly/medium/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/medium/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/medium/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[Hard] ${fs.readFileSync(`./database/quests/weekly/hard/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/weekly/hard/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/weekly/hard/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/hard/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/weekly/hard/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/weekly/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/weekly/hard/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/weekly/hard/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/hard/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/weekly/hard/collectAmount`, 'ascii')), 2)} \``
  
  const embed = new EmbedBuilder()
  .setTitle('Weekly Quests')
  .setURL('https://google.com/')
  .setDescription(`Resets <t:${Math.round(Number(fs.readFileSync(`./database/quests/refresh/weekly`, 'ascii')) / 1000)}:t> (<t:${Math.round(Number(fs.readFileSync(`./database/quests/refresh/weekly`, 'ascii')) / 1000)}:R>)` + questDescription)
  .setColor(colours.blend)

  return embed
}

module.exports = {
  weeklyQuestEmbed
}