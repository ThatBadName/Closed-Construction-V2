const {
  colours,
  cooldownImmunity,
  commandCooldownTexts
} = require('../../constants')
const Discord = require('discord.js')
const cooldowns = new Discord.Collection()
const fs = require('fs')
const {
  createProfile
} = require('../main')

/**
 * ! staff = bypass all
 * ! all = bypass all if no override
 * ! x% = reduce by x %
 * ! xs = reduce by x seconds
 */

async function cooldown(timeout, interaction, override, command) {
  let commandName
  if (!command) commandName = interaction.commandName
  else commandName = command
  if (cooldownImmunity.includes(interaction.user.id)) return false
  if (!fs.existsSync(`./database/users/${interaction.user.id}`)) createProfile(interaction)
  const cooldownRemove = fs.readFileSync(`./database/users/${interaction.user.id}/admin/cooldownImmunity`, 'ascii')
  if (!override) override = true
  if (cooldownRemove === 'staff') return false
  if (override === true) {
    if (cooldownRemove === 'all') return false
    else if (cooldownRemove.includes('%')) {
      let reduction = parseInt(cooldownRemove.replaceAll('%', ''))
      let sub = Math.round((reduction / 100) * timeout)
      timeout = timeout - sub
    } else if (cooldownRemove.includes('s')) {
      let reduction = parseInt(cooldownRemove.replaceAll('s', ''))
      timeout = timeout - reduction
      if (timeout <= 0) return false
    }
  }
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Discord.Collection())
  }

  const current_time = Date.now()
  const time_stamps = cooldowns.get(commandName)
  const cooldown_amount = (timeout) * 1000

  if (time_stamps.has(interaction.user.id)) {
    const expiration_time = time_stamps.get(interaction.user.id) + cooldown_amount

    if (current_time < expiration_time) {
      const time_left = (expiration_time - current_time) / 1000

      seconds = Number(time_left)
      var d = Math.floor(time_left / (3600 * 24))
      var h = Math.floor(time_left % (3600 * 24) / 3600)
      var m = Math.floor(time_left % 3600 / 60)
      var s = Math.floor(time_left % 60)

      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
      if (dDisplay.length === 0 && hDisplay.length === 0 && mDisplay.length === 0 && sDisplay.length === 0) return false

      if (commandCooldownTexts.find(element => element.commandName === commandName.toLowerCase())) {
        const text = commandCooldownTexts[commandCooldownTexts.findIndex(element => element.commandName === commandName.toLowerCase())]
        interaction.reply({
          embeds: [
            new Discord.EmbedBuilder()
            .setColor(text.colour)
            .setDescription(text.body.replaceAll('{timeAll}', `${dDisplay + hDisplay + mDisplay + sDisplay}`).replaceAll('{timeD}', `${dDisplay}`).replaceAll('{timeH}', `${hDisplay}`).replaceAll('{timeM}', `${mDisplay}`).replaceAll('{timeS}', `${sDisplay}`))
            .setTitle(text.title.length <= 0 ? null : text.title)
          ],
          ephemeral: true
        }).catch(() => {
          interaction.followUp({
            embeds: [
              new Discord.EmbedBuilder()
              .setColor(text.colour)
              .setDescription(text.body.replaceAll('{timeAll}', `${dDisplay + hDisplay + mDisplay + sDisplay}`).replaceAll('{timeD}', `${dDisplay}`).replaceAll('{timeH}', `${hDisplay}`).replaceAll('{timeM}', `${mDisplay}`).replaceAll('{timeS}', `${sDisplay}`))
              .setTitle(text.title.length <= 0 ? null : text.title)
            ],
            ephemeral: true
          }).catch(() => {
            interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                .setColor(text.colour)
                .setDescription(text.body.replaceAll('{timeAll}', `${dDisplay + hDisplay + mDisplay + sDisplay}`).replaceAll('{timeD}', `${dDisplay}`).replaceAll('{timeH}', `${hDisplay}`).replaceAll('{timeM}', `${mDisplay}`).replaceAll('{timeS}', `${sDisplay}`))
                .setTitle(text.title.length <= 0 ? null : text.title)
              ],
            })
          })
        })
      } else {
        interaction.reply({
          embeds: [
            new Discord.EmbedBuilder()
            .setColor('0x' + colours.blend)
            .setDescription(`You must wait ${dDisplay + hDisplay + mDisplay + sDisplay} before using this again`)
          ],
          ephemeral: true
        }).catch(() => {
          interaction.followUp({
            embeds: [
              new Discord.EmbedBuilder()
              .setColor('0x' + colours.blend)
              .setDescription(`You must wait ${dDisplay + hDisplay + mDisplay + sDisplay} before using this again`)
            ],
            ephemeral: true
          }).catch(() => {
            interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                .setColor('0x' + colours.blend)
                .setDescription(`You must wait ${dDisplay + hDisplay + mDisplay + sDisplay} before using this again`)
              ],
            })
          })
        })
      }
      return true
    }
  }

  time_stamps.set(interaction.user.id, current_time)
  setTimeout(() => time_stamps.delete(interaction.user.id), cooldown_amount)
}

module.exports = {
  cooldown
}