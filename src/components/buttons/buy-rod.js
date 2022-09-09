const profileSchema = require('../../models/userProfile')
const invSchema = require('../../models/inventorySchema')
const itemsBuy = require('../../things/items/allItems')
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js')

module.exports = {
    data: {
        name: 'buy-rod'
    },

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'shop', 3, interaction)
        if (cldn === true) return
        
        const itemQuery = 'rod'
        let amount = 1
        functions.createRecentCommand(interaction.user.id, 'shop-buy', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)
        const search = !!itemsBuy.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find an item with that ID')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = itemsBuy.find((value) => value.id === itemQuery)
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
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Fish Again')
                            .setCustomId('fish-again')
                            .setStyle('Secondary')
                        )
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
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Fish Again')
                            .setCustomId('fish-again')
                            .setStyle('Secondary')
                        )
                    ]
                })
            }
    }
}