const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')
const commandCooldowns = require('../../models/cooldowns')
const invSchema = require('../../models/inventorySchema')
const items = require('../../things/items/allItems')
const functions = require('../../commandFunctions')
const robCooldowns = require('../../models/robCooldowns')
const robCooldownsSus = require('../../models/robCooldownsSus')
const reportSchema = require('../../models/reports')
const premiumCodeSchema = require('../../models/premiumCodes')
const notificationSchema = require('../../models/notifications')
const passiveCooldownSchema = require('../../models/passiveCooldowns')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('user-manage')
    .setDescription('Manage the bot')
    .setDMPermission(false)
    .addSubcommand(option => 
        option.setName('item')
        .setDescription('Give/remove an item from a user')
        .addStringOption(option => 
            option.setName('item')
            .setDescription('The item ID') 
            .setRequired(true)
        )
        
        .addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount of the item')
            .setRequired(true)    
        )

        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('action')
            .setDescription('Add/Remove')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Add',
                    value: 'add'
                },
                {
                    name: 'Remove',
                    value: 'remove'
                }
            )
        )
    )

    .addSubcommand(option => 
        option.setName('dev')
        .setDescription('Set a users developer status')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('dev')
            .setDescription('Is this user a developer?')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Yes',
                    value: 'true'
                },
                {
                    name: 'No',
                    value: 'false'
                }
            ) 
        )
    )

    .addSubcommand(option => 
        option.setName('admin')
        .setDescription('Set a users admin status')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('admin')
            .setDescription('Is this user a bot admin?')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Yes',
                    value: 'true'
                },
                {
                    name: 'No',
                    value: 'false'
                }
            ) 
        )
    )

    .addSubcommand(option => 
        option.setName('mod')
        .setDescription('Set a users moderator status')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('mod')
            .setDescription('Is this user a bot moderator?')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Yes',
                    value: 'true'
                },
                {
                    name: 'No',
                    value: 'false'
                }
            ) 
        )
    )

    .addSubcommand(option => 
        option.setName('cooldowns')
        .setDescription('Reset a users cooldowns')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('command')
            .setDescription('The command to clear the cooldown of')
            .setRequired(false)
        )
    )

    .addSubcommand(option => 
        option.setName('cooldowns-fix')
        .setDescription('Try to fix any expired cooldowns')    
    )

    .addSubcommand(option => 
        option.setName('badge')
        .setDescription('Manage a users badges')
        .addStringOption(option => 
            option.setName('action')
            .setDescription('Add/remove the badge')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Add',
                    value: 'add'
                },
                {
                    name: 'Remove',
                    value: 'remove'
                }
            )
        )

        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('badge')
            .setDescription('The badge')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Support Badge',
                    value: '<:SupportBadge:1006813848071843920>'
                },
                {
                    name: 'Partner Badge',
                    value: '<:PartnerBadge:1006699813229842523>'
                },
                {
                    name: 'Bug Hunter Badge',
                    value: '<:BugHunter:1013860134126112818>'
                }
            )
        )
    )

    .addSubcommand(option => 
        option.setName('account')
        .setDescription('Manage a user')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('action')
            .setDescription('The action to perform')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Add/Remove',
                    value: 'addorremove'
                },
                {
                    name: 'Set',
                    value: 'set'
                }
            )
        )

        .addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount')
            .setRequired(true)    
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The type')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Coins Wallet',
                    value: 'coins-wallet'
                },
                {
                    name: 'Coins Bank',
                    value: 'coins-bank'
                },
                {
                    name: 'XP',
                    value: 'xp'
                },
                {
                    name: 'Level',
                    value: 'level'
                },
                {
                    name: 'Required XP',
                    value: 'required-xp'
                },
                {
                    name: 'Max Bank Space',
                    value: 'max-bank'
                },
                {
                    name: 'Coin Multi',
                    value: 'coin-multi'
                },
                {
                    name: 'XP Boost',
                    value: 'xp-boost'
                },
                {
                    name: 'Planet Level',
                    value: 'planet-level'
                },
                {
                    name: 'Planet XP',
                    value: 'planet-xp'
                },
                {
                    name: 'Planet Required XP',
                    value: 'planet-req-xp'
                },
                {
                    name: 'Planet Unlocked Level',
                    value: 'planet-unlocked-level'
                }
            )
        )
    )

    .addSubcommand(option => 
        option.setName('lookup')
        .setDescription('Lookup a user')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )    
    )

    .addSubcommand(option => 
        option.setName('lookup-inventory')
        .setDescription('Lookup a users inventory')
        .addStringOption(option => 
            option.setName('userid')
            .setDescription('The user')
            .setRequired(true)
        )    
    )

    .addSubcommand(option =>
        option.setName('reports')
        .setDescription('View a list of reports')
        .addStringOption(option =>
            option.setName('id')
            .setDescription('The ID of the report')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('user-id')
            .setDescription('The user who made the report')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('status')
            .setDescription('The status of the report')
            .setRequired(false)
            .setChoices(
                {
                    name: 'Processing',
                    value: 'Processing'
                },
                {
                    name: 'Under Review',
                    value: 'Under Review'
                },
                {
                    name: 'Approved',
                    value: 'Approved'
                },
                {
                    name: 'Fixed',
                    value: 'Fixed'
                },
                {
                    name: 'Denied',
                    value: 'Denied'
                }
            )
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The status of the report')
            .setRequired(false)
            .setChoices(
                {
                    name: 'User Report',
                    value: 'User Report'
                },
                {
                    name: 'Bug Report',
                    value: 'Bug Report'
                }
            )
        )
    )

    .addSubcommand(option =>
        option.setName('delete-report')
        .setDescription('Delete reports')
        .addStringOption(option =>
            option.setName('id')
            .setDescription('The ID of the report')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('user-id')
            .setDescription('The user who made the report')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('status')
            .setDescription('The status of the report')
            .setRequired(false)
            .setChoices(
                {
                    name: 'Processing',
                    value: 'Processing'
                },
                {
                    name: 'Under Review',
                    value: 'Under Review'
                },
                {
                    name: 'Approved',
                    value: 'Approved'
                },
                {
                    name: 'Fixed',
                    value: 'Fixed'
                },
                {
                    name: 'Denied',
                    value: 'Denied'
                }
            )
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The status of the report')
            .setRequired(false)
            .setChoices(
                {
                    name: 'User Report',
                    value: 'User Report'
                },
                {
                    name: 'Bug Report',
                    value: 'Bug Report'
                }
            )
        )
    )

    .addSubcommand(option =>
        option.setName('gen-code')
        .setDescription('Generate a premium code')
        .addStringOption(option => 
            option.setName('plan')
            .setDescription('The plan of the code')
            .setRequired(true)
            .setChoices(
                {
                    name: "Daily",
                    value: "Daily",
                },
                {
                    name: "Weekly",
                    value: "Weekly",
                },
                {
                    name: "Monthly",
                    value: "Monthly",
                },
                {
                    name: "Yearly",
                    value: "Yearly",
                }
            )
        )

        .addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount of codes to create')
            .setRequired(true)    
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The type of code')
            .setRequired(true)
            .setChoices(
                {
                    name: "User",
                    value: "User",
                },
                {
                    name: "Guild",
                    value: "Guild",
                }
            )
        )
    )

    .addSubcommand(option =>
        option.setName('delete-code')
        .setDescription('Delete a premium code')
        .addStringOption(option => 
            option.setName('code')
            .setDescription('The code to delete')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('user-id')
            .setDescription('Codes linked to a user')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('plan')
            .setDescription('The plan of the code')
            .setRequired(false)
            .setChoices(
                {
                    name: "Daily",
                    value: "Daily",
                },
                {
                    name: "Weekly",
                    value: "Weekly",
                },
                {
                    name: "Monthly",
                    value: "Monthly",
                },
                {
                    name: "Yearly",
                    value: "Yearly",
                }
            )
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The type of code')
            .setRequired(false)
            .setChoices(
                {
                    name: "User",
                    value: "User",
                },
                {
                    name: "Guild",
                    value: "Guild",
                }
            )
        )
    )

    .addSubcommand(option => 
        option.setName('list-codes')
        .setDescription('List all the active codes')
        .addStringOption(option => 
            option.setName('code')
            .setDescription('The code to delete')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('user-id')
            .setDescription('Codes linked to a user')
            .setRequired(false)
        )

        .addStringOption(option => 
            option.setName('plan')
            .setDescription('The plan of the code')
            .setRequired(false)
            .setChoices(
                {
                    name: "Daily",
                    value: "Daily",
                },
                {
                    name: "Weekly",
                    value: "Weekly",
                },
                {
                    name: "Monthly",
                    value: "Monthly",
                },
                {
                    name: "Yearly",
                    value: "Yearly",
                }
            )
        )

        .addStringOption(option => 
            option.setName('type')
            .setDescription('The type of code')
            .setRequired(false)
            .setChoices(
                {
                    name: "User",
                    value: "User",
                },
                {
                    name: "Guild",
                    value: "Guild",
                }
            )
        )
    ),

    async execute(
        interaction
    ) {
        const checkForDev = await profileSchema.findOne({
            userId: interaction.user.id,
            developer: true
        })
        const checkForAdmin = await profileSchema.findOne({
            userId: interaction.user.id,
            botAdmin: true
        })
        const checkForMod = await profileSchema.findOne({
            userId: interaction.user.id,
            botModerator: true
        })
        if (!checkForDev && !checkForAdmin && !checkForMod && interaction.user.id !== '804265795835265034') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have permission to do this')
                .setColor('0xa477fc')
            ]
        })

        if (interaction.options.getSubcommand() === 'dev') {
            if (!checkForDev && interaction.user.id !== '804265795835265034') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            const userId = interaction.options.getString('userid')
            functions.createRecentCommand(interaction.user.id, 'user-manage-dev', `USERID: ${userId} | DEVELOPER: ${interaction.options.getString('dev')}`, interaction, true, true)
            const userProfile = await profileSchema.findOne({
                userId: userId
            })
            if (!userProfile) {
                await profileSchema.create({
                    userId: userId,
                    developer: true,
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('dev') === 'true' && userProfile.developer === true) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a developer`)]
            })
            if (interaction.options.getString('dev') === 'false' && userProfile.developer === false) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a developer`)]
            })
            if (userProfile.developer === true) {
                userProfile.developer = false
                userProfile.devMode = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is no longer a developer`)
                        .setColor('0xa744f2')
                    ]
                })

            } else if (userProfile.developer === false) {
                await profileSchema.updateOne({
                    userId: userId
                }, {

                    developer: true,
                    botAdmin: false,
                    botModerator: false
                })

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'admin') {
            if (!checkForDev && interaction.user.id !== '804265795835265034') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            const userId = interaction.options.getString('userid')
            functions.createRecentCommand(interaction.user.id, 'user-manage-admin', `USERID: ${userId} | ADMIN: ${interaction.options.getString('admin')}`, interaction, true, true)
            const userProfile = await profileSchema.findOne({
                userId: userId
            })
            if (!userProfile) {
                await profileSchema.create({
                    userId: userId,
                    botAdmin: true,
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Admin Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot admin`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('admin') === 'true' && userProfile.botAdmin === true) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a bot admin`)]
            })
            if (interaction.options.getString('admin') === 'false' && userProfile.botAdmin === false) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a bot admin`)]
            })
            if (userProfile.botAdmin === true) {
                userProfile.botAdmin = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Admin Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is no longer a bot admin`)
                        .setColor('0xa744f2')
                    ]
                })

            } else if (userProfile.botAdmin === false) {
                await profileSchema.updateOne({
                    userId: userId
                }, {

                    developer: false,
                    botAdmin: true,
                    botModerator: false
                })

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Admin Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot admin`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'mod') {
            if (!checkForDev && interaction.user.id !== '804265795835265034') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            const userId = interaction.options.getString('userid')
            functions.createRecentCommand(interaction.user.id, 'user-manage-mod', `USERID: ${userId} | MODERATOR: ${interaction.options.getString('mod')}`, interaction, true, true)
            const userProfile = await profileSchema.findOne({
                userId: userId
            })
            if (!userProfile) {
                await profileSchema.create({
                    userId: userId,
                    botModerator: true
                })
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Moderator Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot moderator`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('mod') === 'true' && userProfile.botModerator === true) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a bot moderator`)]
            })
            if (interaction.options.getString('mod') === 'false' && userProfile.botModerator === false) return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a bot moderator`)]
            })
            if (userProfile.botModerator === true) {
                userProfile.botModerator = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Moderator Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is no longer a bot moderator`)
                        .setColor('0xa744f2')
                    ]
                })

            } else if (userProfile.botModerator === false) {
                await profileSchema.updateOne({
                    userId: userId
                }, {
                    developer: false,
                    botAdmin: false,
                    botModerator: true
                })

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Moderator Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot moderator`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'cooldowns') {
            const userId = interaction.options.getString('userid')
            if (!interaction.options.getString('command')) {
                functions.createRecentCommand(interaction.user.id, 'user-manage-cooldowns', `USERID: ${userId}`, interaction, false, true)
                commandCooldowns.collection.deleteMany({
                    userId: userId
                })
                robCooldowns.collection.deleteMany({
                    userId: userId
                })
                robCooldownsSus.collection.deleteMany({
                    userId: userId
                })
                passiveCooldownSchema.collection.deleteMany({
                    userId: userId
                })
                interaction.reply({
                    embeds: [new EmbedBuilder().setTitle('Cooldowns Removed').setDescription(`I have removed all the cooldowns from <@${userId}> (\`${userId}\`)`)]
                })
            } else if (interaction.options.getString('command')) {
                functions.createRecentCommand(interaction.user.id, 'user-manage-cooldowns', `USERID: ${userId} | COMMAND: ${interaction.options.getString('command')}`, interaction, false, true)
                const cooldownCheck = await commandCooldowns.findOne({
                    userId: userId,
                    command: interaction.options.getString('command')
                })
                if (!cooldownCheck) return interaction.reply({
                    embeds: [new EmbedBuilder().setTitle('This user has no cooldowns')]
                })
                commandCooldowns.collection.deleteMany({
                    userId: userId,
                    command: interaction.options.getString('command')
                })
                interaction.reply({
                    embeds: [new EmbedBuilder().setTitle('Cooldowns Removed').setDescription(`I have removed all the cooldowns from <@${userId}> (\`${userId}\`) for the \`${interaction.options.getString('command')}\` command`)]
                })
            }
        } else if (interaction.options.getSubcommand() === 'cooldowns-fix') {
            functions.createRecentCommand(interaction.user.id, 'user-manage-cooldowns-fix', `None`, interaction, false, true)
            const query = {
                expires: {
                    $lt: new Date()
                },
            }

            await commandCooldowns.deleteMany(query)
            await robCooldowns.deleteMany(query)
            await robCooldownsSus.deleteMany(query)

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Fixed Cooldowns')
                    .setDescription('I really hope that cooldowns have now been fixed')
                    .setColor('0xa477fc')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'badge') {
            if (!checkForDev && !checkForAdmin) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            functions.createRecentCommand(interaction.user.id, 'user-manage-badge', `USERID: ${interaction.options.getString('userid')} | ACTION: ${interaction.options.getString('action')} | BADGE: ${interaction.options.getString('badge')}`, interaction, false, true)
            if (interaction.options.getString('action') === 'add') {
                const badgeToAdd = interaction.options.getString('badge')
                const userID = interaction.options.getString('userid')

                const badgeAddEmbed = new EmbedBuilder()
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
                    }, {
                        name: 'User',
                        value: `<@${userID}> (\`${userID}\`)`,
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
                                new EmbedBuilder()
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
                    }, {
                        name: 'User',
                        value: `<@${userID}> (\`${userID}\`)`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeAddEmbed]
                    })
                }
            } else if (interaction.options.getString('action') === 'remove') {
                const badgeToRemove = interaction.options.getString('badge')
                const userID = interaction.options.getString('userid')

                const badgeRemoveEmbed = new EmbedBuilder()
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
                    }, {
                        name: 'User',
                        value: `<@${userID}> (\`${userID}\`)`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeRemoveEmbed]
                    })
                } else {
                    if (!result.badges.find(badgeName => badgeName._id === badgeToRemove)) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Could not remove badge')
                                .setDescription('This user does not have that badge')
                                .setColor('0xa744f2')
                            ]
                        })
                    } else {
                        await profileSchema.updateOne({
                            userId: userID,
                        }, {
                            $pull: {
                                badges: {
                                    _id: badgeToRemove
                                }
                            }
                        })
                    }

                    badgeRemoveEmbed.setFields({
                        name: 'Badge',
                        value: `${badgeToRemove}`,
                        inline: true
                    }, {
                        name: 'User',
                        value: `<@${userID}> (\`${userID}\`)`,
                        inline: true
                    })
                    interaction.reply({
                        embeds: [badgeRemoveEmbed]
                    })
                }
            }
        } else if (interaction.options.getSubcommand() === 'account') {
            const userID = interaction.options.getString('userid')
            const action = interaction.options.getString('action')
            const amount = interaction.options.getInteger('amount')
            const type = interaction.options.getString('type')

            functions.createRecentCommand(interaction.user.id, 'user-manage-wealth', `USERID: ${userID} | ACTION: ${action} | TYPE: ${type} | AMOUNT: ${amount.toLocaleString()}`, interaction, true, true)

            const userProfile = await profileSchema.findOne({
                userId: userID
            })

            if (type === 'coins-wallet') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        wallet: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.wallet = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.wallet += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                    await profileSchema.create({
                        userId: userID,
                        bank: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.bank = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.bank += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                    await profileSchema.create({
                        userId: userID,
                        level: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.level = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.level += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                    await profileSchema.create({
                        userId: userID,
                        xp: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.xp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.xp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                    await profileSchema.create({
                        userId: userID,
                        requiredXp: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added required XP')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.requiredXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.requiredXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
            } else if (type === 'xp-boost') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        xpBoost: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added XP Boost')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.xpBoost = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set XP Boost')
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
                } else if (action === 'addorremove') {
                    userProfile.xpBoost += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added XP Boost')
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
                    await profileSchema.create({
                        userId: userID,
                        maxBank: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added max bank space')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.maxBank = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.maxBank += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                    await profileSchema.create({
                        userId: userID,
                        coinMulti: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added coin multi')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.coinMulti = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
                } else if (action === 'addorremove') {
                    userProfile.coinMulti += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
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
            } else if (type === 'planet-level') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        planetLevel: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.planetLevel = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet level')
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
                } else if (action === 'addorremove') {
                    userProfile.planetLevel += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added planet level')
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
            } else if (type === 'planet-xp') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        planetXp: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet xp')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.planetXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet xp')
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
                } else if (action === 'addorremove') {
                    userProfile.planetXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added planet xp')
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
            } else if (type === 'planet-req-xp') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        requiredPlanetXp: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet required xp')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.requiredPlanetXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet required xp')
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
                } else if (action === 'addorremove') {
                    userProfile.requiredPlanetXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added planet required xp')
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
            } else if (type === 'planet-unlocked-level') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        unlockedPlanetLevel: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet unlocked level')
                            .setColor('0xa744f2')
                            .setFields({
                                name: 'User',
                                value: `<@${userID}> (\`${userID}\`)`
                            }, {
                                name: 'Amount',
                                value: `\`${amount.toLocaleString()}\``
                            })
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
                        ]
                    })
                } else if (action === 'set') {
                    userProfile.unlockedPlanetLevel = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Set planet unlocked level')
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
                } else if (action === 'addorremove') {
                    userProfile.unlockedPlanetLevel += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Added planet unlocked level')
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
            functions.createRecentCommand(interaction.user.id, 'user-manage-lookup', `USERID: ${interaction.options.getString('userid')}`, interaction, false, true)
            const result = await profileSchema.findOne({
                userId: interaction.options.getString('userid')
            })
            if (!result) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Could not find a user with that ID in my database')
                        .setColor('0xa744f2')
                    ]
                })
            }
            var invArray = result.badges.map(x => x._id)
            var invItems = createBadges(invArray).join(' ')

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Reset')
                    .setStyle('Danger')
                    .setCustomId('reset-profile-lookup')
                )

                const resultMessage = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('User Found')
                        .setColor('0xa744f2')
                        .setDescription(`**User**: <@${result.userId}> (\`${result.userId}\`)\n**Bio**: ${result.bio}\n**Badges**: ${invItems.length === 0 ? 'None' : invItems}\n**Rank**: ${result.developer === true ? '<:DeveloperBadge:1006817283550761051> Developer' : `${result.botAdmin === true ? '<:AdminBadge:1006817282061762570> Bot Admin' : `${result.botModerator === true ? '<:ModeratorBadge:1006817284846792765> Bot Moderator' : 'Regular'}`}`}\n${result.job !== '' ? `Works as a \`${result.job}\`` : ''}\n**Profile Created**: <t:${Math.round(result.createdAt.getTime() / 1000)}> (<t:${Math.round(result.createdAt.getTime() / 1000)}:R>)\n**Trust**: ${result.trust}`)
                        .setFields({
                            name: 'Level',
                            value: `Bot Level: \`${result.level}\`\nPlanet Level: \`${result.planetLevel}\`\nUnlocked Planet Level: \`${result.unlockedPlanetLevel}\``,
                            inline: true
                        }, {
                            name: 'XP',
                            value: `Bot XP: \`${result.xp}/${result.requiredXp}\` (\`${Math.round(result.xp / result.requiredXp * 100)}%\`)\nPlanet XP: \`${result.planetXp}/${result.requiredPlanetXp}\` (\`${Math.round(result.planetXp / result.requiredPlanetXp * 100)}%\`)`,
                            inline: true
                        }, {
                            name: 'Numbers',
                            value: `Wallet: \`${result.wallet.toLocaleString()}\`\nBank: \`${result.bank.toLocaleString()}/${result.maxBank.toLocaleString()}\` (\`${Math.round(result.bank / result.maxBank * 100)}%\`)\nMultiplier: \`${result.coinMulti.toLocaleString()}%\`\nXP Boost: \`${result.xpBoost.toLocaleString()}%\`\nCurrent Planet: \`${result.currentPlanet}\``,
                            inline: true
                        })
                    ],
                    components: [row1],
                    fetchReply: true
                })
            const confirmCollector = await resultMessage.createMessageComponentCollector({
                type: 'Button',
                time: 60000
            })
            confirmCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                if (i.customId === 'reset-profile-lookup') {
                    if (!checkForDev && !checkForAdmin) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You do not have permission to do this')
                            .setColor('0xa477fc')
                        ]
                    })
                    functions.createRecentCommand(interaction.user.id, 'user-manage-reset', `USERID: ${interaction.options.getString('userid')}`, interaction, true, true)
                    resultMessage.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This user has been wiped (Including dev status)')
                            .setColor('0xa744f2')
                        ],
                        components: []
                    })
                    result.delete()
                    invSchema.collection.deleteMany({
                        userId: result.userId
                    })
                    commandCooldowns.collection.deleteMany({
                        userId: result.userId
                    })
                    notificationSchema.collection.deleteMany({
                        userId: result.userId
                    })
                }
            })
            confirmCollector.on('end', () => {
                resultMessage.edit({
                    components: []
                })
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
            functions.createRecentCommand(interaction.user.id, 'user-manage-item', `USERID: ${interaction.options.getString('userid')} | ITEM: ${itemQuery} | AMOUNT: ${interaction.options.getInteger('amount')} | ACTION: ${interaction.options.getString('action')}`, interaction, true, true)
            const search = !!items.find((value) => value.id === itemQuery.toLowerCase())
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find an item with that ID')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = items.find((value) => value.id === itemQuery.toLowerCase())
            const scanDatabaseForItem = await invSchema.findOne({
                userId: interaction.options.getString('userid'),
                itemId: itemQuery.toLowerCase()
            })
            if (scanDatabaseForItem) {
                if (interaction.options.getString('action') === 'remove') {
                    if (scanDatabaseForItem.amount - interaction.options.getInteger('amount') <= 0) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
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
                                new EmbedBuilder()
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
                            new EmbedBuilder()
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
                        new EmbedBuilder()
                        .setTitle('You cannot remove an item that they don\'t have')
                        .setColor('0xa744f2')
                    ]
                })
                if (interaction.options.getInteger('amount') === 0) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You cannot add 0 items')
                        .setColor('0xa744f2')
                    ]
                })
                invSchema.create({
                    userId: interaction.options.getString('userid'),
                    item: itemFound.name,
                    itemId: itemFound.id,
                    emoji: itemFound.emoji,
                    amount: interaction.options.getInteger('amount')
                })
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
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
        } else if (interaction.options.getSubcommand() === 'lookup-inventory') {
            const functions1 = require('../../commandFunctions')
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            const pageButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('firstPage')
                .setEmoji('<:FirstPage:1011987981713817620>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('backPage')
                .setEmoji('<:PreviousPage:1011987986033938462>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('nextPage')
                .setEmoji('<:NextPage:1011987984385593415>')
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('lastPage')
                .setEmoji('<:LastPage:1011987983060193290>')
                .setStyle('Primary'),
            )

            const searchResults = await invSchema.find({
                userId: interaction.options.getString('userid')
            })
            const invEmbeds = await functions1.genInventoryPages(searchResults)
            functions.createRecentCommand(interaction.user.id, 'user-manage-lookup-inv', `USERID: ${interaction.options.getString('userid')}`, interaction, false, true)

            if (invEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await omgSoLongMsg.edit({
                embeds: [invEmbeds[0].setFooter({text: `Page ${currentPage + 1}/${invEmbeds.length}`})],
                components: [pageButtons],
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Inventory is empty')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                ComponentType: 'Button',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'backPage') {
                    if (currentPage !== 0) {
                        --currentPage
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            embeds: [invEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${invEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== invEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === invEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            embeds: [invEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${invEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== invEmbeds.length) {
                        currentPage = invEmbeds.length - 1
                        if (currentPage + 1 === invEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            embeds: [invEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${invEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'firstPage') { //!
                    if (currentPage !== 0) {
                        currentPage = 0
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            embeds: [invEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${invEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                }
            })
            pageButtonCollector.on('end', i => {
                firstEmbed.edit({
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'reports') {
            functions.createRecentCommand(interaction.user.id, 'user-manage-reports', `USERID: ${interaction.options.getString('user-id') || 'None'} | STATUS: ${interaction.options.getString('status') || 'None'}`, interaction, false, true)
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            let reportList
            const pageButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('firstPage')
                .setEmoji('<:FirstPage:1011987981713817620>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('backPage')
                .setEmoji('<:PreviousPage:1011987986033938462>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('nextPage')
                .setEmoji('<:NextPage:1011987984385593415>')
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('lastPage')
                .setEmoji('<:LastPage:1011987983060193290>')
                .setStyle('Primary'),
            )

            if (interaction.options.getString('id')) {
                reportList = await reportSchema.find({
                    reportId: interaction.options.getString('id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    reporterId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('status')) {
                reportList = await reportSchema.find({
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    reporterId: interaction.options.getString('user-id'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('status'),
                    reporterId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type'),
                    reporterId: interaction.options.getString('user-id'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            }
            const functions2 = require('../../commandFunctions')
            const reportListEmbeds = await functions2.genStaffReportPages(reportList)

            if (reportListEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await omgSoLongMsg.edit({
                embeds: [reportListEmbeds[0]],
                components: [pageButtons],
                
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('There are no reports for this criteria')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                ComponentType: 'Button',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'backPage') {
                    if (currentPage !== 0) {
                        --currentPage
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== reportListEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === reportListEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== reportListEmbeds.length) {
                        currentPage = reportListEmbeds.length - 1
                        if (currentPage + 1 === reportListEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'firstPage') { //!
                    if (currentPage !== 0) {
                        currentPage = 0
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                }
            })
            pageButtonCollector.on('end', i => {
                firstEmbed.edit({
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'delete-report') {
            if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            functions.createRecentCommand(interaction.user.id, 'user-manage-delete-report', `USERID: ${interaction.options.getString('user-id') || 'None'} | STATUS: ${interaction.options.getString('status') || 'None'} | TYPE: ${interaction.options.getString('type') || 'None'}`, interaction, true, true)
            let reportList
            if (interaction.options.getString('id')) {
                reportList = await reportSchema.find({
                    reportId: interaction.options.getString('id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    reporterId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('status')) {
                reportList = await reportSchema.find({
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    reporterId: interaction.options.getString('user-id'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('status'),
                    reporterId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                reportList = await reportSchema.find({
                    type: interaction.options.getString('type'),
                    reporterId: interaction.options.getString('user-id'),
                    status: interaction.options.getString('status')
                }).sort({
                    _id: -1
                })
            }

            if (!reportList) return omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find any reports using this criteria')
                    .setColor('0xa477fc')
                ]
            })

            if (reportList.length === 0) return omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find any reports using this criteria')
                    .setColor('0xa477fc')
                ]
            })


            const confirmReportsDelete = await omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Are you sure')
                    .setColor('0xa477fc')
                    .setDescription(`You are about to delete \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Confirm')
                        .setStyle('Danger')
                        .setCustomId('reports-delete'),

                        new ButtonBuilder()
                        .setLabel('Cancel')
                        .setStyle('Success')
                        .setCustomId('reports-delete-cancel'),
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmReportsDelete.createMessageComponentCollector({
                ComponentType: 'Button',
                time: 30000
            })
            let collected = false
            collector.on('collect', async(i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'reports-delete') {
                    i.deferUpdate()
                    collected = true
                    
                    if (interaction.options.getString('id')) {
                        await reportSchema.collection.deleteMany({reportId: interaction.options.getString('id')})
                    } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({reporterId: interaction.options.getString('user-id')})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('status')) {
                        await reportSchema.collection.deleteMany({status: interaction.options.getString('status')})
                    } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && !interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({reporterId: interaction.options.getString('user-id'), status: interaction.options.getString('status')})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && !interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({type: interaction.options.getString('type')})
                    } else if (!interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({status: interaction.options.getString('status'), type: interaction.options.getString('type')})
                    } else if (interaction.options.getString('user-id') && !interaction.options.getString('status') && interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({reporterId: interaction.options.getString('user-id'), type: interaction.options.getString('type')})
                    } else if (interaction.options.getString('user-id') && interaction.options.getString('status') && interaction.options.getString('type')) {
                        await reportSchema.collection.deleteMany({reporterId: interaction.options.getString('user-id'), type: interaction.options.getString('type'),status: interaction.options.getString('status')})
                    }
                    const deletedReports = new EmbedBuilder()
                    .setTitle('Deleted reports')
                    .setDescription(`You just deleted \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)

                    confirmReportsDelete.edit({
                        embeds: [deletedReports],
                        components: []
                    })
                } else if (i.customId === 'reports-delete-cancel') {
                    i.deferUpdate()
                    collected = true
                    confirmReportsDelete.edit({
                        components: [],
                        embeds: [new EmbedBuilder().setTitle('Canceled deletion').setDescription(`You canceled the deletion of \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)]
                    })
                }
            })
    
            collector.on('end', () => {
                if (collected === true) return
                confirmReportsDelete.edit({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed Out')
                        .setColor('0xa477fc')
                    ]
                })
            })
        } else if (interaction.options.getSubcommand() === 'gen-code') {
            let amount = interaction.options.getInteger('amount')
            const plan = interaction.options.getString('plan')
            const type = interaction.options.getString('type')
            functions.createRecentCommand(interaction.user.id, 'user-manage-gen-code', `AMOUNT: ${amount} | PLAN: ${plan} | TYPE: ${type}`, interaction, amount > 50 ? true : false, true)
            if (amount > 100) amount = 100

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait for the bot to generate the codes')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
            const codes = await functions.genPremiumCode(interaction.user.id, amount, plan, type)
            interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Generated Codes')
                    .setColor('0xa477fc')
                    .setDescription(`\`${codes.join('\n')}\``)
                    .setFields({
                        name: 'Amount',
                        value: `\`${amount}\``,
                        inline: true
                    }, {
                        name: 'Plan',
                        value: `\`${plan}\``,
                        inline: true                        
                    }, {
                        name: 'Type',
                        value: `\`${type}\``,
                        inline: true
                    })
                ],
                ephemeral: true
            }).catch((err) => {
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Generated Codes')
                        .setColor('0xa477fc')
                        .setDescription(`Umm, what a surprise that \`${amount}\` codes is too many characters. I wasn't able to display them lol`)
                        .setFields({
                            name: 'Amount',
                            value: `\`${amount}\``,
                            inline: true
                        }, {
                            name: 'Plan',
                            value: `\`${plan}\``,
                            inline: true                        
                        }, {
                            name: 'Type',
                            value: `\`${type}\``,
                            inline: true
                        })
                    ],
                    ephemeral: true
                })
            })
        } else if (interaction.options.getSubcommand() === 'list-codes') {
            functions.createRecentCommand(interaction.user.id, 'user-manage-list-codes', `CODE: ${interaction.options.getString('code') || 'None'} | USERID: ${interaction.options.getString('user-id') || 'None'} | TYPE: ${interaction.options.getString('type') || 'None'} | PLAN: ${interaction.options.getString('plan') || 'None'}`, interaction, false, true)
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            let reportList
            const pageButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('firstPage')
                .setEmoji('<:FirstPage:1011987981713817620>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('backPage')
                .setEmoji('<:PreviousPage:1011987986033938462>')
                .setDisabled(true)
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('nextPage')
                .setEmoji('<:NextPage:1011987984385593415>')
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('lastPage')
                .setEmoji('<:LastPage:1011987983060193290>')
                .setStyle('Primary'),
            )
            if (interaction.options.getString('code')) {
                reportList = await premiumCodeSchema.find({
                    code: interaction.options.getString('code')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    creatorId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('plan')) {
                reportList = await premiumCodeSchema.find({
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    creatorId: interaction.options.getString('user-id'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('plan'),
                    creatorId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type'),
                    creatorId: interaction.options.getString('user-id'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            }
            const functions2 = require('../../commandFunctions')
            const reportListEmbeds = await functions2.genCodePagesStaff(reportList)

            if (reportListEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await omgSoLongMsg.edit({
                embeds: [reportListEmbeds[0]],
                components: [pageButtons],
                
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any codes going with this criteria')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                ComponentType: 'Button',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'backPage') {
                    if (currentPage !== 0) {
                        --currentPage
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== reportListEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === reportListEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== reportListEmbeds.length) {
                        currentPage = reportListEmbeds.length - 1
                        if (currentPage + 1 === reportListEmbeds.length) {
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                            pageButtons.components[2].setDisabled(true)
                            pageButtons.components[3].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'firstPage') { //!
                    if (currentPage !== 0) {
                        currentPage = 0
                        if (currentPage === 0) {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(true)
                            pageButtons.components[1].setDisabled(true)
                        } else {
                            pageButtons.components[2].setDisabled(false)
                            pageButtons.components[3].setDisabled(false)
                            pageButtons.components[0].setDisabled(false)
                            pageButtons.components[1].setDisabled(false)
                        }
                        firstEmbed.edit({
                            
                            embeds: [reportListEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${reportListEmbeds.length}`})],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                }
            })
            pageButtonCollector.on('end', i => {
                firstEmbed.edit({
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'delete-code') {
            if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            functions.createRecentCommand(interaction.user.id, 'user-manage-delete-report', `USERID: ${interaction.options.getString('user-id') || 'None'} | STATUS: ${interaction.options.getString('status') || 'None'} | TYPE: ${interaction.options.getString('type') || 'None'}`, interaction, true, true)
            let reportList
            if (interaction.options.getString('code')) {
                reportList = await premiumCodeSchema.find({
                    code: interaction.options.getString('code')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    creatorId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('plan')) {
                reportList = await premiumCodeSchema.find({
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    creatorId: interaction.options.getString('user-id'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type')
                }).sort({
                    _id: -1
                })
            } else if (!interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('plan'),
                    creatorId: interaction.options.getString('user-id')
                }).sort({
                    _id: -1
                })
            } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                reportList = await premiumCodeSchema.find({
                    type: interaction.options.getString('type'),
                    creatorId: interaction.options.getString('user-id'),
                    plan: interaction.options.getString('plan')
                }).sort({
                    _id: -1
                })
            }

            if (!reportList) return omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find any codes using this criteria')
                    .setColor('0xa477fc')
                ]
            })

            if (reportList.length === 0) return omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find any codes using this criteria')
                    .setColor('0xa477fc')
                ]
            })


            const confirmReportsDelete = await omgSoLongMsg.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Are you sure')
                    .setColor('0xa477fc')
                    .setDescription(`You are about to delete \`${reportList.length}\` codes with the bellow criteria:\n**Code**: ${interaction.options.getString('code') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Type**: ${interaction.options.getString('type') || 'None'}\n**Plan**: ${interaction.options.getString('plan') || 'None'}`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Confirm')
                        .setStyle('Danger')
                        .setCustomId('reports-delete'),

                        new ButtonBuilder()
                        .setLabel('Cancel')
                        .setStyle('Success')
                        .setCustomId('reports-delete-cancel'),
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmReportsDelete.createMessageComponentCollector({
                ComponentType: 'Button',
                time: 30000
            })
            let collected = false
            collector.on('collect', async(i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'reports-delete') {
                    i.deferUpdate()
                    collected = true
                    
                    if (interaction.options.getString('code')) {
                        await premiumCodeSchema.collection.deleteMany({code: interaction.options.getString('code')})
                    } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({creatorId: interaction.options.getString('user-id')})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('type') && interaction.options.getString('plan')) {
                        await premiumCodeSchema.collection.deleteMany({plan: interaction.options.getString('plan')})
                    } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && !interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({creatorId: interaction.options.getString('user-id'), plan: interaction.options.getString('plan')})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && !interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({})
                    } else if (!interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({type: interaction.options.getString('type')})
                    } else if (!interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({plan: interaction.options.getString('plan'), type: interaction.options.getString('type')})
                    } else if (interaction.options.getString('user-id') && !interaction.options.getString('plan') && interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({creatorId: interaction.options.getString('user-id'), type: interaction.options.getString('type')})
                    } else if (interaction.options.getString('user-id') && interaction.options.getString('plan') && interaction.options.getString('type')) {
                        await premiumCodeSchema.collection.deleteMany({creatorId: interaction.options.getString('user-id'), type: interaction.options.getString('type'), plan: interaction.options.getString('plan')})
                    }
                    confirmReportsDelete.embeds[0].setTitle('Deleted codes').setDescription(`You just deleted \`${reportList.length}\` codes with the bellow criteria:\n**Code**: ${interaction.options.getString('code') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Type**: ${interaction.options.getString('type') || 'None'}\n**Plan**: ${interaction.options.getString('plan') || 'None'}`)
                    confirmReportsDelete.edit({
                        embeds: [confirmReportsDelete.embeds[0]],
                        components: []
                    })
                } else if (i.customId === 'reports-delete-cancel') {
                    i.deferUpdate()
                    collected = true
                    confirmReportsDelete.edit({
                        components: [],
                        embeds: [confirmReportsDelete.embeds[0].setTitle('Canceled deletion').setDescription(`You canceled the deletion of \`${reportList.length}\` codes with the bellow criteria:\n**Code**: ${interaction.options.getString('code') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Type**: ${interaction.options.getString('type') || 'None'}\n**Plan**: ${interaction.options.getString('plan') || 'None'}`)]
                    })
                }
            })
    
            collector.on('end', () => {
                if (collected === true) return
                confirmReportsDelete.edit({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed Out')
                        .setColor('0xa477fc')
                    ]
                })
            })
        }
    }
}