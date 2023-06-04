const {
  SlashCommandBuilder
} = require('discord.js')
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fix-profiles')
    .setDescription('Fix any broken bot profiles (may take a while to complete)')
    .addStringOption(option =>
      option.setName('file-path')
      .setDescription('./database/users/{profile}/ is already filled')
      .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('content')
      .setDescription('The content of the file')
      .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('delete')
      .setDescription('Should I delete these files?')
      .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('edit')
      .setDescription('Should I edit these files?')
      .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('upsert')
      .setDescription('Should I upsert these files?')
      .setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.reply({
      content: 'Started fixing profiles'
    })
    const startDate = new Date()
    const del = interaction.options.getBoolean('delete') || false
    const profiles = fs.readdirSync(`./database/users`)
    const filePath = interaction.options.getString('file-path')
    for (const profile of profiles) {
      if (interaction.options.getBoolean('edit') === true || interaction.options.getBoolean('upsert') === true) {
        let path = filePath
        if (path.endsWith('/')) path.slice(0, -1)
        if (!fs.existsSync(`./database/users/${profile}/${filePath}`) && interaction.options.getBoolean('upsert') === false) continue
        fs.writeFileSync(`./database/users/${profile}/${filePath}`, `${interaction.options.getString('content')}`)
      } else if (!fs.existsSync(`./database/users/${profile}/${filePath}`)) {
        if (filePath.endsWith('/')) {
          if (del === false) fs.mkdirSync(`./database/users/${profile}/${filePath.slice(0, -1)}`)
          else fs.rmSync(`./database/users/${profile}/${filePath.slice(0, -1)}`)
        } else {
          if (del === false) fs.writeFileSync(`./database/users/${profile}/${filePath}`, `${interaction.options.getString('content')}`)
          else fs.rmSync(`./database/users/${profile}/${filePath}`)
        }
      } else {
        if (del === true) {
          if (filePath.endsWith('/')) {
            fs.rmSync(`./database/users/${profile}/${filePath.slice(0, -1)}`)
          } else {
            fs.rmSync(`./database/users/${profile}/${filePath}`)
          }
        }
      }
    }
    let finished = new Date() - startDate
    interaction.editReply({
      content: `Finished in \`${(finished/1000)}\` seconds`
    })
  }
}