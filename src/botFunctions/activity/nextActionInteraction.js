const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder
} = require("discord.js")
const { cooldown } = require("../botManagement/cooldown")
const { getClosestCity } = require("../city/getClosestCities")
const {
  nextActivityAction
} = require("./action")
const {
  baseActivityEmbed
} = require("./constants")
const {
  scavangeActivity
} = require("./types/scavenge")
const fs = require('fs')
const { questCheck } = require("../quests/quest")
const { colours, emojis } = require("../../constants")

async function nextAction(interaction, client) {
    const buttonId = interaction.customId.replace('activity|', '')
    if (interaction.user.id !== buttonId) return interaction.deferUpdate()
    interaction.deferUpdate().catch(() => {})
    if (await cooldown(10, interaction, true, 'activity') === true) return
    const nextActivity = await nextActivityAction(interaction.user.id, interaction)
    const quest = questCheck('activity', interaction.user.id)
    if ((await quest).length >= 1) {
      interaction.message.reply({
        content: `${interaction.user}`,
        embeds: [
          new EmbedBuilder()
          .setTitle('Quest Completed!')
          .setColor(colours.blend)
          .setDescription((await quest).map(item => `**${item.questTitle}**\n${emojis.reply}You recieved: ${item.questReward}`).join('\n\n'))
        ]
      })
    }
    if (nextActivity === 'random') {
      const validActivities = ['scavenge']
      const randomActivity = validActivities[Math.floor(Math.random() * validActivities.length)]
      let description = 'error'
      if (randomActivity === 'scavenge') description = await scavangeActivity(interaction)
      baseActivityEmbed.setDescription(`${description}`)
      interaction.message.edit({
          embeds: [baseActivityEmbed],
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`view-cityMenu|${interaction.user.id}`)
              .setLabel('View')
              .setStyle('Secondary'),
              // main city overview

              new ButtonBuilder()
              .setCustomId(`edit-cityMenu|${interaction.user.id}`)
              .setLabel('Customise')
              .setStyle('Secondary'),
              // city name, icon?, bio

              new ButtonBuilder()
              .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
              .setLabel('Upgrades')
              .setStyle('Secondary'),
              // for city upgrades

              new ButtonBuilder()
              .setCustomId(`manage-cityMenu|${interaction.user.id}`)
              .setLabel('Manage')
              .setStyle('Secondary'),
              // For inv, build, bal

              new ButtonBuilder()
              .setCustomId(`activity|${interaction.user.id}`)
              .setLabel('Activity')
              .setStyle('Primary')
            )
            ]
          })
    }
    else if (nextActivity === 'radar') {
      const position = fs.readFileSync(`./database/users/${interaction.user.id}/city/position`, 'ascii')
      const radar = fs.readFileSync(`./database/users/${interaction.user.id}/city/radar`, 'ascii')
      let closestCities = await getClosestCity(interaction, interaction.user.id, Number(position), Number(radar) * 1000, 3)
      //interaction.channel.send({content: `Closest Cities:\n${closestCities.map(city => `${city.name} - ${city.id} - Distance: ${city.distance}`).join('\n')}`})
      if (closestCities.length === 0) {
        interaction.message.edit({
          embeds: [
            baseActivityEmbed.setDescription(`You activiated your radar and no other cities were in range`)
          ],
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`view-cityMenu|${interaction.user.id}`)
              .setLabel('View')
              .setStyle('Secondary'),
              // main city overview

              new ButtonBuilder()
              .setCustomId(`edit-cityMenu|${interaction.user.id}`)
              .setLabel('Customise')
              .setStyle('Secondary'),
              // city name, icon?, bio

              new ButtonBuilder()
              .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
              .setLabel('Upgrades')
              .setStyle('Secondary'),
              // for city upgrades

              new ButtonBuilder()
              .setCustomId(`manage-cityMenu|${interaction.user.id}`)
              .setLabel('Manage')
              .setStyle('Secondary'),
              // For inv, build, bal

              new ButtonBuilder()
              .setCustomId(`activity|${interaction.user.id}`)
              .setLabel('Activity')
              .setStyle('Primary')
            )
            ]
        })
      }
      else {
        let buttonArr = []
        for (const city of closestCities) {
          buttonArr.push(new ButtonBuilder().setCustomId(`hunt-${city.id}|${interaction.user.id}`).setLabel(`Hunt ${city.name}`).setStyle('Secondary'))
        }
        const cityButtons = new ActionRowBuilder().addComponents(buttonArr)
        interaction.message.edit({
          embeds: [
            baseActivityEmbed.setDescription(`Your radar scanned the surroundings and found **${closestCities.length}** cit${closestCities.length === 1 ? 'y' : 'ies'}:\n` +
              `${closestCities.map(city => `${city.name}`).join('\n')}`
            )
          ],
          components: [cityButtons, new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`activity|${interaction.user.id}`).setLabel('Ignore').setStyle('Danger'))]
        })
      }
    }
    else if (nextActivity === 'move') {

    }
    addShift(interaction.user.id)
  }

    function addShift(userId) {
      const fs = require('fs')

      fs.writeFileSync(`./database/users/${userId}/city/activity/shifts`, `${Number(fs.readFileSync(`./database/users/${userId}/city/activity/shifts`)) + 1}`)
    }

    module.exports = {
      nextAction
    }