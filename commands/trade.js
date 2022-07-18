const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const blockSchema = require('../models/blockedUsers')
const items = require('../items/allItems')
const profileSchema = require('../models/userProfile')
const invSchema = require('../models/inventorySchema')
const checkTradeSchema = require('../models/checkTrade')

module.exports = {
    name: 'trade',
    aliases: [''],
    description: 'Trade items with another user',
    category: 'Economy',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
            name: 'target',
            description: 'The user to trade with',
            type: 'USER',
            required: true
        },
        {
            name: 'your-amount',
            description: 'The amount of your coins/items to trade',
            type: 'INTEGER',
            required: true
        },
        {
            name: 'their-amount',
            description: 'The amount of their coins/items to trade',
            type: 'INTEGER',
            required: true
        },
        {
            name: 'your-item',
            description: 'Your item to trade',
            type: 'STRING',
            required: false
        },
        {
            name: 'their-item',
            description: 'Their item to trade',
            type: 'STRING',
            required: false
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
        const cldn = await functions.cooldownCheck(interaction.user.id, 'trade', 35, interaction)
        if (cldn === true) return

        const recipient = interaction.options.getUser('target')
        const sender = interaction.user
        const senderAmount = interaction.options.getInteger('your-amount')
        const recipientAmount = interaction.options.getInteger('their-amount')
        const senderItem = interaction.options.getString('your-item')
        const recipientItem = interaction.options.getString('their-item')
        const checkExisting1 = await checkTradeSchema.findOne({
            userId: sender.id
        })
        const checkExisting2 = await checkTradeSchema.findOne({
            userId: recipient.id
        })
        const checkExisting3 = await checkTradeSchema.findOne({
            inTradeWith: sender.id
        })
        const checkExisting4 = await checkTradeSchema.findOne({
            inTradeWith: recipient.id
        })
        if (checkExisting1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You are in a trade already')
                .setColor('0xa744f2')
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Go to the trade')
                    .setStyle('LINK')
                    .setURL(`${checkExisting1.message}`)
                )
            ]
        })
        if (checkExisting2) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You are in a trade already')
                .setColor('0xa744f2')
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Go to the trade')
                    .setStyle('LINK')
                    .setURL(`${checkExisting2.message}`)
                )
            ]
        })
        if (checkExisting3) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Someone is trying to trade with you')
                .setColor('0xa744f2')
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Go to the trade')
                    .setStyle('LINK')
                    .setURL(`${checkExisting3.message}`)
                )
            ]
        })
        if (checkExisting4) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Someone is trying to trade with you')
                .setColor('0xa744f2')
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Go to the trade')
                    .setStyle('LINK')
                    .setURL(`${checkExisting4.message}`)
                )
            ]
        })

        const userProfileSender = await profileSchema.findOne({
            userId: sender.id
        })
        const userProfileRecipient = await profileSchema.findOne({
            userId: recipient.id
        })

        const checkBlock1 = await blockSchema.findOne({
            blockedById: recipient.id,
            blockedUserId: sender.id
        })
        const checkBlock2 = await blockSchema.findOne({
            blockedById: sender.id,
            blockedUserId: recipient.id
        })
        if (checkBlock1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('This user has blocked you')
                .setColor('0xa744f2')
            ]
        })
        if (checkBlock2) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You have blocked this user')
                .setColor('0xa744f2')
            ]
        })

        if (recipient.id === sender.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('0xa744f2')
                .setTitle('You can\'t trade with yourself')
            ]
        })

        if (senderAmount < 1 || recipientAmount < 1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('0xa744f2')
                .setTitle('Amounts cannot be less than 1')
            ]
        })

        if (!userProfileSender) {
            profileSchema.create({
                userId: sender.id
            })
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You do not have enough stuff to preform this trade')
                    .setColor('0xa744f2')
                ]
            })
        }
        if (!userProfileRecipient) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('That user does not have a bot profile')
                .setColor('0xa744f2')
            ]
        })

        if (senderAmount && recipientAmount && !senderItem && !recipientItem) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('a744f2')
                .setTitle('You can\'t trade coins for coins')
            ]
        })

        let itemQueryYou
        let itemQueryThem
        if (interaction.options.getString('your-item')) {
            itemQueryYou = interaction.options.getString('your-item')
            itemQueryYou = itemQueryYou.toLowerCase()
            const searchYour = !!items.find((value) => value.id === itemQueryYou)
            if (!searchYour) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find an item with that ID (Your item)')
                    .setColor('0xa744f2')
                ]
            })
        }
        if (interaction.options.getString('their-item')) {
            itemQueryThem = interaction.options.getString('their-item')
            itemQueryThem = itemQueryThem.toLowerCase()
            const searchThem = !!items.find((value) => value.id === itemQueryThem)
            if (!searchThem) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find an item with that ID (Their item)')
                    .setColor('0xa744f2')
                ]
            })
        }

        const itemFoundThem = items.find((value) => value.id === itemQueryThem)
        const itemFoundYour = items.find((value) => value.id === itemQueryYou)

        //your money for their item
        if (senderAmount && recipientAmount && recipientItem && !senderItem) {
            const checkTheirInv = await invSchema.findOne({
                userId: recipient.id,
                itemId: itemFoundThem.id
            })
            if (userProfileSender.wallet < senderAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You do not have enough coins to perform this trade')
                    .setColor('0xa744f2')
                ]
            })
            if (!checkTheirInv) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('0xa744f2')
                    .setTitle('This user does not have that item')
                ]
            })
            if (checkTheirInv.amount < recipientAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('0xa744f2')
                    .setTitle('This user does not have enough of that item to perform the trade')
                ]
            })

            const confirmSenderEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `\`${senderAmount.toLocaleString()}\` coins`
                }, {
                    name: `${recipient.tag} gives`,
                    value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                })
                .setFooter({
                    text: `You have 30 seconds to confirm`
                })

            const confirmRecipientEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                }, {
                    name: `${sender.tag} gives`,
                    value: `\`${senderAmount.toLocaleString()}\` coins`
                })
                .setFooter({
                    text: `You have 2 minutes to confirm`
                })

            const confirmSenderButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-sender')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-sender')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            const confirmRecipientButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-recipient')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-recipient')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            if (checkTheirInv.amount - recipientAmount === 0) {
                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'BUTTON',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Trade')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()

                        const confirmRecipientMessage = await confirmSenderMessage.reply({
                            embeds: [confirmRecipientEmbed],
                            components: [confirmRecipientButtons],
                            content: `${recipient},`,
                            fetchReply: true
                        })

                        const tradeAwait = await checkTradeSchema.create({
                            userId: sender.id,
                            inTradeWithId: recipient.id,
                            message: confirmRecipientMessage.url
                        })

                        const collectorRecipient = await confirmRecipientMessage.createMessageComponentCollector({
                            type: 'BUTTON',
                            time: 120000
                        })

                        let collected2 = false
                        collectorRecipient.on('collect', async (i) => {
                            if (i.user.id !== recipient.id) return i.reply({
                                content: 'This is not your trade',
                                ephemeral: true
                            })

                            if (i.customId === 'confirm-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                checkTheirInv.delete()
                                userProfileRecipient.wallet += senderAmount
                                userProfileRecipient.save()
                                userProfileSender.wallet -= senderAmount
                                userProfileSender.save()

                                const checkYourInv = await invSchema.findOne({
                                    userId: sender.id,
                                    itemId: itemFoundThem.id
                                })
                                if (!checkYourInv) {
                                    invSchema.create({
                                        userId: sender.id,
                                        itemId: itemFoundThem.id,
                                        item: itemFoundThem.name,
                                        emoji: itemFoundThem.emoji,
                                        amount: recipientAmount
                                    })
                                } else {
                                    checkYourInv.amount += recipientAmount
                                    checkYourInv.save()
                                }
                                i.deferUpdate()
                                confirmRecipientButtons.components[0].setDisabled(true)
                                confirmRecipientButtons.components[1].setDisabled(true)
                                confirmRecipientEmbed.setTitle('Confirmed Trade')
                                confirmRecipientEmbed.setColor('DARK_GREEN')
                                confirmRecipientMessage.edit({
                                    components: [confirmRecipientButtons],
                                    embeds: [confirmRecipientEmbed]
                                })

                                functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                                functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)

                                confirmRecipientMessage.reply({
                                    content: `${sender} | ${recipient},`,
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Successful')
                                        .setColor('0xa744f2')
                                        .setFields({
                                            name: `${recipient.tag} gave`,
                                            value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                                        }, {
                                            name: `${sender.tag} gave`,
                                            value: `\`${senderAmount.toLocaleString()}\` coins`
                                        })
                                    ]
                                })
                                functions.createRecentCommand(sender.id, 'trade', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)

                            } else if (i.customId === 'cancel-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                confirmRecipientMessage.edit({
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Canceled')
                                        .setColor('0xa744f2')
                                    ],
                                    components: []
                                })
                                collectorRecipient.stop()
                            }
                        })

                        collectorRecipient.on('end', () => {
                            if (collected2 === true) return
                            tradeAwait.delete()

                            confirmRecipientMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Trade Canceled')
                                    .setDescription('You were idle for too long')
                                    .setColor('0xa744f2')
                                ],
                                components: []
                            })
                        })

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Trade Canceled')
                                .setColor('0xa744f2')
                            ],
                            components: []
                        })
                        collectorSender.stop()
                        functions.createRecentCommand(sender.id, 'trade', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                    }
                })

                collectorSender.on('end', () => {
                    if (collected === true) return

                    confirmSenderMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Trade Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })

                })


            } else {
                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'BUTTON',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Trade')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()

                        const confirmRecipientMessage = await confirmSenderMessage.reply({
                            embeds: [confirmRecipientEmbed],
                            components: [confirmRecipientButtons],
                            content: `${recipient},`,
                            fetchReply: true
                        })

                        const tradeAwait = await checkTradeSchema.create({
                            userId: sender.id,
                            inTradeWithId: recipient.id,
                            message: confirmRecipientMessage.url
                        })

                        const collectorRecipient = await confirmRecipientMessage.createMessageComponentCollector({
                            type: 'BUTTON',
                            time: 120000
                        })

                        let collected2 = false
                        collectorRecipient.on('collect', async (i) => {
                            if (i.user.id !== recipient.id) return i.reply({
                                content: 'This is not your trade',
                                ephemeral: true
                            })

                            if (i.customId === 'confirm-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                checkTheirInv.amount -= recipientAmount
                                checkTheirInv.save()
                                userProfileRecipient.wallet += senderAmount
                                userProfileRecipient.save()
                                userProfileSender.wallet -= senderAmount
                                userProfileSender.save()

                                const checkYourInv = await invSchema.findOne({
                                    userId: sender.id,
                                    itemId: itemFoundThem.id
                                })
                                if (!checkYourInv) {
                                    invSchema.create({
                                        userId: sender.id,
                                        itemId: itemFoundThem.id,
                                        item: itemFoundThem.name,
                                        emoji: itemFoundThem.emoji,
                                        amount: recipientAmount
                                    })
                                } else {
                                    checkYourInv.amount += recipientAmount
                                    checkYourInv.save()
                                }

                                i.deferUpdate()
                                confirmRecipientButtons.components[0].setDisabled(true)
                                confirmRecipientButtons.components[1].setDisabled(true)
                                confirmRecipientEmbed.setTitle('Confirmed Trade')
                                confirmRecipientEmbed.setColor('DARK_GREEN')
                                confirmRecipientMessage.edit({
                                    components: [confirmRecipientButtons],
                                    embeds: [confirmRecipientEmbed]
                                })

                                functions.createRecentCommand(sender.id, 'trade', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                                functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                                functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                                confirmRecipientMessage.reply({
                                    content: `${sender} | ${recipient},`,
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Successful')
                                        .setColor('0xa744f2')
                                        .setFields({
                                            name: `${recipient.tag} gave`,
                                            value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                                        }, {
                                            name: `${sender.tag} gave`,
                                            value: `\`${senderAmount.toLocaleString()}\` coins`
                                        })
                                    ]
                                })

                            } else if (i.customId === 'cancel-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                confirmRecipientMessage.edit({
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Canceled')
                                        .setColor('0xa744f2')
                                    ],
                                    components: []
                                })
                                collectorRecipient.stop()
                                functions.createRecentCommand(sender.id, 'trade', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            }
                        })

                        collectorRecipient.on('end', () => {
                            if (collected2 === true) return
                            tradeAwait.delete()

                            confirmRecipientMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Trade Canceled')
                                    .setDescription('You were idle for too long')
                                    .setColor('0xa744f2')
                                ],
                                components: []
                            })
                        })

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Trade Canceled')
                                .setColor('0xa744f2')
                            ],
                            components: []
                        })
                        collectorSender.stop()
                    }
                })

                collectorSender.on('end', () => {
                    if (collected === true) return

                    confirmSenderMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Trade Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })

                })
            }
        } else if (senderAmount && recipientAmount && !recipientItem && senderItem) {
            const checkYourInv = await invSchema.findOne({
                userId: sender.id,
                itemId: itemFoundYour.id
            })
            if (userProfileRecipient.wallet < recipientAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('That user does not have enough coins to perform this trade')
                    .setColor('0xa744f2')
                ]
            })
            if (!checkYourInv) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('0xa744f2')
                    .setTitle('You don\'t have that item')
                ]
            })
            if (checkYourInv.amount < senderAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('0xa744f2')
                    .setTitle('You do not have enough of that item to perform the trade')
                ]
            })

            const confirmSenderEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                }, {
                    name: `${recipient.tag} gives`,
                    value: `\`${recipientAmount.toLocaleString()}\` coins`
                })
                .setFooter({
                    text: `You have 30 seconds to confirm`
                })

            const confirmRecipientEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `\`${recipientAmount.toLocaleString()}\` coins`
                }, {
                    name: `${sender.tag} gives`,
                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                })
                .setFooter({
                    text: `You have 2 minutes to confirm`
                })

            const confirmSenderButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-sender')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-sender')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            const confirmRecipientButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-recipient')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-recipient')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            if (checkYourInv.amount - senderAmount === 0) {
                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'BUTTON',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Trade')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()

                        const confirmRecipientMessage = await confirmSenderMessage.reply({
                            embeds: [confirmRecipientEmbed],
                            components: [confirmRecipientButtons],
                            content: `${recipient},`,
                            fetchReply: true
                        })

                        const tradeAwait = await checkTradeSchema.create({
                            userId: sender.id,
                            inTradeWithId: recipient.id,
                            message: confirmRecipientMessage.url
                        })

                        const collectorRecipient = await confirmRecipientMessage.createMessageComponentCollector({
                            type: 'BUTTON',
                            time: 120000
                        })

                        let collected2 = false
                        collectorRecipient.on('collect', async (i) => {
                            functions.createRecentCommand(sender.id, 'trade', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                            functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                            if (i.user.id !== recipient.id) return i.reply({
                                content: 'This is not your trade',
                                ephemeral: true
                            })

                            if (i.customId === 'confirm-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                checkYourInv.delete()
                                userProfileSender.wallet += recipientAmount
                                userProfileSender.save()
                                userProfileRecipient.wallet -= recipientAmount
                                userProfileRecipient.save()

                                i.deferUpdate()
                                confirmRecipientButtons.components[0].setDisabled(true)
                                confirmRecipientButtons.components[1].setDisabled(true)
                                confirmRecipientEmbed.setTitle('Confirmed Trade')
                                confirmRecipientEmbed.setColor('DARK_GREEN')
                                confirmRecipientMessage.edit({
                                    components: [confirmRecipientButtons],
                                    embeds: [confirmRecipientEmbed]
                                })

                                const checkTheirInv = await invSchema.findOne({
                                    userId: recipient.id,
                                    itemId: itemFoundYour.id
                                })
                                if (!checkTheirInv) {
                                    invSchema.create({
                                        userId: recipient.id,
                                        itemId: itemFoundYour.id,
                                        item: itemFoundYour.name,
                                        emoji: itemFoundYour.emoji,
                                        amount: senderAmount
                                    })
                                } else {
                                    checkTheirInv.amount += senderAmount
                                }

                                confirmRecipientMessage.reply({
                                    content: `${sender} | ${recipient},`,
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Successful')
                                        .setColor('0xa744f2')
                                        .setFields({
                                            name: `${recipient.tag} gave`,
                                            value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                        }, {
                                            name: `${sender.tag} gave`,
                                            value: `\`${recipientAmount.toLocaleString()}\` coins`
                                        })
                                    ]
                                })

                            } else if (i.customId === 'cancel-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                confirmRecipientMessage.edit({
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Canceled')
                                        .setColor('0xa744f2')
                                    ],
                                    components: []
                                })
                                collectorRecipient.stop()
                                functions.createRecentCommand(sender.id, 'trade', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            }
                        })

                        collectorRecipient.on('end', () => {
                            if (collected2 === true) return
                            tradeAwait.delete()

                            confirmRecipientEmbed
                                .setTitle('Trade Canceled')
                                .setColor('0xff0000')

                            confirmRecipientButtons.components[0].setDisabled(true)
                            confirmRecipientButtons.components[1].setDisabled(true)

                            confirmRecipientMessage.edit({
                                embeds: [confirmRecipientEmbed],
                                components: [confirmRecipientButtons]
                            })
                            confirmRecipientMessage.reply({
                                embeds: [
                                    new MessageEmbed()
                                    .setColor('0xff0000')
                                    .setTitle('Trade Canceled')
                                    .setDescription('You were idle too long')
                                ],
                                content: `${sender} | ${recipient},`
                            })

                        })

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Trade Canceled')
                                .setColor('0xa744f2')
                            ],
                            components: []
                        })
                        collectorSender.stop()
                    }
                })

                collectorSender.on('end', () => {
                    if (collected === true) return

                    confirmSenderMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Trade Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })

                })


            } else {
                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'BUTTON',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Trade')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()

                        const confirmRecipientMessage = await confirmSenderMessage.reply({
                            embeds: [confirmRecipientEmbed],
                            components: [confirmRecipientButtons],
                            content: `${recipient},`,
                            fetchReply: true
                        })

                        const tradeAwait = await checkTradeSchema.create({
                            userId: sender.id,
                            inTradeWithId: recipient.id,
                            message: confirmRecipientMessage.url
                        })

                        const collectorRecipient = await confirmRecipientMessage.createMessageComponentCollector({
                            type: 'BUTTON',
                            time: 120000
                        })

                        let collected2 = false
                        collectorRecipient.on('collect', async (i) => {
                            functions.createRecentCommand(sender.id, 'trade', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                            functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                            if (i.user.id !== recipient.id) return i.reply({
                                content: 'This is not your trade',
                                ephemeral: true
                            })

                            if (i.customId === 'confirm-trade-recipient') {
                                tradeAwait.delete()
                                collected2 = true

                                checkYourInv.amount -= senderAmount
                                checkYourInv.save()
                                userProfileSender.wallet += recipientAmount
                                userProfileSender.save()
                                userProfileRecipient.wallet -= recipientAmount
                                userProfileRecipient.save()

                                const checkTheirInv = await invSchema.findOne({
                                    userId: recipient.id,
                                    itemId: itemFoundYour.id
                                })
                                if (!checkTheirInv) {
                                    invSchema.create({
                                        userId: recipient.id,
                                        itemId: itemFoundYour.id,
                                        item: itemFoundYour.name,
                                        emoji: itemFoundYour.emoji,
                                        amount: senderAmount
                                    })
                                } else {
                                    checkTheirInv.amount += recipientAmount
                                    checkTheirInv.save()
                                }

                                i.deferUpdate()
                                confirmRecipientButtons.components[0].setDisabled(true)
                                confirmRecipientButtons.components[1].setDisabled(true)
                                confirmRecipientEmbed.setTitle('Confirmed Trade')
                                confirmRecipientEmbed.setColor('DARK_GREEN')
                                confirmRecipientMessage.edit({
                                    components: [confirmRecipientButtons],
                                    embeds: [confirmRecipientEmbed]
                                })

                                confirmRecipientMessage.reply({
                                    content: `${sender} | ${recipient},`,
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Successful')
                                        .setColor('0xa744f2')
                                        .setFields({
                                            name: `${recipient.tag} gave`,
                                            value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                        }, {
                                            name: `${sender.tag} gave`,
                                            value: `\`${recipientAmount.toLocaleString()}\` coins`
                                        })
                                    ]
                                })

                            } else if (i.customId === 'cancel-trade-recipient') {
                                collected2 = true
                                tradeAwait.delete()

                                confirmRecipientMessage.edit({
                                    embeds: [
                                        new MessageEmbed()
                                        .setTitle('Trade Canceled')
                                        .setColor('0xa744f2')
                                    ],
                                    components: []
                                })
                                collectorRecipient.stop()
                                functions.createRecentCommand(sender.id, 'trade', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            }
                        })

                        collectorRecipient.on('end', () => {
                            tradeAwait.delete()

                            if (collected2 === true) return

                            confirmRecipientEmbed
                                .setTitle('Trade Canceled')
                                .setColor('0xff0000')

                            confirmRecipientButtons.components[0].setDisabled(true)
                            confirmRecipientButtons.components[1].setDisabled(true)

                            confirmRecipientMessage.edit({
                                embeds: [confirmRecipientEmbed],
                                components: [confirmRecipientButtons]
                            })
                            confirmRecipientMessage.reply({
                                embeds: [
                                    new MessageEmbed()
                                    .setColor('0xff0000')
                                    .setTitle('Trade Canceled')
                                    .setDescription('You were idle too long')
                                ],
                                content: `${sender} | ${recipient},`
                            })

                        })

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Trade Canceled')
                                .setColor('0xa744f2')
                            ],
                            components: []
                        })
                        collectorSender.stop()
                    }
                })

                collectorSender.on('end', () => {
                    if (collected === true) return

                    confirmSenderMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Trade Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })

                })

            }
        } else if (senderAmount && recipientAmount && recipientItem && senderItem) {

            const invCheckSender = await invSchema.findOne({
                userId: sender.id,
                itemId: itemFoundYour.id
            })
            const invCheckRecipient = await invSchema.findOne({
                userId: recipient.id,
                itemId: itemFoundThem.id
            })
            if (recipientItem === senderItem) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Whats the point of trading 2 of the same item?')
                    .setColor('0xa744f2')
                ]
            })
            if (!invCheckSender || invCheckSender.amount < senderAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You do not have enough of this item to perform this trade')
                    .setColor('0xa744f2')
                ]
            })
            if (!invCheckRecipient || invCheckRecipient.amount < recipientAmount) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('They do not have enough of this item to perform this trade')
                    .setColor('0xa744f2')
                ]
            })

            const confirmSenderEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                }, {
                    name: `${recipient.tag} gives`,
                    value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                })
                .setFooter({
                    text: `You have 30 seconds to confirm`
                })

            const confirmRecipientEmbed = new MessageEmbed()
                .setTitle('Confirm Trade')
                .setColor('0xa744f2')
                .setFields({
                    name: 'You give',
                    value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                }, {
                    name: `${sender.tag} gives`,
                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                })
                .setFooter({
                    text: `You have 2 minutes to confirm`
                })

            const confirmSenderButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-sender')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-sender')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            const confirmRecipientButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('confirm-trade-recipient')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('cancel-trade-recipient')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                )

            const confirmSenderMessage = await interaction.reply({
                embeds: [confirmSenderEmbed],
                components: [confirmSenderButtons],
                fetchReply: true,
                content: `${sender},`
            })

            const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                type: 'BUTTON',
                time: 30000
            })

            let collected = false
            collectorSender.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return i.reply({
                    content: 'You are not owner of this button!',
                    ephemeral: true,
                })
                if (i.customId === 'confirm-trade-sender') {
                    collected = true

                    confirmSenderButtons.components[0].setDisabled(true)
                    confirmSenderButtons.components[1].setDisabled(true)
                    confirmSenderEmbed.setTitle('Confirmed Trade')
                    confirmSenderEmbed.setColor('DARK_GREEN')
                    confirmSenderMessage.edit({
                        components: [confirmSenderButtons],
                        embeds: [confirmSenderEmbed]
                    })
                    i.deferUpdate()

                    const confirmRecipientMessage = await confirmSenderMessage.reply({
                        embeds: [confirmRecipientEmbed],
                        components: [confirmRecipientButtons],
                        content: `${recipient},`,
                        fetchReply: true
                    })

                    const tradeAwait = await checkTradeSchema.create({
                        userId: sender.id,
                        inTradeWithId: recipient.id,
                        message: confirmRecipientMessage.url
                    })

                    const collectorRecipient = await confirmRecipientMessage.createMessageComponentCollector({
                        type: 'BUTTON',
                        time: 120000
                    })

                    let collected2 = false
                    collectorRecipient.on('collect', async (i) => {
                        functions.createRecentCommand(sender.id, 'trade', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                        functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                        functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                        if (i.user.id !== recipient.id) return i.reply({
                            content: 'This is not your trade',
                            ephemeral: true
                        })

                        if (i.customId === 'confirm-trade-recipient') {
                            tradeAwait.delete()
                            collected2 = true

                            const checkTheirInv1 = await invSchema.findOne({
                                userId: recipient.id,
                                itemId: itemFoundYour.id
                            })
                            if (!checkTheirInv1) {
                                invSchema.create({
                                    userId: recipient.id,
                                    itemId: itemFoundYour.id,
                                    item: itemFoundYour.name,
                                    emoji: itemFoundYour.emoji,
                                    amount: senderAmount
                                })
                            } else {
                                checkTheirInv1.amount += senderAmount
                                checkTheirInv1.save()
                            }

                            const checkYourInv1 = await invSchema.findOne({
                                userId: sender.id,
                                itemId: itemFoundThem.id
                            })
                            if (!checkYourInv1) {
                                invSchema.create({
                                    userId: sender.id,
                                    itemId: itemFoundThem.id,
                                    item: itemFoundThem.name,
                                    emoji: itemFoundThem.emoji,
                                    amount: recipientAmount
                                })
                            } else {
                                checkYourInv1.amount += recipientAmount
                                checkYourInv1.save()
                            }
                            const checkTheirInv2 = await invSchema.findOne({
                                userId: recipient.id,
                                itemId: itemFoundThem.id
                            })
                            if (checkTheirInv2.amount - recipientAmount === 0) checkTheirInv2.delete()
                            else checkTheirInv2.amount -= recipientAmount;
                            checkTheirInv2.save()

                            const checkYourInv2 = await invSchema.findOne({
                                userId: sender.id,
                                itemId: itemFoundYour.id
                            })
                            if (checkYourInv2.amount - senderAmount === 0) checkYourInv2.delete()
                            else checkYourInv2.amount -= senderAmount;
                            checkYourInv2.save()

                            confirmRecipientMessage.reply({
                                content: `${sender} | ${recipient},`,
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Trade Successful')
                                    .setColor('0xa744f2')
                                    .setFields({
                                        name: `${recipient.tag} gave`,
                                        value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                                    }, {
                                        name: `${sender.tag} gave`,
                                        value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                    })
                                ]
                            })

                            confirmRecipientButtons.components[0].setDisabled(true)
                            confirmRecipientButtons.components[1].setDisabled(true)
                            confirmRecipientEmbed.setTitle('Confirmed Trade')
                            confirmRecipientEmbed.setColor('DARK_GREEN')
                            confirmRecipientMessage.edit({
                                components: [confirmRecipientButtons],
                                embeds: [confirmRecipientEmbed]
                            })
                            i.deferUpdate()

                        } else if (i.customId === 'cancel-trade-recipient') {
                            collected2 = true
                            tradeAwait.delete()

                            confirmRecipientMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Trade Canceled')
                                    .setColor('0xa744f2')
                                ],
                                components: []
                            })
                            collectorRecipient.stop()
                            functions.createRecentCommand(sender.id, 'trade', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                        }
                    })

                    collectorRecipient.on('end', () => {
                        if (collected2 === true) return
                        tradeAwait.delete()

                        confirmRecipientEmbed
                            .setTitle('Trade Canceled')
                            .setColor('0xff0000')

                        confirmRecipientButtons.components[0].setDisabled(true)
                        confirmRecipientButtons.components[1].setDisabled(true)

                        confirmRecipientMessage.edit({
                            embeds: [confirmRecipientEmbed],
                            components: [confirmRecipientButtons]
                        })
                        confirmRecipientMessage.reply({
                            embeds: [
                                new MessageEmbed()
                                .setColor('0xff0000')
                                .setTitle('Trade Canceled')
                                .setDescription('You were idle too long')
                            ],
                            content: `${sender} | ${recipient},`
                        })

                    })

                } else if (i.customId === 'cancel-trade-sender') {
                    collected = true

                    confirmSenderMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Trade Canceled')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })
                    collectorSender.stop()
                }
            })

            collectorSender.on('end', () => {
                if (collected === true) return

                confirmSenderMessage.edit({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Trade Canceled')
                        .setDescription('You were idle for too long')
                        .setColor('0xa744f2')
                    ],
                    components: []
                })

            })

        }
    }
}