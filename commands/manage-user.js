const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const commandCooldowns = require('../models/cooldowns')
const invSchema = require('../models/inventorySchema')
const items = require('../items/allItems')

module.exports = {
    name: 'user-manage',
    aliases: [''],
    description: 'Manage a users bot account.',
    category: 'Dev',
    slash: true,
    ownerOnly: true,
    guildOnly: true,
    testOnly: true,
    options: [{
            name: 'item',
            description: 'Give an item to a user.',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'item',
                    description: 'The item to add',
                    type: 'STRING',
                    required: true,
                },
                {
                    name: 'amount',
                    description: 'The amount of the item to give',
                    type: 'INTEGER',
                    required: true
                },
                {
                    name: 'userid',
                    description: 'The user to give the item to',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'action',
                    description: 'The action to perform with the item',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {
                            name: 'Add',
                            value: 'add'
                        },
                        {
                            name: 'Remove',
                            value: 'remove'
                        }
                    ]
                }
            ]
        },
        {
            name: 'dev',
            description: 'Change if a user is a dev or not',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'userid',
                    description: 'The ID of the user',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'dev',
                    description: 'Is this user a dev?',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {
                            name: 'Yes',
                            value: 'true'
                        },
                        {
                            name: 'No',
                            value: 'false'
                        }
                    ]
                }
            ]
        },
        {
            name: 'cooldowns',
            description: 'Reset a users cooldowns',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'userid',
                    description: 'The ID of the user',
                    type: 'STRING',
                    required: true
                },
            ]
        },
        {
            name: 'badge',
            description: 'Manage a users badges',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'action',
                    description: 'The action to perform',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {
                            name: 'Add',
                            value: 'add'
                        },
                        {
                            name: 'Remove',
                            value: 'remove'
                        }
                    ]
                },
                {
                    name: 'userid',
                    description: 'The ID of the user to add/remove the badge from',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'badge',
                    description: 'The badge to add/remove',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {name: 'Developer Badge', value: '<:developer:995407005864955924>'},
                        {name: 'Support Badge', value: '<:Support:995031355878559884>'},
                        {name: 'Partner Badge', value: '<:Partner:995031353810755656>'},
                        {name: 'Beta Server Owner', value: '<:betaUser:995092836879978589>'}

                    ]
                }
            ]
        },
        {
            name: 'wealth',
            description: 'Manage a users coins/xp/level',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'userid',
                    description: 'The user\'s ID',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'action',
                    description: 'The action to perform',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {name: 'Add/Remove', value: '0'},
                        {name: 'Set', value: '1'}
                    ]
                },
                {
                    name: 'amount',
                    description: 'The amount of coins/xp/levels',
                    type: 'INTEGER',
                    required: true
                },
                {
                    name: 'type',
                    description: 'The type of currency',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {name: 'Coins Wallet', value: 'coins-wallet'},
                        {name: 'Coins Bank', value: 'coins-bank'},
                        {name: 'XP', value: 'xp'},
                        {name: 'Level', value: 'level'},
                        {name: 'Required XP', value: 'required-xp'},
                        {name: 'Max Bank Space', value: 'max-bank'},
                        {name: 'Coin Multi', value: 'coin-multi'},
                    ]
                }
            ]
        },
        {
            name: 'lookup',
            description: 'Lookup a user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'userid',
                    description: 'The ID of the user to lookup',
                    type: 'STRING',
                    required: true
                }
            ]
        }

    ],

    callback: async ({
        interaction
    }) => {
        if (interaction.options.getSubcommand() === 'dev') {
            const userId = interaction.options.getString('userid')
            const userProfile = await profileSchema.findOne({userId: userId})
            if (!userProfile) {
                await profileSchema.create({
                    userId: userId,
                    badges: [{_id: "<:developer:995407005864955924>"}],
                    developer: true
                })
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('dev') === 'true' && userProfile.developer === true) return interaction.reply({embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a developer`)]})
            if (interaction.options.getString('dev') === 'false' && userProfile.developer === false) return interaction.reply({embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a developer`)]})
            if (userProfile.developer === true) {
                await profileSchema.updateOne({
                    userId: userId,
                }, {
                    $pull: { badges: { _id: "<:developer:995407005864955924>" } },
                })
                userProfile.developer = false
                userProfile.devMode = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is no longer a developer`)
                        .setColor('0xa744f2')
                    ]
                })

            } else if (userProfile.developer === false) {
                userProfile.badges.push({
                    _id: "<:developer:995407005864955924>",
                })
                userProfile.developer = true
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'cooldowns') {
            const userId = interaction.options.getString('userid')
            const cooldownCheck = await commandCooldowns.findOne({userId: userId})
            if (!cooldownCheck) return interaction.reply({embeds: [new MessageEmbed().setTitle('This user has no cooldowns')]})
            commandCooldowns.collection.deleteMany({userId: userId})
            interaction.reply({embeds: [new MessageEmbed().setTitle('Cooldowns Removed').setDescription(`I have removed all the cooldowns from <@${userId}> (\`${userId}\`)`)]})
        } else if (interaction.options.getSubcommand() === 'badge') {
            if (interaction.options.getString('action') === 'add') {
                const badgeToAdd = interaction.options.getString('badge')
                const userID = interaction.options.getString('userid')

                const badgeAddEmbed = new MessageEmbed()
                    .setTitle('Added badge')
                    .setColor('0xa744f2')

                const result = await profileSchema.findOne({
                    userId: userID
                })
                if (!result) {
                    profileSchema.create({
                        userId: userID,
                        badges: [{
                            _id: badgeToAdd,
                        }]
                    })
                    badgeAddEmbed.setFields({
                        name: 'Badge',
                        value: `${badgeToAdd}`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeAddEmbed]
                    })
                } else {
                    if (!result.badges.find(badgeName => badgeName._id === badgeToAdd)) {
                        result.badges.push({
                            _id: badgeToAdd,
                        })
                        result.save()
                    } else {
                        return interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Could not add badge')
                                .setDescription('This user already has that badge')
                                .setColor('0xa744f2')
                            ]
                        })
                    }

                    badgeAddEmbed.setFields({
                        name: 'Badge',
                        value: `${badgeToAdd}`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeAddEmbed]
                    })
                }
            } else if (interaction.options.getString('action') === 'remove') {
                const badgeToRemove = interaction.options.getString('badge')
                const userID = interaction.options.getString('userid')

                const badgeRemoveEmbed = new MessageEmbed()
                    .setTitle('Removed badge')
                    .setColor('0xa744f2')

                const result = await profileSchema.findOne({
                    userId: userID
                })
                if (!result) {
                    profileSchema.create({
                        userId: userID,
                    })
                    itemRemoveEmbed.setFields({
                        name: 'Badge',
                        value: `${itemToRemove}`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeRemoveEmbed]
                    })
                } else {
                    if (!result.badges.find(badgeName => badgeName._id === badgeToRemove)) {
                        return interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Could not remove badge')
                                .setDescription('This user does not have that badge')
                                .setColor('0xa744f2')
                            ]
                        })
                    } else {
                        await profileSchema.updateOne({
                            userId: userID,
                        }, {
                            $pull: { badges: { _id: badgeToRemove } }
                        })
                    }

                    badgeRemoveEmbed.setFields({
                        name: 'Badge',
                        value: `${badgeToRemove}`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeRemoveEmbed]
                    })
                }
            }
        }  else if (interaction.options.getSubcommand() === 'wealth') {
            const userID = interaction.options.getString('userid')
            const action = interaction.options.getString('action')
            const amount = interaction.options.getInteger('amount')
            const type = interaction.options.getString('type')

            const userProfile = await profileSchema.findOne({userId: userID})

            if (type === 'coins-wallet') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, wallet: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Wallet\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.wallet = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Wallet\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.wallet += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Wallet\``
                            })
                        ]
                    })
                }

            } else if (type === 'coins-bank') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, bank: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Bank\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.bank = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Bank\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.bank += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coins')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            }, {
                                name: 'Where',
                                value: `\`Bank\``
                            })
                        ]
                    })
                }
            } else if (type === 'level') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, level: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.level = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.level += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                }
            } else if (type === 'xp') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, xp: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.xp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.xp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                }
            } else if (type === 'required-xp') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, requiredXp: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added required XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.requiredXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set required XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.requiredXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added required XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                }
            } else if (type === 'max-bank') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, maxBank: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added max bank space')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.maxBank = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set max bank space')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.maxBank += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added max bank space')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                }
            } else if (type === 'coin-multi') {
                if (!userProfile) {
                    await profileSchema.create({userId: userID, coinMulti: amount})
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coin multi')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({text: `This user did not have a bot profile so I created one`})
                        ]
                    })
                } else if (action === '1') {
                    userProfile.coinMulti = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Set coin multi')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                } else if (action === '0') {
                    userProfile.coinMulti += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Added coin multi')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                        ]
                    })
                }
            }
    } else if (interaction.options.getSubcommand() === 'lookup') {
        const result = await profileSchema.findOne({userId: interaction.options.getString('userid')})
        if (!result) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Could not find a user with that ID in my database')
                    .setColor('0xa744f2')
                ]
            })
        }
        var invArray = result.badges.map(x => x._id)
        var invItems = createBadges(invArray).join(' ')

        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Reset')
                .setStyle('DANGER')
                .setCustomId('reset-profile-lookup')
            )

        const resultMessage = await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('User Found')
                .setColor('0xa744f2')
                .setDescription(`**User**: <@${result.userId}> (\`${result.userId}\`)\n**Bio**: ${result.bio}\n**Badges**: ${invItems.length === 0 ? 'None' : invItems}\n**Profile Created**: <t:${Math.round(result.createdAt.getTime() / 1000)}> (<t:${Math.round(result.createdAt.getTime() / 1000)}:R>)`)
                .setFields({
                    name: 'Level',
                    value: `\`${result.level}\``,
                    inline: true
                }, {
                    name: 'XP',
                    value: `\`${result.xp}/${result.requiredXp}\` (\`${Math.round(result.xp / result.requiredXp * 100)}%\`)`,
                    inline: true
                }, {
                    name: 'Balance',
                    value: `Wallet: \`${result.wallet.toLocaleString()}\`\nBank: \`${result.bank.toLocaleString()}/${result.maxBank.toLocaleString()}\` (\`${result.bank / result.maxBank * 100}%\`)\nMultiplier: \`${result.coinMulti.toLocaleString()}%\``,
                    inline: true
                })
            ],
            components: [row1],
            fetchReply: true
        })
        const confirmCollector = await resultMessage.createMessageComponentCollector({
            type: 'BUTTON',
            time: 60000
        })
        confirmCollector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({
                    content: 'You are not owner of this button!',
                    ephemeral: true,
                })

            if (i.customId === 'reset-profile-lookup') {
                    resultMessage.edit({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('This user has been wiped (Including dev status)')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })
                    result.delete()
                    invSchema.collection.deleteMany({userId: result.userId})
                    commandCooldowns.collection.deleteMany({userId: result.userId})
            }
        })
        confirmCollector.on('end', () => {
            resultMessage.edit({components: []})
        })
        function createBadges(array) {
            let numCount = []
            for (var i = 0; i < array.length; i++) {
                if (result.badges.find(badge => badge._id === array[i])) {
                    result.badges.find(badgeName => {
                        let count = parseInt(badgeName.count)
                        if (badgeName._id === array[i]) {
                            numCount.push(count)
                        }
                    })
                }
                continue
            }
    
            let badgeInv = []
            for (var x = 0; x < array.length; x++) {
                badgeInv.push(`${array[x]}`)
            }
    
            return badgeInv
        }
    } else if (interaction.options.getSubcommand() === 'item') {
        let itemQuery = interaction.options.getString('item')
        const search = !!items.find((value) => value.id === itemQuery.toLowerCase())
        if (!search) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('I could not find an item with that ID')
                .setColor('0xa744f2')
            ]
        })
        const itemFound = items.find((value) => value.id === itemQuery.toLowerCase())
        const scanDatabaseForItem = await invSchema.findOne({userId: interaction.options.getString('userid'), itemId: itemQuery.toLowerCase()})
        if (scanDatabaseForItem) {
            if (interaction.options.getString('action') === 'remove') {
                if (scanDatabaseForItem.amount - interaction.options.getInteger('amount') <= 0) {
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Removed item')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'Item',
                                value: `${itemFound.emoji} ${itemFound.name}`,
                                inline: true
                            }, {
                                name: 'Amount',
                                value: `\`${scanDatabaseForItem.amount}\``
                            })
                        ]
                    })
                    scanDatabaseForItem.delete()
                    return
                } else {
                    scanDatabaseForItem.amount -= interaction.options.getInteger('amount')
                    scanDatabaseForItem.save()
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Removed item')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'Item',
                                value: `${itemFound.emoji} ${itemFound.name}`,
                                inline: true
                            }, {
                                name: 'Amount',
                                value: `\`${interaction.options.getInteger('amount')}\``
                            })

                        ]
                    })
                }
            } else {
                scanDatabaseForItem.amount += interaction.options.getInteger('amount')
                scanDatabaseForItem.save()
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Added item')
                        .setColor('0xa744f2')
                        .setFields({
                            name: 'Item',
                            value: `${itemFound.emoji} ${itemFound.name}`,
                            inline: true
                        }, {
                            name: 'Amount',
                            value: `\`${interaction.options.getInteger('amount')}\``
                        })

                    ]
                })
            }
        } else {
            if (interaction.options.getString('action') === 'remove') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You cannot remove an item that they don\'t have')
                    .setColor('0xa744f2')
                ]
            })
            if (interaction.options.getInteger('amount') === 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You cannot add 0 items')
                    .setColor('0xa744f2')
                ]
            })
            invSchema.create({userId: interaction.options.getString('userid'), item: itemFound.name, itemId: itemFound.id, emoji: itemFound.emoji, amount: interaction.options.getInteger('amount')})
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Added item')
                    .setColor('0xa744f2')
                    .setFields({
                        name: 'Item',
                        value: `${itemFound.emoji} ${itemFound.name}`,
                        inline: true
                    }, {
                        name: 'Amount',
                        value: `\`${interaction.options.getInteger('amount')}\``
                    })
                ]
            })
        }
    }
}
}