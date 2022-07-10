const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const blockSchema = require('../models/blockedUsers')

module.exports = {
    name: 'balance',
    description: 'Manage your bot coins',
    category: 'Economy',
    slash: true,
    guildOnly: true,
    options: [{
            name: 'transfer',
            description: 'Give some of your money to another user',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'user',
                    description: 'The user to transfer money to',
                    type: 'USER',
                    required: 'true',
                },
                {
                    name: 'amount',
                    description: 'The amount to transfer',
                    type: 'INTEGER',
                    required: true,
                },
                {
                    name: 'message',
                    description: 'The message to send with the money',
                    type: 'STRING',
                    required: false,
                },
            ],
        },
        {
            name: 'deposit',
            description: 'Deposit coins into your bank',
            type: 'SUB_COMMAND',
            options: [{
                name: 'amount',
                description: 'The amount to move (put 0 to move max)',
                type: 'INTEGER',
                required: true,
            }, ]
        },
        {
            name: 'withdraw',
            description: 'Withdraw coins from your bank',
            type: 'SUB_COMMAND',
            options: [{
                name: 'amount',
                description: 'The amount to move (put 0 to move all)',
                type: 'INTEGER',
                required: true,
            }, ]
        },
        {
            name: 'view',
            description: 'View your balance',
            type: 'SUB_COMMAND'
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
        const cldn = await functions.cooldownCheck(interaction.user.id, 'balance', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'transfer') {
            const recipient = interaction.options.getUser('user')
            const sender = interaction.user

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


            const amount = interaction.options.getInteger('amount')
            let message = interaction.options.getString('message') || `${sender} didn't want to give you a message so rip`
            message = message.slice(0, 100)

            const senderProfile = await profileSchema.findOne({
                userId: sender.id
            })
            const recipientProfile = await profileSchema.findOne({
                userId: recipient.id
            })

            if (!recipientProfile) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Could not send coins')
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
                        new MessageEmbed()
                        .setTitle('Could not send coins')
                        .setColor('0xa744f2')
                        .setDescription(`You do not have enough to do this`)
                    ],
                    ephemeral: true
                })
            }
            if (amount < 100) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Could not send coins')
                    .setColor('0xa744f2')
                    .setDescription(`You cannot send less than 100 coins`)
                ],
                ephemeral: true
            })
            if (amount > senderProfile.wallet) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Could not send coins')
                    .setColor('0xa744f2')
                    .setDescription(`You do not have enough money to do this`)
                ],
                ephemeral: true
            })

            const confirmMessage = await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Are you sure?')
                    .setDescription(`You are about to send ${recipient} \`${amount}\` coins`)
                ],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setCustomId('confirm-send')
                        .setLabel('Confirm')
                        .setStyle('DANGER'),

                        new MessageButton()
                        .setCustomId('cancel-send')
                        .setLabel('Cancel')
                        .setStyle('SUCCESS')
                    )
                ],
                fetchReply: true
            })

            const confirmCollector = await confirmMessage.createMessageComponentCollector({
                type: 'BUTTON',
                time: 10000
            })
            let collected = false
            confirmCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
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
                                new MessageEmbed()
                                .setTitle('You just gifted some coins')
                                .setColor('0xa744f2')
                                .setDescription(`You just sent ${recipient} \`${amount.toLocaleString()}\` coins\nMessage: ${message}`)
                            ]
                        }).catch(e => {
                            failedSender = true
                        })
                    }
                    confirmMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('You just gifted some coins')
                            .setColor('0xa744f2')
                            .setDescription(`You just sent ${recipient} \`${amount.toLocaleString()}\` coins\nMessage: ${message}`)
                        ],
                        components: []
                    })
                    let failedRecipient = false
                    if (recipientProfile.dmNotifs === true) {
                        await recipient.send({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('You just got given some coins')
                                .setColor('0xa744f2')
                                .setDescription(`${sender} just sent you \`${amount.toLocaleString()}\` coins\nTheir message: ${message}`)
                            ]
                        }).catch(e => {
                            failedRecipient = true
                        })
                    }

                    functions.createRecentCommand(interaction.user.id, `balance-transfer`, `USERTO: ${recipient.id} | AMOUNT: ${amount.toLocaleString()}`, interaction)
                    functions.createNewNotif(sender.id, `You just sent ${recipient} \`${amount.toLocaleString()}\` coins\nMessage: ${message}`)
                    functions.createNewNotif(recipient.id, `${sender} just sent you \`${amount.toLocaleString()}\` coins\nTheir message: ${message}`)
                } else if (i.customId === 'cancel-send') {
                    collected = true
                    confirmMessage.edit({
                        components: [],
                        embeds: [
                            new MessageEmbed()
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
                            new MessageEmbed()
                            .setTitle('Action Canceled')
                            .setDescription('You were idle for too long')
                            .setColor('0xa744f2')
                        ]
                    })
                }
            })

        } else if (interaction.options.getSubcommand() === 'deposit') {
            functions.createRecentCommand(interaction.user.id, `balance-deposit`, `AMOUNT: ${interaction.options.getInteger('amount')}`, interaction)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            const amountToMove = interaction.options.getInteger('amount')
            if (!userProfile) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You don\'t have enough in your wallet to do this')
                        .setColor('0xa744f2')
                    ],
                    ephemeral: true
                })

                profileSchema.create({
                    userId: interaction.user.id
                })
            }
            if (amountToMove > userProfile.wallet) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You can\'t move more than your wallet balance.')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.wallet <= 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You don\'t have enough in your wallet to do this')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (amountToMove < 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You can\'t move less than 0 coins')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.bank + amountToMove > userProfile.maxBank) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You don\'t have enough bank space to do this')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })

            if (amountToMove === 0) {
                var amountMove = userProfile.maxBank - userProfile.bank
                if (amountMove >= userProfile.wallet) {

                    amountMove = userProfile.wallet
                }
            } else {
                amountMove = amountToMove
            }

            userProfile.wallet -= amountMove
            userProfile.bank += amountMove
            await userProfile.save()
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Deposited Coins')
                    .addField('Wallet', `\`${userProfile.wallet.toLocaleString()}\``, true)
                    .addField('Bank', `\`${userProfile.bank.toLocaleString()}/${userProfile.maxBank.toLocaleString()}\` (${Math.round(userProfile.bank / userProfile.maxBank * 100)}% full)`, true)
                    .addField('Amount Moved', `\`${amountMove.toLocaleString()}\``)
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'withdraw') {
            functions.createRecentCommand(interaction.user.id, `balance-withdraw`, `AMOUNT: ${interaction.options.getInteger('amount')}`, interaction)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            const amountToMove = interaction.options.getInteger('amount')
            if (!userProfile) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You don\'t have enough in your bank to do this')
                        .setColor('0xa744f2')
                    ],
                    ephemeral: true
                })

                profileSchema.create({
                    userId: interaction.user.id
                })
            }
            if (amountToMove < 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You can\'t move less than 0 coins')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.bank <= 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You don\'t have any coins in your bank')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (amountToMove > userProfile.bank) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You can\'t move more than whats in your bank')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })

            if (amountToMove === 0) {
                var amountMove = userProfile.bank
            } else amountMove = amountToMove

            userProfile.wallet += amountMove
            userProfile.bank -= amountMove
            await userProfile.save()
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Coins Withdrawn')
                    .addField('Wallet', `\`${userProfile.wallet.toLocaleString()}\``, true)
                    .addField('Bank', `\`${userProfile.bank.toLocaleString()}/${userProfile.maxBank.toLocaleString()}\` (${Math.round(userProfile.bank / userProfile.maxBank * 100)}% full)`, true)
                    .addField('Amount Moved', `\`${amountMove.toLocaleString()}\``)
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'view') {
            functions.createRecentCommand(interaction.user.id, `balance-view`, 'None', interaction)
            const result = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!result) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle(`${interaction.user.username}'s balance`)
                        .setColor('0xa744f2')
                        .setDescription(`**Wallet**: \`0\` coins\n**Bank**: \`0\` coins`)
                    ]
                })
                profileSchema.create({
                    userId: interaction.user.id
                })
            } else {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle(`${interaction.user.username}'s balance`)
                        .setColor('0xa744f2')
                        .setDescription(`**Wallet**: \`${result.wallet.toLocaleString()}\` coins\n**Bank**: \`${result.bank.toLocaleString()}\` coins`)
                    ]
                })
            }
        }
    }
}