const { SlashCommandBuilder } = require('discord.js')
const { settingEmbed, settingComponents } = require('../../botFunctions/settingsMenu/constants')

module.exports = {
  data: new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Manage your bot settings')
  .setDMPermission(false),

  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        settingEmbed('home')
      ],
      components: settingComponents(interaction.user.id, 'home')
    })
  }
}