const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const blockSchema = require('../../models/blockedUsers')
const items = require('../../things/items/allItems')
const profileSchema = require('../../models/userProfile')
const invSchema = require('../../models/inventorySchema')
const checkTradeSchema = require('../../models/checkTrade')
const allItems = require('../../things/items/allItems')
/**
 * TODO Gifting
 * TODO Item trade
 * TODO Coin trade
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDMPermission(false)
        .setDescription('Trade items or coins with another user')
        .addSubcommand(option =>
            option.setName('items')
            .setDescription('Trade items with another user')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('The user to trade with')
                .setRequired(true)
            )

            .addIntegerOption(option =>
                option.setName('your-amount')
                .setDescription('The amount of your coins/items to trade')
                .setRequired(true)
                .setMinValue(1)
            )

            .addIntegerOption(option =>
                option.setName('their-amount')
                .setDescription('The amount of their coins/items to trade')
                .setRequired(true)
                .setMinValue(1)
            )

            .addStringOption(option =>
                option.setName('your-item')
                .setDescription('Your item to trade')
                .setRequired(false)
                .setMaxLength(25)
                .setAutocomplete(true)
            )

            .addStringOption(option =>
                option.setName('their-item')
                .setDescription('Their item to trade')
                .setRequired(false)
                .setMaxLength(25)
                .setAutocomplete(true)
            )
        )

        .addSubcommand(option =>
            option.setName('coins')
            .setDescription('Gift someone coins')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('The user to gift')
                .setRequired(true)
            )

            .addIntegerOption(option =>
                option.setName('amount')
                .setDescription('The amount of coins to give the user')
                .setRequired(true)
                .setMinValue(1)
            )

        )

        .addSubcommand(option =>
            option.setName('gift')
            .setDescription('Gift someone an item')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('The user to gift')
                .setRequired(true)
            )

            .addIntegerOption(option =>
                option.setName('amount')
                .setDescription('The amount of the item to give')
                .setRequired(true)
                .setMinValue(1)
            )

            .addStringOption(option =>
                option.setName('item')
                .setDescription('The item to gift')
                .setRequired(true)
                .setMaxLength(25)
                .setAutocomplete(true)
            )
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item' || focusedOption.name === 'your-item' || focusedOption.name === 'their-item') {
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
        const cldn = await functions.cooldownCheck(interaction.user.id, 'trade', 35, interaction)
        if (cldn === true) return

        const user1 = interaction.options.getUser('target')
        const user2 = interaction.user

        const checkBlock1 = await blockSchema.findOne({
            blockedById: user1.id,
            blockedUserId: user2.id
        })
        const checkBlock2 = await blockSchema.findOne({
            blockedById: user2.id,
            blockedUserId: user1.id
        })
        if (checkBlock1) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('This user has blocked you')
                .setColor('0xa744f2')
            ]
        })
        if (checkBlock2) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You have blocked this user')
                .setColor('0xa744f2')
            ]
        })

        const checkForPassive1 = await profileSchema.findOne({
            userId: user2.id
        })
        const checkForPassive2 = await profileSchema.findOne({
            userId: user1.id
        })
        if (checkForPassive1.passive === true) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You are in passive mode')
                .setDescription('While in this mode you are unable to trade')
                .setFooter({
                    text: `Disable it in the settings menu`
                })
                .setColor('0xa477fc')
            ]
        })
        if (checkForPassive2.passive === true) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('This user is in passive mode')
                .setColor('0xa477fc')
            ]
        })

        if (interaction.options.getSubcommand() === 'items') {
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
                    new EmbedBuilder()
                    .setTitle('You are in a trade already')
                    .setColor('0xa744f2')
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Go to the trade')
                        .setStyle('Link')
                        .setURL(`${checkExisting1.message}`)
                    )
                ]
            })
            if (checkExisting2) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You are in a trade already')
                    .setColor('0xa744f2')
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Go to the trade')
                        .setStyle('Link')
                        .setURL(`${checkExisting2.message}`)
                    )
                ]
            })
            if (checkExisting3) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Someone is trying to trade with you')
                    .setColor('0xa744f2')
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Go to the trade')
                        .setStyle('Link')
                        .setURL(`${checkExisting3.message}`)
                    )
                ]
            })
            if (checkExisting4) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Someone is trying to trade with you')
                    .setColor('0xa744f2')
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Go to the trade')
                        .setStyle('Link')
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

            if (recipient.id === sender.id) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('0xa744f2')
                    .setTitle('You can\'t trade with yourself')
                ]
            })

            if (senderAmount < 1 || recipientAmount < 1) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You do not have enough stuff to preform this trade')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (!userProfileRecipient) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That user does not have a bot profile')
                    .setColor('0xa744f2')
                ]
            })

            if (senderAmount && recipientAmount && !senderItem && !recipientItem) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You do not have enough coins to perform this trade')
                        .setColor('0xa744f2')
                    ]
                })
                if (!checkTheirInv) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0xa744f2')
                        .setTitle('This user does not have that item')
                    ]
                })
                if (checkTheirInv.amount < recipientAmount) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0xa744f2')
                        .setTitle('This user does not have enough of that item to perform the trade')
                    ]
                })

                const confirmSenderEmbed = new EmbedBuilder()
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

                const confirmRecipientEmbed = new EmbedBuilder()
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

                const confirmSenderButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-sender')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-sender')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                const confirmRecipientButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-recipient')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-recipient')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                if (checkTheirInv.amount - recipientAmount === 0) {
                    const confirmSenderMessage = await interaction.reply({
                        embeds: [confirmSenderEmbed],
                        components: [confirmSenderButtons],
                        fetchReply: true,
                        content: `${sender},`
                    })

                    const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                        type: 'Button',
                        time: 30000
                    })

                    let collected = false
                    collectorSender.on('collect', async (i) => {
                        if (i.user.id !== interaction.user.id) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('This is not for you')
                                .setColor('0xa477fc')
                            ],
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
                                type: 'Button',
                                time: 120000
                            })

                            let collected2 = false
                            collectorRecipient.on('collect', async (i) => {
                                if (i.user.id !== recipient.id) return i.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('This is not for you')
                                        .setColor('0xa477fc')
                                    ],
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
                                            new EmbedBuilder()
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
                                    functions.createRecentCommand(sender.id, 'trade-items', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)

                                } else if (i.customId === 'cancel-trade-recipient') {
                                    collected2 = true
                                    tradeAwait.delete()

                                    confirmRecipientMessage.edit({
                                        embeds: [
                                            new EmbedBuilder()
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
                                        new EmbedBuilder()
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
                                    new EmbedBuilder()
                                    .setTitle('Trade Canceled')
                                    .setColor('0xa744f2')
                                ],
                                components: []
                            })
                            collectorSender.stop()
                            functions.createRecentCommand(sender.id, 'trade-items', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                        }
                    })

                    collectorSender.on('end', () => {
                        if (collected === true) return

                        confirmSenderMessage.edit({
                            embeds: [
                                new EmbedBuilder()
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
                        type: 'Button',
                        time: 30000
                    })

                    let collected = false
                    collectorSender.on('collect', async (i) => {
                        if (i.user.id !== interaction.user.id) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('This is not for you')
                                .setColor('0xa477fc')
                            ],
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
                                type: 'Button',
                                time: 120000
                            })

                            let collected2 = false
                            collectorRecipient.on('collect', async (i) => {
                                if (i.user.id !== recipient.id) return i.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('This is not for you')
                                        .setColor('0xa477fc')
                                    ],
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

                                    functions.createRecentCommand(sender.id, 'trade-items', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                                    functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                                    functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                                    confirmRecipientMessage.reply({
                                        content: `${sender} | ${recipient},`,
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('Trade Successful')
                                            .setColor('0xa744f2')
                                            .setFields({
                                                name: `${sender.tag} gave`,
                                                value: `${itemFoundThem.emoji} ${itemFoundThem.name} (\`${recipientAmount.toLocaleString()}\`)`
                                            }, {
                                                name: `${recipient.tag} gave`,
                                                value: `\`${senderAmount.toLocaleString()}\` coins`
                                            })
                                        ]
                                    })

                                } else if (i.customId === 'cancel-trade-recipient') {
                                    collected2 = true
                                    tradeAwait.delete()

                                    confirmRecipientMessage.edit({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('Trade Canceled')
                                            .setColor('0xa744f2')
                                        ],
                                        components: []
                                    })
                                    collectorRecipient.stop()
                                    functions.createRecentCommand(sender.id, 'trade-items', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                                }
                            })

                            collectorRecipient.on('end', () => {
                                if (collected2 === true) return
                                tradeAwait.delete()

                                confirmRecipientMessage.edit({
                                    embeds: [
                                        new EmbedBuilder()
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
                                    new EmbedBuilder()
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
                                new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('That user does not have enough coins to perform this trade')
                        .setColor('0xa744f2')
                    ]
                })
                if (!checkYourInv) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0xa744f2')
                        .setTitle('You don\'t have that item')
                    ]
                })
                if (checkYourInv.amount < senderAmount) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0xa744f2')
                        .setTitle('You do not have enough of that item to perform the trade')
                    ]
                })

                const confirmSenderEmbed = new EmbedBuilder()
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

                const confirmRecipientEmbed = new EmbedBuilder()
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

                const confirmSenderButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-sender')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-sender')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                const confirmRecipientButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-recipient')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-recipient')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                if (checkYourInv.amount - senderAmount === 0) {
                    const confirmSenderMessage = await interaction.reply({
                        embeds: [confirmSenderEmbed],
                        components: [confirmSenderButtons],
                        fetchReply: true,
                        content: `${sender},`
                    })

                    const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                        type: 'Button',
                        time: 30000
                    })

                    let collected = false
                    collectorSender.on('collect', async (i) => {
                        if (i.user.id !== interaction.user.id) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('This is not for you')
                                .setColor('0xa477fc')
                            ],
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
                                type: 'Button',
                                time: 120000
                            })

                            let collected2 = false
                            collectorRecipient.on('collect', async (i) => {
                                functions.createRecentCommand(sender.id, 'trade-items', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                                functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                                functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                                if (i.user.id !== recipient.id) return i.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('This is not for you')
                                        .setColor('0xa477fc')
                                    ],
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
                                            new EmbedBuilder()
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
                                            new EmbedBuilder()
                                            .setTitle('Trade Canceled')
                                            .setColor('0xa744f2')
                                        ],
                                        components: []
                                    })
                                    collectorRecipient.stop()
                                    functions.createRecentCommand(sender.id, 'trade-items', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
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
                                        new EmbedBuilder()
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
                                    new EmbedBuilder()
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
                                new EmbedBuilder()
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
                        type: 'Button',
                        time: 30000
                    })

                    let collected = false
                    collectorSender.on('collect', async (i) => {
                        if (i.user.id !== interaction.user.id) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('This is not for you')
                                .setColor('0xa477fc')
                            ],
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
                                type: 'Button',
                                time: 120000
                            })

                            let collected2 = false
                            collectorRecipient.on('collect', async (i) => {
                                functions.createRecentCommand(sender.id, 'trade-items', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                                functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                                functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                                if (i.user.id !== recipient.id) return i.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('This is not for you')
                                        .setColor('0xa477fc')
                                    ],
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
                                            new EmbedBuilder()
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
                                            new EmbedBuilder()
                                            .setTitle('Trade Canceled')
                                            .setColor('0xa744f2')
                                        ],
                                        components: []
                                    })
                                    collectorRecipient.stop()
                                    functions.createRecentCommand(sender.id, 'trade-items', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
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
                                        new EmbedBuilder()
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
                                    new EmbedBuilder()
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
                                new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('Whats the point of trading 2 of the same item?')
                        .setColor('0xa744f2')
                    ]
                })
                if (!invCheckSender || invCheckSender.amount < senderAmount) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You do not have enough of this item to perform this trade')
                        .setColor('0xa744f2')
                    ]
                })
                if (!invCheckRecipient || invCheckRecipient.amount < recipientAmount) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('They do not have enough of this item to perform this trade')
                        .setColor('0xa744f2')
                    ]
                })

                const confirmSenderEmbed = new EmbedBuilder()
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

                const confirmRecipientEmbed = new EmbedBuilder()
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

                const confirmSenderButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-sender')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-sender')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                const confirmRecipientButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-trade-recipient')
                        .setLabel('Confirm')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel-trade-recipient')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'Button',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
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
                            type: 'Button',
                            time: 120000
                        })

                        let collected2 = false
                        collectorRecipient.on('collect', async (i) => {
                            functions.createRecentCommand(sender.id, 'trade-items', `USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
                            functions.createNewNotif(sender.id, `Trade Successful with ${recipient} (They gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for your \`${senderAmount.toLocaleString()}\` coins)`)
                            functions.createNewNotif(recipient.tag, `Trade Successful with ${sender} (You gave \`${recipientAmount.toLocaleString()}\` ${itemFoundYour.emoji} ${itemFoundYour.name} for their \`${senderAmount.toLocaleString()}\` coins)`)
                            if (i.user.id !== recipient.id) return i.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('This is not for you')
                                    .setColor('0xa477fc')
                                ],
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
                                        new EmbedBuilder()
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
                                        new EmbedBuilder()
                                        .setTitle('Trade Canceled')
                                        .setColor('0xa744f2')
                                    ],
                                    components: []
                                })
                                collectorRecipient.stop()
                                functions.createRecentCommand(sender.id, 'trade-items', `[CANCELED] USER: ${recipient} | YOURAMOUNT: ${senderAmount} | THEIRAMOUNT: ${recipientAmount} | YOUITEM: ${senderItem || 'None'} | THEIRITEM: ${recipientItem || 'None'}`, interaction)
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
                                    new EmbedBuilder()
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
                                new EmbedBuilder()
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
                            new EmbedBuilder()
                            .setTitle('Trade Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })

                })

            }
        } else if (interaction.options.getSubcommand() === 'coins') {
            const recipient = interaction.options.getUser('target')
            const sender = interaction.user

            const amount = interaction.options.getInteger('amount')

            const senderProfile = await profileSchema.findOne({
                userId: sender.id
            })
            const recipientProfile = await profileSchema.findOne({
                userId: recipient.id
            })

            if (recipient.id === sender.id) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Could not gift coins')
                    .setColor('0xa744f2')
                    .setDescription(`You cannot gift yourself`)
                ],
                ephemeral: true
            })

            if (!recipientProfile) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Could not gift coins')
                    .setColor('0xa744f2')
                    .setDescription(`${recipient} does not have a bot profile`)
                ],
                ephemeral: true
            })
            if (!senderProfile) {
                await profileSchema.create({
                    userId: sender.id
                })

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Could not gift coins')
                        .setColor('0xa744f2')
                        .setDescription(`You do not have enough to do this`)
                    ],
                    ephemeral: true
                })
            }
            if (amount < 100) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Could not gift coins')
                    .setColor('0xa744f2')
                    .setDescription(`You cannot send less than 100 coins`)
                ],
                ephemeral: true
            })
            if (amount > senderProfile.wallet) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Could not gift coins')
                    .setColor('0xa744f2')
                    .setDescription(`You do not have enough money to do this`)
                ],
                ephemeral: true
            })

            const confirmMessage = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Are you sure?')
                    .setDescription(`You are about to gift ${recipient} \`${amount}\` coins`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('confirm-send')
                        .setLabel('Confirm')
                        .setStyle('Danger'),

                        new ButtonBuilder()
                        .setCustomId('cancel-send')
                        .setLabel('Cancel')
                        .setStyle('Success')
                    )
                ],
                fetchReply: true
            })

            const confirmCollector = await confirmMessage.createMessageComponentCollector({
                type: 'Button',
                time: 10000
            })
            let collected = false
            confirmCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true,
                    })

                if (i.customId === 'confirm-send') {
                    collected = true
                    senderProfile.wallet -= amount
                    senderProfile.save()

                    recipientProfile.wallet += amount
                    recipientProfile.save()

                    let failedSender = false
                    if (senderProfile.dmNotifs === true) {
                        await sender.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('You just gifted some coins')
                                .setColor('0xa744f2')
                                .setDescription(`You just sent ${recipient} \`${amount.toLocaleString()}\` coins`)
                            ]
                        }).catch(e => {
                            failedSender = true
                        })
                    }
                    confirmMessage.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You just gifted some coins')
                            .setColor('0xa744f2')
                            .setDescription(`You just sent ${recipient} \`${amount.toLocaleString()}\` coins`)
                        ],
                        components: []
                    })
                    let failedRecipient = false
                    if (recipientProfile.dmNotifs === true) {
                        await recipient.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('You just got gifted some coins')
                                .setColor('0xa744f2')
                                .setDescription(`${sender} just sent you \`${amount.toLocaleString()}\` coins`)
                            ]
                        }).catch(e => {
                            failedRecipient = true
                        })
                    }

                    functions.createRecentCommand(interaction.user.id, `trade-coins`, `USERTO: ${recipient.id} | AMOUNT: ${amount.toLocaleString()}`, interaction)
                    functions.createNewNotif(sender.id, `You just sent ${recipient} \`${amount.toLocaleString()}\` coins`)
                    functions.createNewNotif(recipient.id, `${sender} sent you \`${amount.toLocaleString()}\` coins`)
                } else if (i.customId === 'cancel-send') {
                    collected = true
                    confirmMessage.edit({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Action Canceled')
                            .setDescription('You canceled')
                            .setColor('0xa744f2')
                        ]
                    })
                }
            })
            confirmCollector.on('end', () => {
                if (collected === false) {
                    confirmMessage.edit({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Action Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ]
                    })
                }
            })

        } else if (interaction.options.getSubcommand() === 'gift') {

            const recipient = interaction.options.getUser('target')
            const sender = interaction.user
            const senderAmount = interaction.options.getInteger('amount')
            const senderItem = interaction.options.getString('item')

            if (recipient.id === sender.id) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t gift yourself')
                    .setColor('0xa744f2')
                ]
            })

            const userProfileSender = await profileSchema.findOne({
                userId: sender.id
            })
            const userProfileRecipient = await profileSchema.findOne({
                userId: recipient.id
            })

            if (!userProfileSender) {
                profileSchema.create({
                    userId: sender.id
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You do not have this item')
                        .setColor('0xa744f2')
                    ]
                })
            }
            if (!userProfileRecipient) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That user does not have a bot profile')
                    .setColor('0xa744f2')
                ]
            })

            let itemQueryYou
            if (interaction.options.getString('item')) {
                itemQueryYou = interaction.options.getString('item')
                itemQueryYou = itemQueryYou.toLowerCase()
                const searchYour = !!items.find((value) => value.id === itemQueryYou)
                if (!searchYour) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('I could not find an item with that ID')
                        .setColor('0xa744f2')
                    ]
                })
            }

            const itemFoundYour = items.find((value) => value.id === itemQueryYou)

            const checkYourInv = await invSchema.findOne({
                userId: sender.id,
                itemId: itemFoundYour.id
            })

            if (!checkYourInv) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('0xa744f2')
                    .setTitle('You don\'t have that item')
                ]
            })
            if (checkYourInv.amount < senderAmount) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('0xa744f2')
                    .setTitle('You do not have enough of that item to perform the trade')
                ]
            })

            const confirmSenderEmbed = new EmbedBuilder()
                .setTitle('Confirm Gift')
                .setColor('0xa744f2')
                .setFields({
                    name: `You give ${recipient.tag}`,
                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                })
                .setFooter({
                    text: `You have 30 seconds to confirm`
                })


            const confirmSenderButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('confirm-trade-sender')
                    .setLabel('Confirm')
                    .setStyle('Success'),

                    new ButtonBuilder()
                    .setCustomId('cancel-trade-sender')
                    .setLabel('Cancel')
                    .setStyle('Danger')
                )

            if (checkYourInv.amount - senderAmount === 0) {
                const confirmSenderMessage = await interaction.reply({
                    embeds: [confirmSenderEmbed],
                    components: [confirmSenderButtons],
                    fetchReply: true,
                    content: `${sender},`
                })

                const collectorSender = await confirmSenderMessage.createMessageComponentCollector({
                    type: 'Button',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        functions.createRecentCommand(sender.id, 'gift-items', `USER: ${recipient} | AMOUNT: ${senderAmount} | ITEM: ${senderItem || 'None'}`, interaction)
                        functions.createNewNotif(sender.id, `You gifted ${recipient} ${senderAmount} ${itemFoundYour.emoji} ${itemFoundYour.name}`)
                        functions.createNewNotif(recipient.id, `You were gifted ${senderAmount} ${itemFoundYour.emoji} ${itemFoundYour.name} by ${sender}`)
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Gift')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()
                        checkYourInv.delete()

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

                        confirmSenderMessage.reply({
                            content: `${sender} | ${recipient},`,
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Gift Successful')
                                .setColor('0xa744f2')
                                .setFields({
                                    name: `${sender.tag} gave ${recipient.tag}`,
                                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                })
                            ]
                        })
                        try {
                            recipient.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('You have been given a gift!')
                                    .setColor('0xa744f2')
                                    .setFields({
                                        name: `${sender.tag} gave you`,
                                        value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                    })
                                ]
                            })
                        } catch {}

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new EmbedBuilder()
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
                            new EmbedBuilder()
                            .setTitle('Gift Canceled')
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
                    type: 'Button',
                    time: 30000
                })

                let collected = false
                collectorSender.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true,
                    })
                    if (i.customId === 'confirm-trade-sender') {
                        functions.createRecentCommand(sender.id, 'gift-items', `USER: ${recipient} | AMOUNT: ${senderAmount} | ITEM: ${senderItem || 'None'}`, interaction)
                        functions.createNewNotif(sender.id, `You gifted ${recipient} ${senderAmount} ${itemFoundYour.emoji} ${itemFoundYour.name}`)
                        functions.createNewNotif(recipient.id, `You were gifted ${senderAmount} ${itemFoundYour.emoji} ${itemFoundYour.name} by ${sender}`)
                        collected = true

                        confirmSenderButtons.components[0].setDisabled(true)
                        confirmSenderButtons.components[1].setDisabled(true)
                        confirmSenderEmbed.setTitle('Confirmed Gift')
                        confirmSenderEmbed.setColor('DARK_GREEN')
                        confirmSenderMessage.edit({
                            components: [confirmSenderButtons],
                            embeds: [confirmSenderEmbed]
                        })
                        i.deferUpdate()

                        checkYourInv.amount -= senderAmount
                        checkYourInv.save()

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
                            checkTheirInv.save()
                        }

                        i.deferUpdate()
                        confirmSenderMessage.reply({
                            content: `${sender} | ${recipient},`,
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Gift Successful')
                                .setColor('0xa744f2')
                                .setFields({
                                    name: `${sender.tag} gave ${recipient.tag}`,
                                    value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                })
                            ]
                        })

                        try {
                            recipient.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('You have been given a gift!')
                                    .setColor('0xa744f2')
                                    .setFields({
                                        name: `${sender.tag} gave you`,
                                        value: `${itemFoundYour.emoji} ${itemFoundYour.name} (\`${senderAmount.toLocaleString()}\`)`
                                    })
                                ]
                            })
                        } catch {}

                    } else if (i.customId === 'cancel-trade-sender') {
                        collected = true

                        confirmSenderMessage.edit({
                            embeds: [
                                new EmbedBuilder()
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
                            new EmbedBuilder()
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
}