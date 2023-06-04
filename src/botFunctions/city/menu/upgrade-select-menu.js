const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder
} = require("discord.js")
const fs = require('fs')
const {
  colours
} = require("../../../constants")
const {
  removeCoins
} = require("../../inventory")
const {
  optionBuilder
} = require("../upgrade-option-builder")

async function upgradeCitySelectMenuCustom(interaction, client) {
  const buttonId = interaction.customId.replace('city-upgrade-options|', '')
  if (buttonId !== interaction.user.id && !interaction.customId.startsWith('view-cityMenu')) return interaction.deferUpdate()
  let type = interaction.values[0]
  let message
  let text
  let coinsNeeded = 0
  let coinsOwned = Number(fs.readFileSync(`./database/users/${interaction.user.id}/balance`, 'ascii'))
  if (type === 'cityIcon') {
    coinsNeeded = 50000
    if (coinsOwned < 50000) {
      interaction.message.edit({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription('Choose what you want to customise\n\n**Action Failed**: You do not have enough to buy this')
          .setTitle('City Upgrades')
        ]
      })
      interaction.deferUpdate()
      return
    }
    text = 'You bought city icons for 50,000. Check it out in the customisation menu'
    message = await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Are you sure you want to buy city icons for 50,000?').setColor(colours.warn)
      ],
      ephemeral: true,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('upgrade-confirm')
          .setLabel('Purchase')
          .setStyle('Success'),

          new ButtonBuilder()
          .setCustomId('upgrade-cancel')
          .setLabel('Cancel')
          .setStyle('Danger')
        )
      ]
    })
  } else if (type === 'upgradeRadar') {
    coinsNeeded = (Number(fs.readFileSync(`./database/users/${interaction.user.id}/city/radar`, 'ascii')) * 50000 + 100000)
    if (coinsOwned < coinsNeeded) {
      interaction.message.edit({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription('Choose what you want to customise\n\n**Action Failed**: You do not have enough to buy this')
          .setTitle('City Upgrades')
        ]
      })
      interaction.deferUpdate()
      return
    }
    text = `You upgraded your radar to level ${Number(fs.readFileSync(`./database/users/${interaction.user.id}/city/radar`, 'ascii')) + 1} for ${coinsNeeded.toLocaleString()}`
    message = await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription(`Are you sure you want to upgrade your radar to level ${Number(fs.readFileSync(`./database/users/${interaction.user.id}/city/radar`, 'ascii')) + 1} using ${coinsNeeded.toLocaleString()} coins?`).setColor(colours.warn)
      ],
      ephemeral: true,
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setCustomId('upgrade-confirm')
          .setLabel('Purchase')
          .setStyle('Success'),

          new ButtonBuilder()
          .setCustomId('upgrade-cancel')
          .setLabel('Cancel')
          .setStyle('Danger')
        )
      ]
    })
  }



  const collector = await message.createMessageComponentCollector({
    type: 'Button',
    time: 30000
  })

  let collected = false
  collector.on('collect', (i) => {
    collected = true
    if (i.customId === 'upgrade-cancel') {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('Purchase canceled')
          .setColor(colours.blend)
        ],
        components: [],
        ephemeral: true
      })
      collector.stop()
    } else if (i.customId === 'upgrade-confirm') {
      if (coinsOwned < coinsNeeded) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription('Choose what you want to customise\n\n**Action Failed**: You do not have enough to buy this')
            .setTitle('City Upgrades')
          ]
        })
        return
      }
      removeCoins(coinsNeeded, interaction.user.id, client)

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription('Purchase complete')
        ],
        ephemeral: true,
        components: []
      })
      if (type === 'cityIcon') fs.writeFileSync(`./database/users/${interaction.user.id}/city/imageUnlocked`, 'yes')
      else if (type === 'upgradeRadar') fs.writeFileSync(`./database/users/${interaction.user.id}/city/radar`, `${Number(fs.readFileSync(`./database/users/${interaction.user.id}/city/radar`, 'ascii')) + 1}`)

      const optionArr = optionBuilder(interaction.user.id)
      if (optionArr.length === 0) hasOption = false
      else hasOption = true
      if (hasOption === true) {
        interaction.message.edit({
          embeds: [
            new EmbedBuilder()
            .setTitle('City Upgrades')
            .setDescription(`Choose what you want to upgrade\n\n**Purchase Successful**: ${text}`)
            .setColor(colours.blend)
          ],
          ephemeral: true,
          fetchReply: true,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`view-cityMenu|${interaction.user.id}`)
              .setLabel('View')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`edit-cityMenu|${interaction.user.id}`)
              .setLabel('Customise')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
              .setLabel('Upgrades')
              .setStyle('Primary')
              .setDisabled(true),

              new ButtonBuilder()
              .setCustomId(`manage-cityMenu|${interaction.user.id}`)
              .setLabel('Manage')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`activity|${interaction.user.id}`)
              .setLabel('Activity')
              .setStyle('Secondary')
            ),
            new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
              .setCustomId(`city-upgrade-options|${interaction.user.id}`)
              .setMinValues(1)
              .setMaxValues(1)
              .setPlaceholder('Choose an option from the list')
              .addOptions(optionArr)
            )
          ]
        })
      } else {
        interaction.message.edit({
          embeds: [
            new EmbedBuilder()
            .setTitle('City Upgrades')
            .setDescription(`Your city is fully upgraded\n\n**Purchase Successful**: ${text}`)
            .setColor(colours.blend)
          ],
          ephemeral: true,
          fetchReply: true,
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId(`view-cityMenu|${interaction.user.id}`)
              .setLabel('View')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`edit-cityMenu|${interaction.user.id}`)
              .setLabel('Customise')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`upgrade-cityMenu|${interaction.user.id}`)
              .setLabel('Upgrades')
              .setStyle('Primary')
              .setDisabled(true),

              new ButtonBuilder()
              .setCustomId(`manage-cityMenu|${interaction.user.id}`)
              .setLabel('Manage')
              .setStyle('Secondary'),

              new ButtonBuilder()
              .setCustomId(`activity|${interaction.user.id}`)
              .setLabel('Activity')
              .setStyle('Secondary')
            ),
            new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
              .setCustomId(`city-upgrade-options|${interaction.user.id}`)
              .setMinValues(1)
              .setMaxValues(1)
              .setPlaceholder('Choose an option from the list')
              .setDisabled(true)
              .addOptions([{
                label: 'NULL',
                description: 'NULL',
                value: 'null'
              }])
            )
          ]
        })
      }
    }
  })

  collector.on('end', () => {
    if (collected === false) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription('You did not respond in time')
          .setColor(colours.blend)
        ],
        components: [],
        ephemeral: true
      })
    }
  })
}

module.exports = {
  upgradeCitySelectMenuCustom
}