const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js");
const {
  colours,
  botStaffPerms
} = require("../../constants");
const fs = require('fs');
const {
  permissionCheck
} = require("../../botFunctions/blacklist/permissionCheck");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin tools for the bot')
    .setDMPermission(false)
    .addSubcommandGroup(option =>
      option.setName('staff')
      .setDescription('Manage the bot staff')
      .addSubcommand(option =>
        option.setName('add')
        .setDescription('Add a user as bot staff')
        .addStringOption(option =>
          option.setName('user_id')
          .setDescription('The ID of the user')
          .setMinLength(10)
          .setMaxLength(20)
          .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('level')
          .setDescription('The permission level to give the user')
          .setMinValue(1)
          .setMaxValue(Object.keys(botStaffPerms).length)
          .setRequired(true)
        )
      )
      .addSubcommand(option =>
        option.setName('remove')
        .setDescription('Remove a user from bot staff')
        .addStringOption(option =>
          option.setName('user_id')
          .setDescription('The ID of the user')
          .setMinLength(10)
          .setMaxLength(20)
          .setRequired(true)
        )
      )
      .addSubcommand(option =>
        option.setName('list')
        .setDescription('List the staff')
        .addStringOption(option =>
          option.setName('type')
          .setDescription('The type of list to view')
          .setRequired(true)
          .setChoices({
            name: 'Permission Levels',
            value: 'perms'
          }, {
            name: 'Staff',
            value: 'staff'
          })
        )
      )
    )
    .addSubcommand(option =>
      option.setName('new_alert')
      .setDescription('Set a new alert')
    )
    .addSubcommandGroup(option =>
      option.setName('maintenance')
      .setDescription('Manage the availability of the bot')
      .addSubcommand(option =>
        option.setName('manage')
        .setDescription('Manage the bot availability')
        .addStringOption(option =>
          option.setName('action')
          .setDescription('Enable or Disable the module')
          .setRequired(true)
          .addChoices({
            name: 'Enable',
            value: 'enable'
          }, {
            name: 'Disable',
            value: 'disable'
          })
        )
        .addStringOption(option =>
          option.setName('module')
          .setDescription('The module to change')
          .setRequired(true)
          .setChoices({
            name: 'Economy',
            value: 'Economy'
          }, {
            name: 'Reports',
            value: 'Reports'
          }, {
            name: 'Buttons',
            value: 'Buttons'
          }, {
            name: 'Commands',
            value: 'Commands'
          }, {
            name: 'Blacklist Expiry',
            value: 'Blacklist'
          }, {
            name: 'Activities',
            value: 'Activities'
          }, {
            name: 'Select Menus',
            value: 'SelectMenu'
          })
        )
      )
      .addSubcommand(option =>
        option.setName('list')
        .setDescription('View the disabled parts of the bot')
      )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'new_alert') {
      if (permissionCheck(interaction.user.id, 1) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      let firstTextBox
      let secondTextBox
      let customPriceModal = new ModalBuilder()
        .setTitle('New Alert')
        .setCustomId('custom-modal')

      const title = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Update title')
        .setMinLength(1)
        .setMaxLength(255)
        .setRequired(true)
        .setStyle('Short')
      const price = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('What is the update?')
        .setMinLength(1)
        .setMaxLength(3000)
        .setRequired(true)
        .setStyle('Paragraph')

      firstTextBox = new ActionRowBuilder().addComponents(price)
      secondTextBox = new ActionRowBuilder().addComponents(title)
      customPriceModal.addComponents(secondTextBox, firstTextBox)
      interaction.showModal(customPriceModal)
      await interaction.awaitModalSubmit({
          time: 300000
        }).catch(() => {
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
              .setDescription('You took too long to submit the modal')
              .setColor(colours.blend)
            ],
            components: [],
            ephemeral: false
          })
        })
        .then(async (i) => {
          if (!i) return
          let message = i.fields.getTextInputValue('message')
          let title = i.fields.getTextInputValue('title')
          i.deferUpdate()

          let confirm
          confirm = await interaction.followUp({
            embeds: [
              new EmbedBuilder()
              .setColor(colours.blend)
              .setDescription(`The bot changelog is getting updated to:\n**${title}**\n${message}`)
            ],
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId('yes')
                .setLabel('Send')
                .setStyle('Success'),

                new ButtonBuilder()
                .setCustomId('no')
                .setLabel('Cancel')
                .setStyle('Danger')
              )
            ],
            ephemeral: false,
            fetchReply: true
          })

          const collector = await confirm.createMessageComponentCollector({
            type: 'Button',
            time: 120000
          })

          let collected = false
          collector.on('collect', async (int) => {
            if (int.user.id !== interaction.user.id) return int.reply({
              embeds: [
                new EmbedBuilder()
                .setDescription('This is not for you')
                .setColor(colours.blend)
              ],
              ephemeral: true
            })
            collected = true
            if (int.customId === 'no') {
              collector.stop()
              int.message.edit({
                embeds: [
                  new EmbedBuilder()
                  .setDescription('Canceled')
                  .setColor(colours.blend)
                ],
                ephemeral: false,
                components: []
              })
            } else if (int.customId === 'yes') {
              fs.writeFileSync(`./database/bot/alert/newAlert`, message)
              fs.writeFileSync(`./database/bot/alert/newAlertTitle`, title)
              fs.writeFileSync(`./database/bot/alert/readUsers`, '')
              int.message.edit({
                embeds: [
                  new EmbedBuilder()
                  .setDescription(`Updated alert to:\n**${title}**\n${message}`)
                  .setColor(colours.blend)
                ],
                ephemeral: false,
                components: []
              })
            }
          })
          collector.on('end', () => {
            if (collected === true) return
            interaction.message.edit({
              embeds: [
                new EmbedBuilder()
                .setDescription('Timed Out')
                .setColor(colours.blend)
              ],
              ephemeral: false,
              components: []
            })
          })
        })
    } else if (interaction.options.getSubcommandGroup() === 'staff' && subcommand === 'list') {
      if (permissionCheck(interaction.user.id, 3) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      if (interaction.options.getString('type') === 'perms') {
        const arr = Object.entries(botStaffPerms).map((key) => `${key[1]}: \`${key[0]}\``)
        interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.warn)
            .setDescription(`**Current Permission Levels**:\n\n${arr.join('\n')}`)
          ]
        })
      } else if (interaction.options.getString('type') === 'staff') {
        const staffFiles = fs.readdirSync(`./database/bot/staff`, 'ascii')
        let staffList = ''
        for (const staff of staffFiles) {
          staffList += `${staff} (<@${staff}>): ${fs.readFileSync(`./database/bot/staff/${staff}/rank`, 'ascii')}\n`
        }
        interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.warn)
            .setDescription(`**Current Bot Staff**:\n\n${staffList}`)
          ]
        })
      }
    } else if (interaction.options.getSubcommandGroup() === 'staff' && subcommand === 'add') {
      const id = interaction.options.getString('user_id')
      if (permissionCheck(interaction.user.id, 2) === true && interaction.user.id !== '804265795835265034') return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      const level = interaction.options.getInteger('level')
      if (fs.existsSync(`./database/bot/staff/${id}`)) {
        const oldLevel = fs.readFileSync(`./database/bot/staff/${id}/rank`)
        fs.writeFileSync(`./database/bot/staff/${id}/rank`, `${level}`)
        interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.success)
            .setDescription(`**Updated User As Bot Staff**\n\n${id} (<@${id}>)\nOld Rank: ${oldLevel}, New Rank: ${level}`)
          ]
        })
      } else {
        fs.mkdir(`./database/bot/staff/${id}`, (() => {
          fs.writeFileSync(`./database/bot/staff/${id}/rank`, `${level}`)
        }))
        interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.success)
            .setDescription(`**Added User As Bot Staff**\n\n${id} (<@${id}>)\nRank: ${level}`)
          ]
        })
      }
    } else if (interaction.options.getSubcommandGroup() === 'staff' && subcommand === 'remove') {
      const id = interaction.options.getString('user_id')
      if (permissionCheck(interaction.user.id, 2) === true) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('You cannot do this')
        ],
        ephemeral: true
      })
      const oldLevel = fs.readFileSync(`./database/bot/staff/${id}/rank`)
      fs.rmSync(`./database/bot/staff/${id}`, {
        recursive: true
      })
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription(`**Deleted User As Bot Staff**\n\n${id} (<@${id}>)\nOld Rank: ${oldLevel}`)
        ]
      })
    } else if (interaction.options.getSubcommandGroup() === 'maintenance' && subcommand === 'list') {
      const files = fs.readdirSync(`./database/bot/maintenance`, 'ascii')
      let list = ''
      for (const file of files) {
        list += `${file}\n`
      }
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.warn)
          .setDescription(`**Current Disabled Modules**:\n\n${list.length === 0 ? 'None' : list}`)
        ]
      })
    } else if (interaction.options.getSubcommandGroup() === 'maintenance' && subcommand === 'manage') {
      const action = interaction.options.getString('action')
      const module = interaction.options.getString('module')

      if (action === 'disable' && fs.existsSync(`./database/bot/maintenance/${module}`)) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('This module is already disabled')
        ]
      })

      if (action === 'enable' && !fs.existsSync(`./database/bot/maintenance/${module}`)) return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.error)
          .setDescription('This module is not disabled')
        ]
      })

      if (action === 'disable') {
        fs.writeFileSync(`./database/bot/maintenance/${module}`, 'MODULE ENABLED')
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.success)
            .setDescription(`Disabled ${module}`)
          ]
        })
      }

      if (action === 'enable') {
        fs.rmSync(`./database/bot/maintenance/${module}`)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.success)
            .setDescription(`Enabled ${module}`)
          ]
        })
      }
    }
  }
}