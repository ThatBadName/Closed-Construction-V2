const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const fs = require('fs')
const path = require('path')
const { permissionCheck } = require('../../botFunctions/blacklist/permissionCheck')
const { blacklistLog } = require('../../botFunctions/botManagement/blacklistLogs')
const {
  colours
} = require('../../constants')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage the bot blacklist')
    .addSubcommand(option =>
      option.setName('add')
      .setDescription('Add a user/guild to the blacklist')
      .addStringOption(option =>
        option.setName('id')
        .setDescription('The ID to add')
        .setMaxLength(20)
        .setMinLength(15)
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for this action')
        .setMinLength(3)
        .setMaxLength(250)
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('blacklist')
        .setDescription('What parts of the bot should I apply the blacklist to? a:all b:bot e:economy r:reports')
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('type')
        .setDescription('What does this ID belong to?')
        .setRequired(true)
        .addChoices({
          name: 'Guild',
          value: 'Guild'
        }, {
          name: 'User',
          value: 'User'
        })
      )
      .addStringOption(option =>
        option.setName('duration')
        .setDescription('The duration for the ban')
        .setRequired(false)
      )
    )
    .addSubcommand(option =>
      option.setName('remove')
      .setDescription('Remove a user/guild from the blacklist')
      .addStringOption(option =>
        option.setName('id')
        .setDescription('The ID to remove')
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('blacklist')
        .setDescription('What parts of the bot should I remove the blacklist from? a:all b:bot e:economy r:reports')
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('list')
      .setDescription('List everything on the blacklist (hopefully not too much :_)')
      .addStringOption(option =>
        option.setName('id')
        .setDescription('The ID to lookup')
        .setMaxLength(20)
      )
      .addStringOption(option =>
        option.setName('case')
        .setDescription('The case to lookup')
        .setMaxLength(40)
      )
    ),

  async execute(interaction, client) {
    if (permissionCheck(interaction.user.id, 3) === true) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.error)
        .setDescription('You cannot do this')
      ],
      ephemeral: true
    })
    const subcommand = interaction.options.getSubcommand()
    await interaction.deferReply()
    if (subcommand === 'list') {
      const searchId = interaction.options.getString('id')
      const searchCase = interaction.options.getString('case')
      if (searchCase) {
        const pages = await createAchivePages(lookupCase(searchCase))
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
        } else if (pages.length === 0) return interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setDescription('Such empty')
            .setColor(colours.blend)
          ]
        })
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
      } else if (searchId) {
        const pages = await createAchivePages(lookupId(searchId))
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
        } else if (pages.length === 0) return interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setDescription('Such empty')
            .setColor(colours.blend)
          ]
        })
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
      } else {
        const pages = await createPages(blacklistArr())
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
        } else if (pages.length === 0) return interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setDescription('The blacklist is somehow empty')
            .setFooter({text: `I am not searching from the archives. If you want to look at the archives, provide a search query`})
            .setColor(colours.blend)
          ]
        })
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
    } else if (subcommand === 'add') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      if (fs.existsSync(`./database/blacklist/${interaction.options.getString('id')}`)) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('This ID is already on the blacklist')
          .setColor(colours.blend)
        ]
      })
      const replaceChar = (str, arr = ['a', 'b', 'e', 'r'], char = '') => {
        const replacedString = str.split("").map(word => {
          return arr.includes(word) ? word : char;
        }).join("");
        return replacedString;
      }
      let blacklist = replaceChar(interaction.options.getString('blacklist'))
      if (blacklist.length === 0) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('You must put valid blacklist types, do not seperate them. EG: \`er\` would blacklist from economy and reports\n\n**a**:everything\n**b**:bot\n**e**:economy\n**r**:reports')
          .setColor(colours.blend)
        ]
      })
      const id = interaction.options.getString('id').replaceAll(' ', '')
      const reason = interaction.options.getString('reason')
      const duration = interaction.options.getString('duration') || 'never'
      const type = interaction.options.getString('type')
      const msg = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`You are about to blacklist ${id} (${type}) and it will expire in ${duration} for ${reason}\n\n` +
            `They will be blacklisted from:\n${blacklist.includes('a') ? '- Everything' : `${blacklist.includes('b') ? '- Bot\n' : ''} ${blacklist.includes('e') ? '- Economy\n' : ''} ${blacklist.includes('r') ? '- Reports' : ''}`}`
          )
          .setColor(colours.blend)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('blacklist-confirm')
            .setLabel('Confirm')
            .setStyle('Success'),

            new ButtonBuilder()
            .setCustomId('blacklist-cancel')
            .setLabel('Never mind')
            .setStyle('Danger')
          )
        ]
      })

      const collector = await msg.createMessageComponentCollector({
        type: 'Button',
        time: 30000
      })
      let collected = false
      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) return i.reply({
          embeds: [
            new EmbedBuilder()
            .setDescription('This is not for you')
            .setColor(colours.error)
          ],
          ephemeral: true
        })
        collected = true
        if (i.customId === 'blacklist-cancel') {
          collected = true
          collector.stop()
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription('Operation Canceled')
              .setColor(colours.blend)
            ],
            components: []
          })
        } else {
          if (fs.existsSync(`./database/blacklist/${interaction.options.getString('id')}`)) return interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription('This ID is already on the blacklist. Don\'t try and trick me')
              .setColor(colours.blend)
            ],
            components: []
          })
          const caseID = Math.floor(Math.round(new Date().getTime() / 1000))
          if (duration === 'never') {
            fs.mkdirSync(`./database/blacklist/${id}`, (() => {}))
            fs.writeFileSync(`./database/blacklist/${id}/caseId`, `${Math.floor(Math.round(new Date().getTime() / 1000))}`)
            fs.writeFileSync(`./database/blacklist/${id}/reason`, `${reason}`)
            fs.writeFileSync(`./database/blacklist/${id}/staff`, `${interaction.user.id}`)
            fs.writeFileSync(`./database/blacklist/${id}/type`, `${type}`)
            fs.writeFileSync(`./database/blacklist/${id}/expires`, `${duration}`)
            fs.writeFileSync(`./database/blacklist/${id}/botBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/id`, `${id}`)
            if (blacklist.includes('a')) {
              fs.writeFileSync(`./database/blacklist/${id}/botBan`, `yes`)
              fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `yes`)
              fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `yes`)
            } else {
              if (blacklist.includes('b')) {
                fs.writeFileSync(`./database/blacklist/${id}/botBan`, `yes`)
              }
              if (blacklist.includes('e')) {
                fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `yes`)
              }
              if (blacklist.includes('r')) {
                fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `yes`)
              }
            }

            fs.mkdirSync(`./database/blacklistArchive/${id}-${caseID}`, (() => {}))
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/caseId`, `${caseID}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reason`, `${reason}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/staff`, `${interaction.user.id}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/type`, `${type}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/expires`, `never`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/date`, `${caseID}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/id`, `${id}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/duration`, `Eternal`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/active`, `yes`)
            if (blacklist.includes('a')) {
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `yes`)
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `yes`)
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `yes`)
            } else {
              if (blacklist.includes('b')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `yes`)
              }
              if (blacklist.includes('e')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `yes`)
              }
              if (blacklist.includes('r')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `yes`)
              }
            }
            interaction.editReply({
              components: [],
              embeds: [
                new EmbedBuilder()
                .setTitle(`${type} added to the blacklist`)
                .setColor(colours.blend)
                .setDescription(
                  `ID: ${id}\nCase: ${caseID}\nBlacklists:\n${blacklist.includes('a') ? '- Everything\n' : `${blacklist.includes('b') ? '- Bot\n' : ''} ${blacklist.includes('e') ? '- Economy\n' : ''} ${blacklist.includes('r') ? '- Reports\n' : ''}`}` +
                  `This blacklist will never expire\nReason: ${reason}`
                )
              ]
            })
            await blacklistLog(interaction, id, 'never', reason, caseID, blacklist, type, client, 'add')
          } else {
            const args = duration.split(' ')
            let totalMins = 0
            for (const arg of args) {
              if (arg.endsWith('m')) totalMins += parseInt(arg)
              else if (arg.endsWith('h')) totalMins += parseInt(arg) * 60
              else if (arg.endsWith('d')) totalMins += parseInt(arg) * 60 * 24
              else if (arg.endsWith('mo')) totalMins += parseInt(arg) * 60 * 24 * 30
              else if (arg.endsWith('y')) totalMins += parseInt(arg) * 60 * 24 * 30 * 12
            }
            const caseID = Math.floor(Math.round(new Date().getTime() / 1000))

            if (totalMins > 5259492) totalMins = 5259492 //10 years in mins
            if (totalMins === 0) totalMins = 60
            const date = new Date()
            const expires = date.setMinutes(date.getMinutes() + totalMins)
            fs.mkdirSync(`./database/blacklist/${id}`, (() => {}))
            fs.writeFileSync(`./database/blacklist/${id}/caseId`, `${caseID}`)
            fs.writeFileSync(`./database/blacklist/${id}/reason`, `${reason}`)
            fs.writeFileSync(`./database/blacklist/${id}/staff`, `${interaction.user.id}`)
            fs.writeFileSync(`./database/blacklist/${id}/type`, `${type}`)
            fs.writeFileSync(`./database/blacklist/${id}/expires`, `${expires}`)
            fs.writeFileSync(`./database/blacklist/${id}/botBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `no`)
            fs.writeFileSync(`./database/blacklist/${id}/id`, `${id}`)
            if (blacklist.includes('a')) {
              fs.writeFileSync(`./database/blacklist/${id}/botBan`, `yes`)
              fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `yes`)
              fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `yes`)
            } else {
              if (blacklist.includes('b')) {
                fs.writeFileSync(`./database/blacklist/${id}/botBan`, `yes`)
              }
              if (blacklist.includes('e')) {
                fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, `yes`)
              }
              if (blacklist.includes('r')) {
                fs.writeFileSync(`./database/blacklist/${id}/reportBan`, `yes`)
              }
            }

            fs.mkdirSync(`./database/blacklistArchive/${id}-${caseID}`, (() => {}))
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/caseId`, `${caseID}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reason`, `${reason}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/staff`, `${interaction.user.id}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/type`, `${type}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/expires`, `${expires}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `no`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/date`, `${caseID}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/id`, `${id}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/duration`, `${duration}`)
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/active`, `yes`)
            if (blacklist.includes('a')) {
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `yes`)
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `yes`)
              fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `yes`)
            } else {
              if (blacklist.includes('b')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/botBan`, `yes`)
              }
              if (blacklist.includes('e')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/ecoBan`, `yes`)
              }
              if (blacklist.includes('r')) {
                fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reportBan`, `yes`)
              }
            }
            interaction.editReply({
              components: [],
              embeds: [
                new EmbedBuilder()
                .setTitle(`${type} added to the blacklist`)
                .setColor(colours.blend)
                .setDescription(
                  `ID: ${id}\nCase: ${caseID}\nBlacklists:\n${blacklist.includes('a') ? '- Everything\n' : `${blacklist.includes('b') ? '- Bot\n' : ''} ${blacklist.includes('e') ? '- Economy\n' : ''} ${blacklist.includes('r') ? '- Reports\n' : ''}`}` +
                  `Expires: <t:${Math.floor(Math.round(expires / 1000))}> (<t:${Math.floor(Math.round(expires / 1000))}:R>)\nReason: ${reason}`
                  )
                ]
              })
            await blacklistLog(interaction, id, expires, reason, caseID, blacklist, type, client, 'add')
          }
        }
      })
      collector.on('end', () => {
        if (collected === true) return
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setDescription('Timed Out. Please run the command again')
            .setColor(colours.blend)
          ],
          components: []
        })
      })
    } else if (subcommand === 'remove') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      const replaceChar = (str, arr = ['a', 'b', 'e', 'r'], char = '') => {
        const replacedString = str.split("").map(word => {
          return arr.includes(word) ? word : char;
        }).join("");
        return replacedString;
      }
      let blacklist = replaceChar(interaction.options.getString('blacklist'))
      if (blacklist.length === 0) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('You must put valid blacklist types, do not seperate them. EG: \`er\` would blacklist from economy and reports\n\n**a**:everything\n**b**:bot\n**e**:economy\n**r**:reports')
          .setColor(colours.blend)
        ]
      })
      const id = interaction.options.getString('id').replaceAll(' ', '')
      if (!fs.existsSync(`./database/blacklist/${interaction.options.getString('id')}`)) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('This ID is not on the blacklist')
          .setColor(colours.blend)
        ]
      })
      const msg = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`You are about to unblacklist ${id} (${fs.readFileSync(`./database/blacklist/${id}/type`)})\n\n` +
            `They will be unblacklisted from:\n${blacklist.includes('a') ? '- Everything' : `${blacklist.includes('b') ? '- Bot\n' : ''} ${blacklist.includes('e') ? '- Economy\n' : ''} ${blacklist.includes('r') ? '- Reports' : ''}`}`
          )
          .setColor(colours.blend)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('blacklist-confirm')
            .setLabel('Confirm')
            .setStyle('Success'),

            new ButtonBuilder()
            .setCustomId('blacklist-cancel')
            .setLabel('Never mind')
            .setStyle('Danger')
          )
        ]
      })


      const collector = await msg.createMessageComponentCollector({
        type: 'Button',
        time: 30000
      })
      let collected = false
      collector.on('end', (() => {
        if (collected === true) return
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription('Timed out')
          ],
          components: []
        })
      }))
      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) return i.reply({
          embeds: [
            new EmbedBuilder()
            .setDescription('This is not for you')
            .setColor(colours.error)
          ],
          ephemeral: true
        })
        collected = true
        if (i.customId === 'blacklist-cancel') {
          collected = true
          collector.stop()
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription('Operation Canceled')
              .setColor(colours.blend)
            ],
            components: []
          })
        } else {
          if (!fs.existsSync(`./database/blacklist/${interaction.options.getString('id')}`)) return interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription('This ID is not on the blacklist - Can you not try to trick me next time :)')
              .setColor(colours.blend)
            ]
          })
          const caseID = fs.readFileSync(`./database/blacklist/${id}/caseId`, 'ascii')
          const type = fs.readFileSync(`./database/blacklist/${id}/type`, 'ascii')
          fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/reason`, `${fs.readFileSync(`./database/blacklist/${id}/reason`, 'ascii')}\n\n*This blacklist (${blacklist}) was removed by ${interaction.user.id}`)
          fs.writeFileSync(`./database/blacklist/${id}/reason`, `${fs.readFileSync(`./database/blacklist/${id}/reason`, 'ascii')}\n\n*This blacklist (${blacklist}) was removed by ${interaction.user.id}`)
          const reason = fs.readFileSync(`./database/blacklist/${id}/reason`, 'ascii')
          let all = false
          let bot = false
          let economy = false
          let reports = false

          if (blacklist.includes('a')) {
            fs.rm(`./database/blacklist/${id}`, {
              recursive: true
            }, () => {})
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/active`, 'no')
            all = true
          } else {
            if (blacklist.includes('b')) {
              fs.writeFileSync(`./database/blacklist/${id}/botBan`, 'no')
              bot = true
            }
            if (blacklist.includes('e')) {
              fs.writeFileSync(`./database/blacklist/${id}/ecoBan`, 'no')
              economy = true
            }
            if (blacklist.includes('r')) {
              fs.writeFileSync(`./database/blacklist/${id}/reportBan`, 'no')
              reports = true
            }
          }
          if (fs.existsSync(`./database/blacklist/${id}`)) {
            if (fs.readFileSync(`./database/blacklist/${id}/botBan`, 'ascii') === 'no') bot = true
            if (fs.readFileSync(`./database/blacklist/${id}/ecoBan`, 'ascii') === 'no') economy = true
            if (fs.readFileSync(`./database/blacklist/${id}/reportBan`, 'ascii') === 'no') reports = true
          }
          if (bot === true && economy === true && reports === true) all = true
          if (all === true) {
            fs.rm(`./database/blacklist/${id}`, {
              recursive: true
            }, () => {})
            fs.writeFileSync(`./database/blacklistArchive/${id}-${caseID}/active`, 'no')
            blacklist = 'a'
          }
          await blacklistLog(interaction, id, null, reason, caseID, blacklist, type, client, 'remove', all === true ? 'No' : 'Yes')
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setTitle('Updated blacklist')
              .setColor(colours.blend)
              .setDescription(`${id} (Case: ${caseID}) has been removed from the following blacklist(s):\n${blacklist.includes('a') ? '- Everything' : `${blacklist.includes('b') ? '- Bot\n' : ''} ${blacklist.includes('e') ? '- Economy\n' : ''} ${blacklist.includes('r') ? '- Reports' : ''}`}`)
            ],
            components: []
          })
        }
      })
    }
  }
}

function blacklistArr() {
  let arr = []

  if (!fs.existsSync(`./database/blacklist`)) return null
  const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter((file) => fs.lstatSync(path.join(dir, file)).isDirectory())
      .map((file) => ({
        file,
        mtime: fs.lstatSync(path.join(dir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  };
  let caseFolders = orderReccentFiles(`./database/blacklist`)
  for (const folder of caseFolders) {
    if (!fs.existsSync(`./database/blacklist/${folder.file}`)) return null

    const id = fs.readFileSync(`./database/blacklist/${folder.file}/id`, 'ascii')
    const caseId = fs.readFileSync(`./database/blacklist/${folder.file}/caseId`, 'ascii')
    const reason = fs.readFileSync(`./database/blacklist/${folder.file}/reason`, 'ascii')
    const botBan = fs.readFileSync(`./database/blacklist/${folder.file}/botBan`, 'ascii')
    const ecoBan = fs.readFileSync(`./database/blacklist/${folder.file}/ecoBan`, 'ascii')
    const reportBan = fs.readFileSync(`./database/blacklist/${folder.file}/reportBan`, 'ascii')
    const expires = fs.readFileSync(`./database/blacklist/${folder.file}/expires`, 'ascii')
    const staff = fs.readFileSync(`./database/blacklist/${folder.file}/staff`, 'ascii')
    const type = fs.readFileSync(`./database/blacklist/${folder.file}/type`, 'ascii')

    arr.push({
      id,
      caseId,
      reason,
      botBan,
      ecoBan,
      reportBan,
      expires,
      staff,
      type
    })
  }
  return arr
}

async function createPages(arr) {
  const embeds = []
  let k = 8
  for (let i = 0; i < arr.length; i += 8) {
    const current = arr.slice(i, k)
    let j = i
    k += 8
    let info = ``
    info = current.map(item => `[Case: ${item.caseId} | ${item.type}] ${item.id}`).join('\n')
    const embed = new EmbedBuilder()
      .setColor(colours.blend)
      .setTitle(`Blacklist`)
      .setDescription(info)
    embeds.push(embed)
  }
  return embeds
}

function lookupId(searchId) {
  let arr = []

  if (!fs.existsSync(`./database/blacklistArchive`)) return null
  const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter((file) => fs.lstatSync(path.join(dir, file)).isDirectory())
      .map((file) => ({
        file,
        mtime: fs.lstatSync(path.join(dir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  };
  let caseFolders = orderReccentFiles(`./database/blacklistArchive`)
  for (const folder of caseFolders) {
    if (!fs.existsSync(`./database/blacklistArchive/${folder.file}`)) return null
    const id = fs.readFileSync(`./database/blacklistArchive/${folder.file}/id`, 'ascii')
    if (id !== searchId) continue
    const caseId = fs.readFileSync(`./database/blacklistArchive/${folder.file}/caseId`, 'ascii')
    const reason = fs.readFileSync(`./database/blacklistArchive/${folder.file}/reason`, 'ascii')
    const botBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/botBan`, 'ascii')
    const ecoBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/ecoBan`, 'ascii')
    const reportBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/reportBan`, 'ascii')
    const expires = fs.readFileSync(`./database/blacklistArchive/${folder.file}/expires`, 'ascii')
    const staff = fs.readFileSync(`./database/blacklistArchive/${folder.file}/staff`, 'ascii')
    const type = fs.readFileSync(`./database/blacklistArchive/${folder.file}/type`, 'ascii')
    const duration = fs.readFileSync(`./database/blacklistArchive/${folder.file}/duration`, 'ascii')
    const date = fs.readFileSync(`./database/blacklistArchive/${folder.file}/date`, 'ascii')
    const active = fs.readFileSync(`./database/blacklistArchive/${folder.file}/active`, 'ascii')

    arr.push({
      id,
      caseId,
      reason,
      botBan,
      ecoBan,
      reportBan,
      expires,
      staff,
      type,
      duration,
      date,
      active
    })
  }
  return arr
}

function lookupCase(searchId) {
  let arr = []

  if (!fs.existsSync(`./database/blacklistArchive`)) return null
  const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter((file) => fs.lstatSync(path.join(dir, file)).isDirectory())
      .map((file) => ({
        file,
        mtime: fs.lstatSync(path.join(dir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  };
  let caseFolders = orderReccentFiles(`./database/blacklistArchive`)
  for (const folder of caseFolders) {
    if (!fs.existsSync(`./database/blacklistArchive/${folder.file}`)) return null
    const caseId = fs.readFileSync(`./database/blacklistArchive/${folder.file}/caseId`, 'ascii')
    if (caseId !== searchId) continue
    const id = fs.readFileSync(`./database/blacklistArchive/${folder.file}/id`, 'ascii')
    const reason = fs.readFileSync(`./database/blacklistArchive/${folder.file}/reason`, 'ascii')
    const botBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/botBan`, 'ascii')
    const ecoBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/ecoBan`, 'ascii')
    const reportBan = fs.readFileSync(`./database/blacklistArchive/${folder.file}/reportBan`, 'ascii')
    const expires = fs.readFileSync(`./database/blacklistArchive/${folder.file}/expires`, 'ascii')
    const staff = fs.readFileSync(`./database/blacklistArchive/${folder.file}/staff`, 'ascii')
    const type = fs.readFileSync(`./database/blacklistArchive/${folder.file}/type`, 'ascii')
    const duration = fs.readFileSync(`./database/blacklistArchive/${folder.file}/duration`, 'ascii')
    const date = fs.readFileSync(`./database/blacklistArchive/${folder.file}/date`, 'ascii')
    const active = fs.readFileSync(`./database/blacklistArchive/${folder.file}/active`, 'ascii')

    arr.push({
      id,
      caseId,
      reason,
      botBan,
      ecoBan,
      reportBan,
      expires,
      staff,
      type,
      duration,
      date,
      active
    })
  }
  return arr
}

async function createAchivePages(arr) {
  const embeds = []
  let k = 4
  for (let i = 0; i < arr.length; i += 8) {
    const current = arr.slice(i, k)
    let j = i
    k += 4
    let info = ``
    info = current.map(item => `[Case: ${item.caseId} - ${item.type} ${item.id}]\nDate: <t:${item.date}> (<t:${item.date}:R>)\nDuration: ${item.duration}\nExpires: <t:${Math.floor(Math.round(item.expires / 1000))}> (<t:${Math.floor(Math.round(item.expires / 1000))}:R>)\n` +
      `Active: ${item.active}\nStaff: ${item.staff}\nBanned From:\n${item.botBan === 'yes' ? '- Bot\n' : ''} ${item.ecoBan === 'yes' ? '- Economy\n' : ''} ${item.reportBan === 'yes' ? '- Reports\n' : ''}Reason: ${item.reason}`
    ).join('\n\n')
    const embed = new EmbedBuilder()
      .setColor(colours.blend)
      .setTitle(`Blacklist Archive`)
      .setDescription(info)
    embeds.push(embed)
  }
  return embeds
}