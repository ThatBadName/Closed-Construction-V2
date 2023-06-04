const { EmbedBuilder } = require("discord.js")
const { colours, emojis } = require("../../../constants")
const { progressBar } = require('../../inventory')
const fs = require('fs')
const { abbreviateNumber } = require("../../main")

async function specialQuestEmbed(interaction, client) {
  questDescription = '\n\n'

  questDescription += `**[Global] ${fs.readFileSync(`./database/quests/global/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/global/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/global/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/global/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/global/amountComplete`) ? Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/global/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/global/amountComplete`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/global/amountComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/global/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[VIP] ${fs.readFileSync(`./database/quests/vip/0/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/vip/0/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/vip/0/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/vip/0/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/vip/0/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/vip/0/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/vip/0/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/vip/0/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/vip/0/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/vip/0/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/vip/0/collectAmount`, 'ascii')), 2)} \``
  questDescription += `\n\n**[VIP] ${fs.readFileSync(`./database/quests/vip/1/title`)}**\n${emojis.reply_cont}Reward: ${fs.readFileSync(`./database/quests/vip/1/reward`)}\n${emojis.reply_cont}${progressBar(fs.existsSync(`./database/quests/vip/1/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/vip/1/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/vip/1/collectAmount`, 'ascii')), 10).progressBar}\n${emojis.reply}\` ${progressBar(fs.existsSync(`./database/quests/vip/1/users/${interaction.user.id}`) ? Number(fs.readFileSync(`./database/quests/vip/1/users/${interaction.user.id}/rewardComplete`, 'ascii')) : 0, Number(fs.readFileSync(`./database/quests/vip/1/collectAmount`, 'ascii')), 5).percentageComplete} \` \` ${fs.existsSync(`./database/quests/vip/1/users/${interaction.user.id}`) ? abbreviateNumber(Number(fs.readFileSync(`./database/quests/vip/1/users/${interaction.user.id}/rewardComplete`, 'ascii')), 2) : 0} / ${abbreviateNumber(Number(fs.readFileSync(`./database/quests/vip/1/collectAmount`, 'ascii')), 2)} \``
  
  const embed = new EmbedBuilder()
  .setTitle('Special Quests')
  .setURL('https://google.com/')
  .setDescription(`You have completed \`0\` quests so far` + questDescription)
  .setColor(colours.blend)

  return embed
}

module.exports = {
  specialQuestEmbed
}