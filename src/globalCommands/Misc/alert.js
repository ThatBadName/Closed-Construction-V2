const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const { colours } = require("../../constants");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('alert')
  .setDMPermission(false)
  .setDescription('Read important messages from the developers'),

  async execute(interaction, client) {
    const alert = fs.readFileSync(`./database/bot/alert/newAlert`, 'ascii')
    const update = fs.readFileSync(`./database/bot/alert/newAlertTitle`, 'ascii')
    const read = fs.readFileSync(`./database/bot/alert/readUsers`, 'ascii')

    let readArr = read.split(',')
    let footer = ''
    if (readArr.includes(interaction.user.id)) footer = `You were #${(readArr.indexOf(interaction.user.id)).toLocaleString()} to read this`
    else {
      footer = `You are #${(readArr.length).toLocaleString()} to read this`
      readArr.push(`${interaction.user.id}`)
      fs.writeFileSync(`./database/bot/alert/readUsers`, `${readArr}`)
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setAuthor({name: update})
        .setDescription(alert)
        .setColor(colours.blend)
        .setFooter({text: footer})
      ]
    })
  }
}