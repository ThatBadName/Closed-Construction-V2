const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder
} = require('discord.js')
const {
  inventory,
  createPages
} = require('../../botFunctions/inventory')
const {
  createProfile
} = require('../../botFunctions/main')
const {
  colours,
  emojis
} = require('../../constants')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDMPermission(false)
    .setDescription('View a inventory')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('View another user\'s inventory')
      .setRequired(false)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user
    let inv = inventory(user.id)
    if (inv === null && user.id === interaction.user.id) {
      await createProfile(interaction)
      inv = [{
        name: "Starter Crate",
        id: "starter crate",
        emoji: emojis.starterCrate,
        amount: 1,
        type: "Crate"
      }]
    } else if (inv === null) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription(`${user} has an empty inventory`)
        .setColor(colours.blend)
      ],
      ephemeral: true,
      fetchReply: true
    })
    else if (inv.length === 0) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription(`${user} has an empty inventory`)
        .setColor(colours.blend)
      ],
      ephemeral: true,
      fetchReply: true
    })

    await interaction.deferReply()
    let pages = await createPages(inv, user.tag, user.id)
    let currentPage = 0
    const pageButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId('firstPage')
        .setEmoji('<:FirstPage:1011987981713817620>')
        .setDisabled(true)
        .setStyle('Primary'),

        new ButtonBuilder()
        .setCustomId('backPage')
        .setEmoji('<:PreviousPage:1011987986033938462>')
        .setDisabled(true)
        .setStyle('Primary'),

        new ButtonBuilder()
        .setCustomId('nextPage')
        .setEmoji('<:NextPage:1011987984385593415>')
        .setStyle('Primary'),

        new ButtonBuilder()
        .setCustomId('lastPage')
        .setEmoji('<:LastPage:1011987983060193290>')
        .setStyle('Primary'),
      )
    let firstEmbed
    if (pages.length === 1) {
      pageButtons.components[2].setDisabled(true)
      pageButtons.components[3].setDisabled(true)
    }
    firstEmbed = await interaction.editReply({
      embeds: [pages[0].setFooter({
        text: `Page ${currentPage + 1}/${pages.length}`
      })],
      components: [pageButtons],
      fetchReply: true
    }).catch(() => {})

    const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
      type: 'Button',
      time: 30000
    })

    pageButtonCollector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({
          embeds: [
            new EmbedBuilder()
            .setTitle('This is not for you')
            .setColor(colours.blend)
          ],
          ephemeral: true,
          fetchReply: true
        })
      if (i.customId === 'backPage') {
        if (currentPage !== 0) {
          --currentPage
          if (currentPage === 0) {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(true)
            pageButtons.components[1].setDisabled(true)
          } else {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
          }
          firstEmbed.edit({
            embeds: [pages[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${pages.length}`
            })],
            components: [pageButtons],
            fetchReply: true
          }).catch(() => {})
          i.deferUpdate()
          pageButtonCollector.resetTimer()
        } else i.reply({
          content: `There are no more pages`,
          ephemeral: true,
          fetchReply: true
        })
      } else if (i.customId === 'nextPage') {
        if (currentPage + 1 !== pages.length) {
          currentPage++
          if (currentPage + 1 === pages.length) {
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
            pageButtons.components[2].setDisabled(true)
            pageButtons.components[3].setDisabled(true)
          } else {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
          }
          firstEmbed.edit({
            embeds: [pages[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${pages.length}`
            })],
            components: [pageButtons],
            fetchReply: true
          }).catch(() => {})
          i.deferUpdate()
          pageButtonCollector.resetTimer()
        } else i.reply({
          content: `There are no more pages`,
          ephemeral: true,
          fetchReply: true
        })
      } else if (i.customId === 'lastPage') {
        if (currentPage + 1 !== pages.length) {
          currentPage = pages.length - 1
          if (currentPage + 1 === pages.length) {
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
            pageButtons.components[2].setDisabled(true)
            pageButtons.components[3].setDisabled(true)
          } else {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
          }
          firstEmbed.edit({
            embeds: [pages[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${pages.length}`
            })],
            components: [pageButtons],
            fetchReply: true
          }).catch(() => {})
          i.deferUpdate()
          pageButtonCollector.resetTimer()
        } else i.reply({
          content: `There are no more pages`,
          ephemeral: true,
          fetchReply: true
        })
      } else if (i.customId === 'firstPage') { //!
        if (currentPage !== 0) {
          currentPage = 0
          if (currentPage === 0) {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(true)
            pageButtons.components[1].setDisabled(true)
          } else {
            pageButtons.components[2].setDisabled(false)
            pageButtons.components[3].setDisabled(false)
            pageButtons.components[0].setDisabled(false)
            pageButtons.components[1].setDisabled(false)
          }
          firstEmbed.edit({
            embeds: [pages[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${pages.length}`
            })],
            components: [pageButtons],
            fetchReply: true
          }).catch(() => {})
          i.deferUpdate()
          pageButtonCollector.resetTimer()
        } else i.reply({
          content: `There are no more pages`,
          ephemeral: true,
        })
      }
    })
    pageButtonCollector.on('end', i => {
      pageButtons.components[0].setDisabled(true)
      pageButtons.components[1].setDisabled(true)
      pageButtons.components[2].setDisabled(true)
      pageButtons.components[3].setDisabled(true)
      firstEmbed.edit({
        components: [pageButtons],
        fetchReply: true
      }).catch(() => {})
    })
  }
}