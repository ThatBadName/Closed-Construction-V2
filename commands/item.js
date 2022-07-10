const { MessageEmbed } = require('discord.js')
const items = require('../items/allItems')

module.exports = {
name: 'item',
aliases: [''],
description: 'View some more info on an item',
category: 'Misc',
slash: true,
ownerOnly: false,
guildOnly: true,
testOnly: false,
options: [
    {
        name: 'itemid',
        description: 'The ID of the item to view',
        type: 'STRING',
        required: true
    }
],

callback: async({interaction}) => {
    const functions = require('../checks/functions')
    const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
    if (blks === true) return
    const main = await functions.checkMaintinance(interaction)
    if (main === true) return
    const cldn = await functions.cooldownCheck(interaction.user.id, 'item', 3, interaction)
    if (cldn === true) return
    functions.createRecentCommand(interaction.user.id, 'item', `LOOKUP: ${interaction.options.getString('itemid')}`, interaction)

    let itemQuery = interaction.options.getString('itemid')
    itemQuery = itemQuery.toLowerCase()

    const search = !!items.find((value) => value.id === itemQuery)
    if (!search) return interaction.reply({
        embeds: [
            new MessageEmbed()
            .setTitle('I could not find an item with that ID')
            .setColor('0xa744f2')
        ]
    })
    const itemFound = items.find((value) => value.id === itemQuery)
    interaction.reply({
        embeds: [
            new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Found item: ${itemFound.name}`)
            .setDescription(`**${itemFound.emoji} ${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\`\n**Trade Value**: \`${itemFound.tradeValue.toLocaleString()}\``)
            .setFields({
                name: 'Type',
                value: `\`${itemFound.type || 'None'}\``,
                inline: true
            }, {
                name: 'Rarity',
                value: `\`${itemFound.rarity || 'None'}\``,
                inline: true
            })
        ]
    })
}
}