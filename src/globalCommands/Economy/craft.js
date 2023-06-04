const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js");
const {
  removeItem,
  addItem
} = require("../../botFunctions/inventory");
const {
  colours
} = require("../../constants");
const itemList = require("../../items/itemList");
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('craft')
    .setDMPermission(false)
    .setDescription('Craft items')
    .addStringOption(option =>
      option.setName('item')
      .setDescription('The item to craft')
      .setRequired(true)
      .setAutocomplete(true)
      .setMaxLength(25)
    )

    .addIntegerOption(option =>
      option.setName('amount')
      .setDescription('The amount of the item to craft')
      .setMinValue(1)
      .setRequired(false)
    ),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)

    if (focusedOption.name === 'item') {
      let items = itemList.filter(item => item.craftable === true)
      let focusedValue = interaction.options.getFocused()
      let choices = items.map(i => `${i.name},${i.id}`).sort()
      let filtered = choices.filter((choice) =>
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

  async execute(interaction, client) {
    let itemQuery = interaction.options.getString('item')
    itemQuery = itemQuery.toLowerCase()
    let quantity = interaction.options.getInteger('amount') || 1
    if (quantity < 1) quantity = 1

    const search = !!itemList.find((value) => value.id === itemQuery)
    if (!search) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription('I could not find that item')
        .setColor('0x' + colours.error)
      ],
      ephemeral: true
    })
    const itemFound = itemList.find((value) => value.id === itemQuery)
    if (itemFound.craftable === false) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription('That item cannot be craftted')
        .setColor(colours.error)
      ],
      ephemeral: true
    })

    let itemsNeeded = []
    for (let i = 0; i < itemFound.recipie.length; ++i) {
      let current = itemFound.recipie[i]
      itemsNeeded.push(current.amount + '|' + current.fileId)
      let amountInInv
      if (fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`)) amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
      if (!fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) || amountInInv < current.amount * quantity) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setDescription(`**You cannot craft this**\nTo craft this item you need ${(fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) ? current.amount - amountInInv : current.amount).toLocaleString()} more ${current.emoji}${current.name}`)
            .setColor(colours.error)
          ],
          ephemeral: true
        })
      }
      amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
    }

    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(
          `You are about to craft ${quantity.toLocaleString()}x ${itemFound.emoji}${itemFound.name} using:\n` +
          `${itemFound.recipie.map(i => `\` - \` ${i.amount * quantity}x ${i.emoji}${i.name}`).join('\n')}`
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
      if (i.customId === 'confirm') {
        let itemsNeeded = []
        for (let i = 0; i < itemFound.recipie.length; ++i) {
          let current = itemFound.recipie[i]
          itemsNeeded.push(current.amount + '|' + current.fileId)
          let amountInInv
          if (fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`)) amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
          if (!fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) || amountInInv < current.amount * quantity) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                .setDescription(`**You cannot craft this**\nTo craft this item you need ${(fs.existsSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}`) ? current.amount * quantity - amountInInv : current.amount).toLocaleString()} more ${current.emoji}${current.name}`)
                .setColor(colours.error)
              ],
              ephemeral: true
            })
          }
          amountInInv = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${current.fileId}/amount`, 'ascii')
        }
        for (let i = 0; i < itemsNeeded.length; ++i) {
          let current = itemsNeeded[i]
          removeItem(current.split('|')[1], current.split('|')[0] * quantity, interaction.user.id)
        }

        addItem(itemFound.id, quantity, interaction.user.id)

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setTitle('Item crafted')
            .setColor(colours.blend)
            .setDescription(
              `You have crafted ${quantity}x ${itemFound.emoji}${itemFound.name} using:\n` +
              `${itemFound.recipie.map(i => `\` - \` ${i.amount * quantity}x ${i.emoji}${i.name}`).join('\n')}`
            )
          ],
          components: []
        })
      } else if (i.customId === 'cancel') {
        collector.stop()
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription('Canceled')
          ],
          components: []
        })
      }
    })
    collector.on('end', () => {
      if (collected === true) return
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription('You took too long to respond')
        ],
        components: []
      })
    })

  }
}