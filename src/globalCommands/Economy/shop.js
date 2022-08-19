const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
let items = require('../../things/items/allItems')
const profileSchema = require('../../models/userProfile')
const invSchema = require('../../models/inventorySchema')
const items1 = require('../../things/items/items-page1')
const items2 = require('../../things/items/items-page2')
const items3 = require('../../things/items/items-page3')
const items4 = require('../../things/items/items-page4')
const items5 = require('../../things/items/items-page5')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDMPermission(false)
    .setDescription('The bot shop')
    .addSubcommand(option => 
        option.setName('view')
        .setDescription('View the shop')    
    )

    .addSubcommand(option =>
        option.setName('buy')
        .setDescription('Buy an item')
        
        .addStringOption(option =>
            option.setName('buy-item')
            .setDescription('The item you want to buy')
            .setMaxLength(25)
            .setMinLength(1)
            .setRequired(true)
            .setAutocomplete(true)
        )

        .addIntegerOption(option =>
            option.setName('quantity')
            .setDescription('The amount of the item to buy')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(1000000)
        )
    )

    .addSubcommand(option =>
        option.setName('sell')
        .setDescription('Sell an item')
        
        .addStringOption(option =>
            option.setName('sell-item')
            .setDescription('The ID of the item you want to sell')
            .setMaxLength(25)
            .setMinLength(1)
            .setRequired(true)
            .setAutocomplete(true)
        )

        .addIntegerOption(option =>
            option.setName('quantity')
            .setDescription('The amount of the item to sell')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(1000000)
        )
    ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'buy-item') {
            items = items.filter(item => item.buyPrice > 0)
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
        } else if (focusedOption.name === 'sell-item') {
            items = items.filter(item => item.sellPrice > 0)
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
        const functions = require('../../commandFunctions')
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

            const embed1 = new EmbedBuilder()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList1 || 'There is nothing on this page'}`)

            const embed2 = new EmbedBuilder()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList2 || 'There is nothing on this page'}`)

            const embed3 = new EmbedBuilder()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList3 || 'There is nothing on this page'}`)

            const embed4 = new EmbedBuilder()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList4 || 'There is nothing on this page'}`)

            const embed5 = new EmbedBuilder()
                .setTitle('Shop')
                .setColor('0xa744f2')
                .setDescription(`${shopList5 || 'There is nothing on this page'}`)

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('shop-page1')
                    .setDisabled(true)
                    .setLabel('Page 1')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('shop-page2')
                    .setLabel('Page 2')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('shop-page3')
                    .setLabel('Page 3')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('shop-page4')
                    .setLabel('Page 4')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('shop-page5')
                    .setLabel('Page 5')
                    .setStyle('Secondary'),
                )

            const shopMessage = await interaction.reply({
                embeds: [embed1],
                components: [buttons],
                fetchReply: true
            })

            const collector = await shopMessage.createMessageComponentCollector({
                type: 'Button',
                time: 20000
            })

            collector.on('collect', (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
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
            let itemQuery = interaction.options.getString('buy-item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1

            functions.createRecentCommand(interaction.user.id, 'shop-buy', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

            const search = !!items.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You do not have enough to buy this')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (itemFound.buyPrice === 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('This item cannot be bought')
                    .setColor('0xa744f2')
                ]
            })

            if (userProfile.wallet < (itemFound.buyPrice * amount)) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
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
            let itemQuery = interaction.options.getString('sell-item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1

            functions.createRecentCommand(interaction.user.id, 'shop-sell', `ITEM: ${itemQuery.toLocaleString()} | AMOUNT: ${amount.toLocaleString()}`, interaction)

            const search = !!items.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You do not have this item')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (itemFound.sellPrice === 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                            new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You do not have this item')
                        .setColor('0xa744f2')
                    ]
                })
            }
        }
    }
}