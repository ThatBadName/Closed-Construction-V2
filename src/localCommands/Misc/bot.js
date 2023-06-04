const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder
} = require('discord.js')
const {
  createStaffProfileEmbed,
  viewStaffProfile
} = require('../../botFunctions/botManagement/profile')
const {
  addItem,
  removeItem,
  addCoins,
  removeCoins,
  addXp,
  setXp,
  setLevel,
  setRequiredXp
} = require('../../botFunctions/inventory')
const {
  permissionCheck
} = require('../../botFunctions/blacklist/permissionCheck')
const {
  colours
} = require('../../constants')
const itemList = require('../../items/itemList')
const fs = require('fs')
const path = require('path')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
    .setDMPermission(false)
    .setDescription('Manage the bot')
    .addSubcommand(option =>
      option.setName('view')
      .setDescription('View a users profile')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user to lookup')
        .setRequired(true)
        .setMaxLength(19)
        .setMinLength(10)
      )
    )
    .addSubcommand(option =>
      option.setName('check_commands')
      .setDescription('Check a users most recent 250 commands')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addStringOption(option =>
        option.setName('command')
        .setDescription('The name of the command')
        .setMaxLength(25)
        .setMinLength(1)
        .setRequired(false)
      )
    )
    .addSubcommand(option =>
      option.setName('add_item')
      .setDescription('Add an item to a users inventory')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addStringOption(option =>
        option.setName('item_id')
        .setDescription('The ID of the item to give')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
        .setAutocomplete(true)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of the item to add')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('remove_item')
      .setDescription('Remove an item from a users inventory')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addStringOption(option =>
        option.setName('item_id')
        .setDescription('The ID of the item to remove')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
        .setAutocomplete(true)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of the item to remove')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('add_coins')
      .setDescription('Add coins to a user')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of coins to add')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('remove_coins')
      .setDescription('Add coins to a user')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of coins to remove')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('add_xp')
      .setDescription('Add xp to a user')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of xp to add')
        .setMinValue(1)
        .setMaxValue(1000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('set_xp')
      .setDescription('Set a users xp')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of xp to set')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('set_level')
      .setDescription('Set a users level')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of levels to set')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    )
    .addSubcommand(option =>
      option.setName('set_required_xp')
      .setDescription('Set a users required xp')
      .addStringOption(option =>
        option.setName('user_id')
        .setDescription('The ID of the user')
        .setRequired(true)
        .setMaxLength(25)
        .setMinLength(1)
      )
      .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('The amount of xp to set')
        .setMinValue(1)
        .setMaxValue(1000000000)
        .setRequired(true)
      )
    ),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)

    if (focusedOption.name === 'item_id') {
      const focusedValue = interaction.options.getFocused()
      const choices = itemList.map(i => `${i.name},${i.id}`).sort()
      const filtered = choices.filter((choice) =>
        choice.includes(focusedValue)
      ).slice(0, 25)
      await interaction.respond(
        filtered.map((choice) => ({
          name: choice.split(',')[0],
          value: choice.split(',')[1]
        }))
      )
    }
  },

  async execute(
    interaction,
    client
  ) {
    if (permissionCheck(interaction.user.id, 3) === true) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.error)
        .setDescription('You cannot do this')
      ],
      ephemeral: true
    })
    let subcommand = interaction.options.getSubcommand()

    if (subcommand === 'view') {
      const obj = viewStaffProfile(interaction.options.getString('user_id'), interaction)
      if (createStaffProfileEmbed(obj, interaction) === null) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder().setColor(colours.blend).setTitle(`[Staff View] No profile found`)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`create-${interaction.options.getString('user_id')}`)
              .setLabel('Create Profile')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`ecoBan-${interaction.options.getString('user_id')}`)
              .setLabel('Economy Ban user')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`botBan-${interaction.options.getString('user_id')}`)
              .setLabel('Bot Ban user')
              .setStyle('Secondary')
            )
          ]
        })
      }
      interaction.reply({
        embeds: [
          createStaffProfileEmbed(obj, interaction)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`wipe-${interaction.options.getString('user_id')}`)
            .setLabel('Wipe user')
            .setStyle('Secondary'),

            new ButtonBuilder()
            .setCustomId(`delete-${interaction.options.getString('user_id')}`)
            .setLabel('Delete user')
            .setStyle('Secondary')
          )
        ]
      })
    } else if (subcommand === 'add_item') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      let itemQuery = interaction.options.getString('item_id')
      itemQuery = itemQuery.toLowerCase()

      const search = !!itemList.find((value) => value.id === itemQuery)
      if (!search) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('I could not find that item')
          .setColor('0x' + colours.error)
        ],
        ephemeral: true
      })
      const itemFound = itemList.find((value) => value.id === itemQuery)
      await addItem(itemFound.id, interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${interaction.options.getInteger('amount').toLocaleString()}x ${itemFound.emoji}${itemFound.name} added to \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>)`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'remove_item') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      let itemQuery = interaction.options.getString('item_id')
      itemQuery = itemQuery.toLowerCase()

      const search = !!itemList.find((value) => value.id === itemQuery)
      if (!search) return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('I could not find that item')
          .setColor('0x' + colours.error)
        ],
        ephemeral: true
      })
      const itemFound = itemList.find((value) => value.id === itemQuery)
      removeItem(itemFound.fileId, interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${interaction.options.getInteger('amount').toLocaleString()}x ${itemFound.emoji}${itemFound.name} removed from \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>)`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'add_coins') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      await addCoins(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${interaction.options.getInteger('amount').toLocaleString()}x coins added to \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>)`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'remove_coins') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      removeCoins(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${interaction.options.getInteger('amount').toLocaleString()}x coins removed from \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>)`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'add_xp') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      addXp(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${interaction.options.getInteger('amount').toLocaleString()}x xp added to \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>)`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'set_xp') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      setXp(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`Set \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>) to ${interaction.options.getInteger('amount').toLocaleString()} xp`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'set_level') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      setLevel(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`Set \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>) to ${interaction.options.getInteger('amount').toLocaleString()} levels`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'set_required_xp') {
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      setRequiredXp(interaction.options.getInteger('amount'), interaction.options.getString('user_id'), client)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`Set \`${interaction.options.getString('user_id')}\` (<@${interaction.options.getString('user_id')}>) to ${interaction.options.getInteger('amount').toLocaleString()} required xp`)
          .setColor(colours.blend)
        ]
      })
    } else if (subcommand === 'check_commands') {
      let userId = interaction.options.getString('user_id')
      let commands = interaction.options.getString('command') || 'all'
      commands = commands.toLowerCase()
      if (!fs.existsSync(`./database/commands/logs/${userId}`)) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`${userId} does not have any recent commands`)
        ],
        ephemeral: true
      })
      if (fs.readdirSync(`./database/commands/logs/${userId}`).length <= 0) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`${userId} does not have any recent commands`)
        ],
        ephemeral: true
      })
      const items = getItems(userId, commands)
      if (items.length <= 0) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`${userId} does not have any recent commands`)
        ],
        ephemeral: true
      })
      const pages = await createPages(items, userId, commands)
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
      if (pages.length === 1) {
        pageButtons.components[2].setDisabled(true)
        pageButtons.components[3].setDisabled(true)
      }
      const firstEmbed = await interaction.reply({
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
              .setDescription('This is not for you')
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
            interaction.editReply({
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
            interaction.editReply({
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
            interaction.editReply({
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
            interaction.editReply({
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
}

function getItems(userId, commands) {
  let items = []
  const folders = orderReccentFiles(`./database/commands/logs/${userId}`)
  for (const folder of folders) {
    let command = fs.readFileSync(`./database/commands/logs/${userId}/${folder.file}/command`, 'ascii')
    let information = fs.readFileSync(`./database/commands/logs/${userId}/${folder.file}/information`, 'ascii')
    let location = fs.readFileSync(`./database/commands/logs/${userId}/${folder.file}/location`, 'ascii')
    let created = fs.readFileSync(`./database/commands/logs/${userId}/${folder.file}/created`, 'ascii')
    if (commands !== 'all') {
      if (command.includes(commands)) items.push({
        command,
        information,
        location,
        created
      })
    } else items.push({
      command,
      information,
      location,
      created
    })
  }
  return items
}

const orderReccentFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isDirectory())
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

async function createPages(arr, id, commands) {
  const embeds = []
  let k = 5
  for (let i = 0; i < arr.length; i += 5) {
    const current = arr.slice(i, k)
    let j = i
    k += 5
    let info = ``
    info = current.map(item => `> ${item.command} [${item.information}]\n> **Location**: ${item.location}\n> **Command Ran**: <t:${Math.round(item.created / 1000)}>`).join('\n\n')
    const embed = new EmbedBuilder()
      .setColor(colours.blend)
      .setTitle(`${id}'s recent commands`)
      .setDescription(`Filtering commands by ${commands}\n\n` + info)
    embeds.push(embed)
  }
  return embeds
}