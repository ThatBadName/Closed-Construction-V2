const {
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require('discord.js')
const items = require('../../items/itemList')
const {
  colours,
} = require('../../constants')
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDMPermission(false)
    .setDescription('Information on an item')
    .addStringOption(option =>
      option.setName('item')
      .setDescription('The item to view')
      .setRequired(true)
      .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)

    if (focusedOption.name === 'item') {
      const focusedValue = interaction.options.getFocused()
      const choices = items.map(i => `${i.name},${i.id}`).sort()
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
    interaction
  ) {
    await interaction.deferReply()
    let itemQuery = interaction.options.getString('item')
    itemQuery = itemQuery.toLowerCase()

    const search = !!items.find((value) => value.id === itemQuery)
    if (!search) return interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setDescription('I could not find that item')
        .setColor('0x' + colours.error)
      ]
    })
    const itemFound = items.find((value) => value.id === itemQuery)
    let amountOwned = 0
    if (fs.existsSync(`./database/users/${interaction.user.id}/inventory/${itemFound.fileId}`)) amountOwned = fs.readFileSync(`./database/users/${interaction.user.id}/inventory/${itemFound.fileId}/amount`, 'ascii')

    if (itemFound.type === 'Crate') {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor('0x' + colours.blend)
          .setTitle(`${itemFound.name} (${parseInt(amountOwned).toLocaleString()} owned)`)
          .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\``)
          .setFields({
            name: 'Type',
            value: `\`${itemFound.type || 'None'}\``,
            inline: true
          }, {
            name: 'Rarity',
            value: `\`${itemFound.rarity || 'None'}\``,
            inline: true
          })
          .setThumbnail(itemFound.url || 'https://i.imgur.com/8UFyotO.png')
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId(`rewards-${itemFound.id}`)
            .setLabel('View content')
            .setStyle('Secondary')
          )
        ]
      })
    } else if (itemFound.craftable === true) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor('0x' + colours.blend)
          .setTitle(`${itemFound.name} (${parseInt(amountOwned).toLocaleString()} owned)`)
          .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\``)
          .setFields({
            name: 'Type',
            value: `\`${itemFound.type || 'None'}\``,
            inline: true
          }, {
            name: 'Rarity',
            value: `\`${itemFound.rarity || 'None'}\``,
            inline: true
          }, {
            name: 'Craftable With',
            value: itemFound.recipie.map(i => `\` - \` ${i.amount}x ${i.emoji}${i.name}`).join('\n'),
            inline: true
          })
          .setThumbnail(itemFound.url || 'https://i.imgur.com/8UFyotO.png')
        ]
      })
    } else {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor('0x' + colours.blend)
          .setTitle(`${itemFound.name} (${parseInt(amountOwned).toLocaleString()} owned)`)
          .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\``)
          .setFields({
            name: 'Type',
            value: `\`${itemFound.type || 'None'}\``,
            inline: true
          }, {
            name: 'Rarity',
            value: `\`${itemFound.rarity || 'None'}\``,
            inline: true
          })
          .setThumbnail(itemFound.url || 'https://i.imgur.com/8UFyotO.png')
        ]
      })
    }
  }
}