const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const fs = require('fs')
const {
  colours
} = require('../../../constants')
const { addMaxPop, removeItem } = require('../../inventory')

async function buildBasic(interaction, materialsBasic) {
  let itemsNeeded = []
  let amount = 1
  for (let i = 0; i < materialsBasic.length; ++i) {
    let current = materialsBasic[i]
    itemsNeeded.push(current.amount + '|' + current.fileId)
    let amountInInv
    if (fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`)) amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
    if (!fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) || amountInInv < current.amount * amount) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`**You do not have the materials to build this**\nTo build this house you need ${(fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) ? current.amount - amountInInv : current.amount).toLocaleString()} more ${current.emoji}${current.name}`)
          .setColor(colours.error)
        ],
        ephemeral: true
      })
    }
    amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
  }
  interaction.deferUpdate()
  const message = await interaction.message.edit({
    embeds: [
      new EmbedBuilder()
      .setColor(colours.blend)
      .setTitle('Building Menu')
      .setDescription(
        `You are about to build a basic building using:\n` +
        `${materialsBasic.map(i => `\` - \` ${i.amount}x ${i.emoji}${i.name}`).join('\n')}`
      )
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle('Success'),

        new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle('Danger')
      )
    ],
    fetchReply: true
  })

  const collector = await message.createMessageComponentCollector({
    time: 30000,
    type: 'Button'
  })

  let collected = false
  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) return i.reply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.error)
        .setDescription('This is not for you')
      ],
      ephemeral: true
    })

    collected = true
    collector.stop()
    if (i.customId === 'confirm') {
      let itemsNeeded = []
      for (let i = 0; i < materialsBasic.length; ++i) {
        let current = materialsBasic[i]
        itemsNeeded.push(current.amount + '|' + current.fileId)
        let amountInInv
        if (fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`)) amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
        if (!fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) || amountInInv < current.amount * amount) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription(`**You do not have the materials to build this**\nTo build this house you need ${(fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) ? current.amount - amountInInv : current.amount).toLocaleString()} more ${current.emoji}${current.name}`)
              .setColor(colours.error)
            ]
          })
        }
        amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
      }
      for (let i = 0; i < itemsNeeded.length; ++i) {
        let current = itemsNeeded[i]
        removeItem(current.split('|')[1], current.split('|')[0], interaction.user.id)
      }

      addMaxPop(10, interaction.user.id)
      const maxPop = fs.readFileSync(`./database/users/${interaction.user.id}/city/maxPop`, 'ascii')

      const actions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId(`build-building|${interaction.user.id}`)
        .setLabel('Build')
        .setStyle('Secondary')
      )
      let textAlert = ''
      if (fs.readdirSync(`./database/users/${interaction.user.id}/city/buildings`).length < 5) {
        actions.addComponents(
          new ButtonBuilder()
          .setCustomId(`upgrade-building|${interaction.user.id}`)
          .setLabel('Upgrade')
          .setStyle('Secondary')
          .setDisabled(true)
        )
          textAlert = 'You must have at least 5 buildings to upgrade'
      }
      else {
        actions.addComponents(
          new ButtonBuilder()
          .setCustomId(`upgrade-building|${interaction.user.id}`)
          .setLabel('Upgrade')
          .setStyle('Secondary')
        )
      }
      actions.addComponents(
        new ButtonBuilder()
        .setCustomId(`build-goback|${interaction.user.id}`)
        .setLabel('Return')
        .setStyle('Danger')
      )
      i.deferUpdate()
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setTitle('Building Menu')
          .setColor(colours.blend)
          .setDescription(
            'Do you want to upgrade a building or make a new one?' + `${textAlert === '' ? '' : `\n\n${textAlert}`}\n\n` +
            `**Latest Action**: You have added a building to your city. Your max population is now ${Number(maxPop).toLocaleString()}`
          )
        ],
        components: [
          actions
        ]
      })
      let amountOfBuildings = fs.readdirSync(`./database/users/${interaction.user.id}/city/buildings`).length
      fs.mkdir(`./database/users/${interaction.user.id}/city/buildings/${amountOfBuildings}`, (() => {
        fs.writeFileSync(`./database/users/${interaction.user.id}/city/buildings/${amountOfBuildings}/type`, `basic`)
        fs.writeFileSync(`./database/users/${interaction.user.id}/city/buildings/${amountOfBuildings}/pop`, `0`)
        fs.writeFileSync(`./database/users/${interaction.user.id}/city/buildings/${amountOfBuildings}/maxPop`, `10`)
        fs.writeFileSync(`./database/users/${interaction.user.id}/city/buildings/${amountOfBuildings}/canUpgrade`, `yes`)
      }))
    } else if (i.customId === 'cancel') {
      collector.stop()
      const actions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId(`build-building|${interaction.user.id}`)
        .setLabel('Build')
        .setStyle('Secondary')
      )
      let textAlert = ''
      if (fs.readdirSync(`./database/users/${interaction.user.id}/city/buildings`).length < 5) {
        actions.addComponents(
          new ButtonBuilder()
          .setCustomId(`upgrade-building|${interaction.user.id}`)
          .setLabel('Upgrade')
          .setStyle('Secondary')
          .setDisabled(true)
        )
          textAlert = 'You must have at least 5 buildings to upgrade'
      }
      else {
        actions.addComponents(
          new ButtonBuilder()
          .setCustomId(`upgrade-building|${interaction.user.id}`)
          .setLabel('Upgrade')
          .setStyle('Secondary')
        )
      }
      actions.addComponents(
        new ButtonBuilder()
        .setCustomId(`build-goback|${interaction.user.id}`)
        .setLabel('Return')
        .setStyle('Danger')
      )
      i.deferUpdate()
      interaction.message.edit({
        embeds: [
          new EmbedBuilder()
          .setTitle('Building Menu')
          .setDescription('Do you want to upgrade a building or make a new one?' + `${textAlert === '' ? '' : `\n\n${textAlert}`}`)
          .setColor(colours.blend)
        ],
        components: [
          actions
        ]
      })
    }
  })
  collector.on('end', () => {
    if (collected === true) return
    const actions = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setCustomId(`build-building|${interaction.user.id}`)
      .setLabel('Build')
      .setStyle('Secondary')
    )
    let textAlert = ''
    if (fs.readdirSync(`./database/users/${interaction.user.id}/city/buildings`).length < 5) {
      actions.addComponents(
        new ButtonBuilder()
        .setCustomId(`upgrade-building|${interaction.user.id}`)
        .setLabel('Upgrade')
        .setStyle('Secondary')
        .setDisabled(true)
      )
        textAlert = 'You must have at least 5 buildings to upgrade'
    }
    else {
      actions.addComponents(
        new ButtonBuilder()
        .setCustomId(`upgrade-building|${interaction.user.id}`)
        .setLabel('Upgrade')
        .setStyle('Secondary')
      )
    }
    actions.addComponents(
      new ButtonBuilder()
      .setCustomId(`build-goback|${interaction.user.id}`)
      .setLabel('Return')
      .setStyle('Danger')
    )
    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
        .setTitle('Building Menu')
        .setDescription('Do you want to upgrade a building or make a new one?' + `${textAlert === '' ? '' : `\n\n${textAlert}`}`)
        .setColor(colours.blend)
      ],
      components: [
        actions
      ]
    })
  })
}

module.exports = {
  buildBasic
}