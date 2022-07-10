const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const items = require('../items/allItems')
const profileSchema = require('../models/userProfile')
const invSchema = require('../models/inventorySchema')
const items1 = require('../items/items-page1')
const items2 = require('../items/items-page2')
const items3 = require('../items/items-page3')
const items4 = require('../items/items-page4')
const items5 = require('../items/items-page5')

module.exports = {
    name: 'shop',
    aliases: [''],
    description: 'View the shop',
    category: 'Economy',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
            name: 'view',
            description: 'View the shop',
            type: 'SUB_COMMAND'
        },
        {
            name: 'buy',
            description: 'Buy an item',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'item',
                    description: 'The ID of the item to buy',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'amount',
                    description: 'The amount of the item to buy (Default 1)',
                    type: 'INTEGER',
                    reqiured: false
                }
            ]
        },
        {
            name: 'sell',
            description: 'Sell an item',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'item',
                    description: 'The ID of the item to sell',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'amount',
                    description: 'The amount of the item to sell (Default 1)',
                    type: 'INTEGER',
                    reqiured: false
                }
            ]
        }
    ],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'shop', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'view') {
            functions.createRecentCommand(interaction.user.id, 'shop-view', `None`, interaction)

            const shopList1 = items1.map((value) => {
                return `> **${value.emoji} ${value.name || 'Not yet an item'}** (**ID**: \`${value.id || 'None'}\`) — \`${value.buyPrice.toLocaleString()}\` coins\n> ${value.description || 'Not yet an item'}`
            }).join('\n\n')

            const shopList2 = items2.map((value) => {
                return `> **${value.emoji} ${value.name || 'Not yet an item'}** (**ID**: \`${value.id || 'None'}\`) — \`${value.buyPrice.toLocaleString()}\` coins\n> ${value.description || 'Not yet an item'}`
            }).join('\n\n')

            const shopList3 = items3.map((value) => {
                return `> **${value.emoji} ${value.name || 'Not yet an item'}** (**ID**: \`${value.id || 'None'}\`) — \`${value.buyPrice.toLocaleString()}\` coins\n> ${value.description || 'Not yet an item'}`
            }).join('\n\n')

            const shopList4 = items4.map((value) => {
                return `> **${value.emoji} ${value.name || 'Not yet an item'}** (**ID**: \`${value.id || 'None'}\`) — \`${value.buyPrice.toLocaleString()}\` coins\n> ${value.description || 'Not yet an item'}`
            }).join('\n\n')

            const shopList5 = items5.map((value) => {
                return `> **${value.emoji} ${value.name || 'Not yet an item'}** (**ID**: \`${value.id || 'None'}\`) — \`${value.buyPrice.toLocaleString()}\` coins\n> ${value.description || 'Not yet an item'}`
            }).join('\n\n')

            const embed1 = new MessageEmbed()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList1}`)

            const embed2 = new MessageEmbed()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList2}`)

            const embed3 = new MessageEmbed()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList3}`)

            const embed4 = new MessageEmbed()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList4}`)

            const embed5 = new MessageEmbed()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList5}`)

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('shop-page1')
                    .setDisabled(true)
                    .setLabel('Page 1')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('shop-page2')
                    .setLabel('Page 2')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('shop-page3')
                    .setLabel('Page 3')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('shop-page4')
                    .setLabel('Page 4')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('shop-page5')
                    .setLabel('Page 5')
                    .setStyle('SECONDARY'),
                )

            const shopMessage = await interaction.reply({
                embeds: [embed1],
                components: [buttons],
                fetchReply: true
            })

            const collector = await shopMessage.createMessageComponentCollector({
                type: 'BUTTON',
                time: 20000
            })

            collector.on('collect', (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })

                if (i.customId === 'shop-page1') {
                    buttons.components[0].setDisabled(true)
                    buttons.components[1].setDisabled(false)
                    buttons.components[2].setDisabled(false)
                    buttons.components[3].setDisabled(false)
                    buttons.components[4].setDisabled(false)
                    shopMessage.edit({
                        embeds: [embed1],
                        components: [buttons]
                    })
                    i.deferUpdate()
                    collector.resetTimer()
                } else if (i.customId === 'shop-page2') {
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(true)
                    buttons.components[2].setDisabled(false)
                    buttons.components[3].setDisabled(false)
                    buttons.components[4].setDisabled(false)
                    shopMessage.edit({
                        embeds: [embed2],
                        components: [buttons]
                    })
                    i.deferUpdate()
                    collector.resetTimer()
                } else if (i.customId === 'shop-page3') {
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(false)
                    buttons.components[2].setDisabled(true)
                    buttons.components[3].setDisabled(false)
                    buttons.components[4].setDisabled(false)
                    shopMessage.edit({
                        embeds: [embed3],
                        components: [buttons]
                    })
                    i.deferUpdate()
                    collector.resetTimer()
                } else if (i.customId === 'shop-page4') {
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(false)
                    buttons.components[2].setDisabled(false)
                    buttons.components[3].setDisabled(true)
                    buttons.components[4].setDisabled(false)
                    shopMessage.edit({
                        embeds: [embed4],
                        components: [buttons]
                    })
                    i.deferUpdate()
                    collector.resetTimer()
                } else if (i.customId === 'shop-page5') {
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(false)
                    buttons.components[2].setDisabled(false)
                    buttons.components[3].setDisabled(false)
                    buttons.components[4].setDisabled(true)
                    shopMessage.edit({
                        embeds: [embed5],
                        components: [buttons]
                    })
                    i.deferUpdate()
                    collector.resetTimer()
                }
            })

            collector.on('end', () => {
                buttons.components[0].setDisabled(true)
                buttons.components[1].setDisabled(true)
                buttons.components[2].setDisabled(true)
                buttons.components[3].setDisabled(true)
                buttons.components[4].setDisabled(true)
                shopMessage.edit({
                    components: [buttons]
                })
            })

        } else if (interaction.options.getSubcommand() === 'buy') {
            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('amount') || 1
            if (amount < 1) amount = 1

            functions.createRecentCommand(interaction.user.id, 'shop-buy', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

            const search = !!items.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find an item with that ID')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = items.find((value) => value.id === itemQuery)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                await profileSchema.create({
                    userId: interaction.user.id
                })
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You do not have enough to buy this')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (itemFound.buyPrice === 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('This item cannot be bought')
                    .setColor('0xa744f2')
                ]
            })

            if (userProfile.wallet < (itemFound.buyPrice * amount)) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You do not have enough to buy this')
                    .setColor('0xa744f2')
                ]
            })

            const scanDatabaseForItem = await invSchema.findOne({
                userId: interaction.user.id,
                itemId: itemQuery.toLowerCase()
            })
            if (scanDatabaseForItem) {
                scanDatabaseForItem.amount += amount
                scanDatabaseForItem.save()
                userProfile.wallet -= itemFound.buyPrice * amount
                userProfile.save()
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You have bought an item')
                        .setColor('0xa744f2')
                        .setFields({
                            name: 'Item',
                            value: `${itemFound.emoji} ${itemFound.name}`,
                            inline: true
                        }, {
                            name: 'Amount',
                            value: `\`${amount.toLocaleString()}\``
                        }, {
                            name: 'Bought For',
                            value: `\`${(itemFound.buyPrice * amount).toLocaleString()}\` coins`
                        })
                    ]
                })
            } else {
                invSchema.create({
                    userId: interaction.user.id,
                    emoji: itemFound.emoji,
                    item: itemFound.name,
                    itemId: itemFound.id,
                    amount: amount
                })
                userProfile.wallet -= itemFound.buyPrice * amount
                userProfile.save()
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You have bought an item')
                        .setColor('0xa744f2')
                        .setFields({
                            name: 'Item',
                            value: `${itemFound.emoji} ${itemFound.name}`,
                            inline: true
                        }, {
                            name: 'Amount',
                            value: `\`${amount.toLocaleString()}\``
                        }, {
                            name: 'Bought For',
                            value: `\`${(itemFound.buyPrice * amount).toLocaleString()}\` coins`
                        })
                    ]
                })
            }
        } else if (interaction.options.getSubcommand() === 'sell') {
            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('amount') || 1
            if (amount < 1) amount = 1

            functions.createRecentCommand(interaction.user.id, 'shop-sell', `ITEM: ${itemQuery.toLocaleString()} | AMOUNT: ${amount.toLocaleString()}`, interaction)

            const search = !!items.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find an item with that ID')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = items.find((value) => value.id === itemQuery)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                await profileSchema.create({
                    userId: interaction.user.id
                })
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You do not have this item')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (itemFound.sellPrice === 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('This item cannot be sold')
                    .setColor('0xa744f2')
                ]
            })

            const scanDatabaseForItem = await invSchema.findOne({
                userId: interaction.user.id,
                itemId: itemQuery.toLowerCase()
            })
            if (scanDatabaseForItem) {
                if (amount > scanDatabaseForItem.amount) amount = scanDatabaseForItem.amount
                if (amount === scanDatabaseForItem.amount) {
                    scanDatabaseForItem.delete()
                    userProfile.wallet += itemFound.sellPrice * amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Sold Item')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'Item',
                                value: `${itemFound.emoji} ${itemFound.name}`,
                                inline: true
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Sold For',
                                value: `\`${(itemFound.sellPrice * amount).toLocaleString()}\` coins`
                            })
                        ]
                    })
                }
                scanDatabaseForItem.amount -= amount
                scanDatabaseForItem.save()
                userProfile.wallet += itemFound.sellPrice * amount
                userProfile.save()
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Sold Item')
                        .setColor('0xa744f2')
                        .setFields({
                            name: 'Item',
                            value: `${itemFound.emoji} ${itemFound.name}`,
                            inline: true
                        }, {
                            name: 'Amount',
                            value: `\`${amount.toLocaleString()}\``
                        }, {
                            name: 'Sold For',
                            value: `\`${(itemFound.sellPrice * amount).toLocaleString()}\` coins`
                        })
                    ]
                })
            } else {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You do not have this item')
                        .setColor('0xa744f2')
                    ]
                })
            }
        }
    }
}