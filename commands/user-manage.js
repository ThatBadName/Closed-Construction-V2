const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const commandCooldowns = require('../models/cooldowns')
const invSchema = require('../models/inventorySchema')
const items = require('../items/allItems')
const functions = require('../checks/functions')
const robCooldowns = require('../models/robCooldowns')
const robCooldownsSus = require('../models/robCooldownsSus')
const reportSchema = require('../models/reports')
const premiumCodeSchema = require('../models/premiumCodes')

module.exports = {
    name: 'user-manage',
    aliases: [''],
    description: 'Manage a users bot account.',
    category: 'Dev',
    slash: true,
    ownerOnly: false,
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
                    choices: [{
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
            options: [{
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
                    choices: [{
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
            name: 'admin',
            description: 'Change if a user is a bot admin or not',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'userid',
                    description: 'The ID of the user',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'admin',
                    description: 'Is this user a bot admin?',
                    type: 'STRING',
                    required: true,
                    choices: [{
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
            name: 'mod',
            description: 'Change if a user is a bot moderator or not',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'userid',
                    description: 'The ID of the user',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'mod',
                    description: 'Is this user a mod?',
                    type: 'STRING',
                    required: true,
                    choices: [{
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
            options: [{
                name: 'userid',
                description: 'The ID of the user',
                type: 'STRING',
                required: true
            }, {
                name: 'command',
                description: 'The command to clear the cooldown of',
                type: 'STRING',
                required: false
            }]
        },
        {
            name: 'cooldowns-fix',
            description: 'Fix cooldowns if they are not expiring',
            type: 'SUB_COMMAND',
        },
        {
            name: 'badge',
            description: 'Manage a users badges',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'action',
                    description: 'The action to perform',
                    type: 'STRING',
                    required: true,
                    choices: [{
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
                    choices: [{
                            name: 'Developer Badge',
                            value: '<:developer:995407005864955924>'
                        },
                        {
                            name: 'Admin Badge',
                            value: '<:botAdmin:996186649191002192>'
                        },
                        {
                            name: 'Moderator Badge',
                            value: '<:botModerator:996136262064939098>'
                        },
                        {
                            name: 'Support Badge',
                            value: '<:Support:995031355878559884>'
                        },
                        {
                            name: 'Partner Badge',
                            value: '<:Partner:995031353810755656>'
                        },
                        {
                            name: 'Beta User',
                            value: '<:betaUser:995092836879978589>'
                        }

                    ]
                }
            ]
        },
        {
            name: 'wealth',
            description: 'Manage a users coins/xp/level',
            type: 'SUB_COMMAND',
            options: [{
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
                    choices: [{
                            name: 'Add/Remove',
                            value: '0'
                        },
                        {
                            name: 'Set',
                            value: '1'
                        }
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
                    choices: [{
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
                    ]
                }
            ]
        },
        {
            name: 'lookup',
            description: 'Lookup a user',
            type: 'SUB_COMMAND',
            options: [{
                name: 'userid',
                description: 'The ID of the user to lookup',
                type: 'STRING',
                required: true
            }]
        },
        {
            name: 'lookup-inventory',
            description: 'Lookup a users inv',
            type: 'SUB_COMMAND',
            options: [{
                name: 'userid',
                description: 'The ID of the user to lookup',
                type: 'STRING',
                required: true
            }]
        },
        {
            name: 'reports',
            description: 'View a list of reports',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'id',
                    description: 'The ID of the report',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'user-id',
                    description: 'View reports of a certain user',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'status',
                    description: 'Lookup a report by its status',
                    type: 'STRING',
                    required: false,
                    choices: [{
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
                            name: 'Denied',
                            value: 'Denied'
                        }
                    ]
                },
                {
                    name: 'type',
                    description: 'Reports with a type',
                    type: 'STRING',
                    required: false,
                    choices: [{
                            name: 'User Report',
                            value: 'User Report'
                        },
                        {
                            name: 'Bug Report',
                            value: 'Bug Report'
                        }
                    ]
                }
            ]
        },
        {
            name: 'delete-report',
            description: 'Delete a report or multiple reports',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'id',
                    description: 'The ID of the report',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'user-id',
                    description: 'Reports of a user',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'status',
                    description: 'Reports with a status',
                    type: 'STRING',
                    required: false,
                    choices: [{
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
                            name: 'Denied',
                            value: 'Denied'
                        }
                    ]
                },
                {
                    name: 'type',
                    description: 'Reports with a type',
                    type: 'STRING',
                    required: false,
                    choices: [{
                            name: 'User Report',
                            value: 'User Report'
                        },
                        {
                            name: 'Bug Report',
                            value: 'Bug Report'
                        }
                    ]
                }
            ]
        },
        // {
        //     name: 'premium-add',
        //     description: 'Add premium to a server',
        //     type: 'SUB_COMMAND',
        //     options: [
        //         {
        //             name: 'server-id',
        //             description: 'The ID of the server to add premium to',
        //             type: 'STRING',
        //             required: true,
        //         },
        //         {
        //             name: 'period',
        //             description: 'The time period to use',
        //             type: 'STRING',
        //             choices: [{name: 'Hour', value: 'h'},{name: 'Day', value: 'd'},{name: 'Week', value: 'w'},{name: 'Month', value: 'm'},{name: 'Year', value: 'y'}],
        //             required: true,
        //         },
        //         {
        //             name: 'amount',
        //             description: 'The amount of x to give premium for',
        //             type: 'NUMBER',
        //             required: true
        //         },
        //     ]
        // },
        // {
        //     name: 'remove',
        //     description: 'Remove premium from a server',
        //     type: 'SUB_COMMAND',
        //     options: [
        //         {
        //             name: 'server-id',
        //             description: 'The ID of the server to remove premium from',
        //             type: 'STRING',
        //             required: true
        //         },
        //         {
        //             name: 'leave',
        //             description: 'Should I leave the server?',
        //             type: 'STRING',
        //             choices: [{name: 'Yes', value: '0'}, {name: 'No', value: '1'}],
        //             required: true
        //         }
        //     ]
        // },
        {
            name: 'gen-code',
            description: 'Generate a code for users to redeem',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'plan',
                    description: 'The plan to use',
                    type: 'STRING',
                    required: true,
                    choices: [
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
                        },
                      ],
                },
                {
                    name: 'amount',
                    description: 'The amount of codes to create',
                    type: "INTEGER",
                    required: true,
                },
                {
                    name: 'type',
                    description: 'The type of code',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {
                          name: "User",
                          value: "User",
                        },
                        {
                          name: "Guild",
                          value: "Guild",
                        }
                      ],
                }
            ],
        },
        {
            name: 'delete-code',
            description: 'Delete a code',
            type: 'SUB_COMMAND',
            options: [{
                name: 'code',
                description: 'The code to delete',
                type: 'STRING',
                required: false
            },
            {
                name: 'user-id',
                description: 'Codes linked to a user',
                type: 'STRING',
                required: false
            },
            {
                name: 'plan',
                description: 'The plan of the codes',
                type: 'STRING',
                required: false,
                choices: [
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
                    },
                  ],
            },
            {
                name: 'type',
                description: 'The type of codes',
                type: 'STRING',
                required: false,
                choices: [
                    {
                      name: "User",
                      value: "User",
                    },
                    {
                      name: "Guild",
                      value: "Guild",
                    }
                  ],
            }
        ]
        },
        {
            name: 'list-codes',
            description: 'List all the active codes',
            type: 'SUB_COMMAND',
            options: [{
                name: 'code',
                description: 'The code to delete',
                type: 'STRING',
                required: false
            },
            {
                name: 'user-id',
                description: 'Codes linked to a user',
                type: 'STRING',
                required: false
            },
            {
                name: 'plan',
                description: 'The plan of the codes',
                type: 'STRING',
                required: false,
                choices: [
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
                    },
                  ],
            },
            {
                name: 'type',
                description: 'The type of codes',
                type: 'STRING',
                required: false,
                choices: [
                    {
                      name: "User",
                      value: "User",
                    },
                    {
                      name: "Guild",
                      value: "Guild",
                    }
                  ],
            }
        ]
        },
    ],

    callback: async ({
        interaction
    }) => {
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
        if (!checkForDev && !checkForAdmin && !checkForMod && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You do not have perms so don\'t try and manage bot profiles')
                .setColor('0xa477fc')
            ]
        })

        if (interaction.options.getSubcommand() === 'dev') {
            if (!checkForDev && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('No perms')
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
                        new MessageEmbed()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('dev') === 'true' && userProfile.developer === true) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a developer`)]
            })
            if (interaction.options.getString('dev') === 'false' && userProfile.developer === false) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a developer`)]
            })
            if (userProfile.developer === true) {
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
                await profileSchema.updateOne({
                    userId: userId
                }, {

                    developer: true,
                    botAdmin: false,
                    botModerator: false
                })

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Developer Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a developer`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'admin') {
            if (!checkForDev && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('No perms')
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
                        new MessageEmbed()
                        .setTitle('Admin Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot admin`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('admin') === 'true' && userProfile.botAdmin === true) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a bot admin`)]
            })
            if (interaction.options.getString('admin') === 'false' && userProfile.botAdmin === false) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a bot admin`)]
            })
            if (userProfile.botAdmin === true) {
                userProfile.botAdmin = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
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
                        new MessageEmbed()
                        .setTitle('Admin Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot admin`)
                        .setColor('0xa744f2')
                    ]
                })
            }

        } else if (interaction.options.getSubcommand() === 'mod') {
            if (!checkForDev && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('No perms')
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
                        new MessageEmbed()
                        .setTitle('Moderator Update')
                        .setDescription(`<@${userId}> (\`${userId}\`) is now a bot moderator`)
                        .setColor('0xa744f2')
                    ]
                })
            }

            if (interaction.options.getString('mod') === 'true' && userProfile.botModerator === true) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is already a bot moderator`)]
            })
            if (interaction.options.getString('mod') === 'false' && userProfile.botModerator === false) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Error').setDescription(`<@${userId}> (\`${userId}\`) is not a bot moderator`)]
            })
            if (userProfile.botModerator === true) {
                userProfile.botModerator = false
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
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
                        new MessageEmbed()
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
                const cooldownCheck = await commandCooldowns.findOne({
                    userId: userId
                })
                if (!cooldownCheck) return interaction.reply({
                    embeds: [new MessageEmbed().setTitle('This user has no cooldowns')]
                })
                commandCooldowns.collection.deleteMany({
                    userId: userId
                })
                interaction.reply({
                    embeds: [new MessageEmbed().setTitle('Cooldowns Removed').setDescription(`I have removed all the cooldowns from <@${userId}> (\`${userId}\`)`)]
                })
            } else if (interaction.options.getString('command')) {
                functions.createRecentCommand(interaction.user.id, 'user-manage-cooldowns', `USERID: ${userId} | COMMAND: ${interaction.options.getString('command')}`, interaction, false, true)
                const cooldownCheck = await commandCooldowns.findOne({
                    userId: userId,
                    command: interaction.options.getString('command')
                })
                if (!cooldownCheck) return interaction.reply({
                    embeds: [new MessageEmbed().setTitle('This user has no cooldowns')]
                })
                commandCooldowns.collection.deleteMany({
                    userId: userId,
                    command: interaction.options.getString('command')
                })
                interaction.reply({
                    embeds: [new MessageEmbed().setTitle('Cooldowns Removed').setDescription(`I have removed all the cooldowns from <@${userId}> (\`${userId}\`) for the \`${interaction.options.getString('command')}\` command`)]
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
                    new MessageEmbed()
                    .setTitle('Fixed Cooldowns')
                    .setDescription('I really hope that cooldowns have now been fixed')
                    .setColor('0xa477fc')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'badge') {
            if (!checkForDev && !checkForAdmin) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('No perms')
                    .setColor('0xa477fc')
                ]
            })
            functions.createRecentCommand(interaction.user.id, 'user-manage-badge', `USERID: ${interaction.options.getString('userid')} | ACTION: ${interaction.options.getString('action')} | BADGE: ${interaction.options.getString('badge')}`, interaction, false, true)
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
                    })
                    interaction.reply({
                        embeds: [badgeRemoveEmbed]
                    })
                }
            }
        } else if (interaction.options.getSubcommand() === 'wealth') {
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
                    await profileSchema.create({
                        userId: userID,
                        bank: amount
                    })
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
                    await profileSchema.create({
                        userId: userID,
                        level: amount
                    })
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
                    await profileSchema.create({
                        userId: userID,
                        xp: amount
                    })
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
                    await profileSchema.create({
                        userId: userID,
                        requiredXp: amount
                    })
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
            } else if (type === 'xp-boost') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        requiredXp: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '1') {
                    userProfile.requiredXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '0') {
                    userProfile.requiredXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
                    await profileSchema.create({
                        userId: userID,
                        coinMulti: amount
                    })
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
                            .setFooter({
                                text: `This user did not have a bot profile so I created one`
                            })
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
            } else if (type === 'planet-level') {
                if (!userProfile) {
                    await profileSchema.create({
                        userId: userID,
                        planetLevel: amount
                    })
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '1') {
                    userProfile.planetLevel = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '0') {
                    userProfile.planetLevel += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                            new MessageEmbed()
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
                } else if (action === '1') {
                    userProfile.planetXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '0') {
                    userProfile.planetXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                            new MessageEmbed()
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
                } else if (action === '1') {
                    userProfile.requiredPlanetXp = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '0') {
                    userProfile.requiredPlanetXp += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                            new MessageEmbed()
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
                } else if (action === '1') {
                    userProfile.unlockedPlanetLevel = amount
                    await userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                } else if (action === '0') {
                    userProfile.unlockedPlanetLevel += amount
                    userProfile.save()
                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
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
                    .setDescription(`**User**: <@${result.userId}> (\`${result.userId}\`)\n**Bio**: ${result.bio}\n**Badges**: ${invItems.length === 0 ? 'None' : invItems}\n**Rank**: ${result.developer === true ? '<:developer:995407005864955924> Developer' : `${result.botAdmin === true ? '<:botAdmin:996186649191002192> Bot Admin' : `${result.botModerator === true ? '<:botModerator:996136262064939098> Bot Moderator' : 'Regular'}`}`}\n**Profile Created**: <t:${Math.round(result.createdAt.getTime() / 1000)}> (<t:${Math.round(result.createdAt.getTime() / 1000)}:R>)`)
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
                        value: `Wallet: \`${result.wallet.toLocaleString()}\`\nBank: \`${result.bank.toLocaleString()}/${result.maxBank.toLocaleString()}\` (\`${result.bank / result.maxBank * 100}%\`)\nMultiplier: \`${result.coinMulti.toLocaleString()}%\`\nXP Boost: \`${result.xpBoost.toLocaleString()}%\`\nCurrent Planet: \`${result.currentPlanet}\``,
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
                    if (!checkForDev && !checkForAdmin) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('You do not have perms so don\'t try and wipe someone')
                            .setColor('0xa477fc')
                        ]
                    })
                    functions.createRecentCommand(interaction.user.id, 'user-manage-reset', `USERID: ${interaction.options.getString('userid')}`, interaction, true, true)
                    resultMessage.edit({
                        embeds: [
                            new MessageEmbed()
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
                    new MessageEmbed()
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
                invSchema.create({
                    userId: interaction.options.getString('userid'),
                    item: itemFound.name,
                    itemId: itemFound.id,
                    emoji: itemFound.emoji,
                    amount: interaction.options.getInteger('amount')
                })
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
        } else if (interaction.options.getSubcommand() === 'lookup-inventory') {
            const functions1 = require('../checks/functions')
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            const pageButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('firstPage')
                    .setEmoji('⏪')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('backPage')
                    .setEmoji('◀️')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('nextPage')
                    .setEmoji('▶️')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('lastPage')
                    .setEmoji('⏩')
                    .setStyle('SECONDARY'),
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
                embeds: [invEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Inventory is empty')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
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
                            content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                            embeds: [invEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                            embeds: [invEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                            embeds: [invEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                            embeds: [invEmbeds[currentPage]],
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
                    new MessageEmbed()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            let reportList
            const pageButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('firstPage')
                    .setEmoji('⏪')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('backPage')
                    .setEmoji('◀️')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('nextPage')
                    .setEmoji('▶️')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('lastPage')
                    .setEmoji('⏩')
                    .setStyle('SECONDARY'),
                )

                /**
                 * id
                 * userid
                 * status
                 * none
                 * userid and status
                 */
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
            const functions2 = require('../checks/functions')
            const reportListEmbeds = await functions2.genStaffReportPages(reportList)

            if (reportListEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await omgSoLongMsg.edit({
                embeds: [reportListEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('There are no reports for this criteria')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
            if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You don\'t have perms to delete reports')
                    .setColor('0xa477fc')
                ]
            })
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new MessageEmbed()
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
                    new MessageEmbed()
                    .setTitle('I could not find any reports using this criteria')
                    .setColor('0xa477fc')
                ]
            })

            if (reportList.length === 0) return omgSoLongMsg.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find any reports using this criteria')
                    .setColor('0xa477fc')
                ]
            })


            const confirmReportsDelete = await omgSoLongMsg.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Are you sure')
                    .setColor('0xa477fc')
                    .setDescription(`You are about to delete \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)
                ],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Confirm')
                        .setStyle('DANGER')
                        .setCustomId('reports-delete'),

                        new MessageButton()
                        .setLabel('Cancel')
                        .setStyle('SUCCESS')
                        .setCustomId('reports-delete-cancel'),
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmReportsDelete.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })
            let collected = false
            collector.on('collect', async(i) => {
                if (i.user.id !== interaction.user.id) return i.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('This is not your command')
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
                    confirmReportsDelete.embeds[0].setTitle('Deleted reports').setDescription(`You just deleted \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)
                    confirmReportsDelete.edit({
                        embeds: [confirmReportsDelete.embeds[0]],
                        components: []
                    })
                } else if (i.customId === 'reports-delete-cancel') {
                    i.deferUpdate()
                    collected = true
                    confirmReportsDelete.edit({
                        components: [],
                        embeds: [confirmReportsDelete.embeds[0].setTitle('Canceled deletion').setDescription(`You canceled the deletion of \`${reportList.length}\` reports with the bellow criteria:\n**ID**: ${interaction.options.getString('id') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Status**: ${interaction.options.getString('status') || 'None'}`)]
                    })
                }
            })
    
            collector.on('end', () => {
                if (collected === true) return
                confirmReportsDelete.edit({
                    components: [],
                    embeds: [
                        new MessageEmbed()
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
                    new MessageEmbed()
                    .setTitle('Please wait for the bot to generate the codes')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
            const codes = await functions.genPremiumCode(interaction.user.id, amount, plan, type)
            interaction.followUp({
                embeds: [
                    new MessageEmbed()
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
                        new MessageEmbed()
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
                    new MessageEmbed()
                    .setTitle('Please wait while the bot finds the documents')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            let currentPage = 0
            let reportList
            const pageButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('firstPage')
                    .setEmoji('⏪')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('backPage')
                    .setEmoji('◀️')
                    .setDisabled(true)
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('nextPage')
                    .setEmoji('▶️')
                    .setStyle('SECONDARY'),

                    new MessageButton()
                    .setCustomId('lastPage')
                    .setEmoji('⏩')
                    .setStyle('SECONDARY'),
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
            const functions2 = require('../checks/functions')
            const reportListEmbeds = await functions2.genCodePagesStaff(reportList)

            if (reportListEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await omgSoLongMsg.edit({
                embeds: [reportListEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return omgSoLongMsg.edit({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any codes going with this criteria')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${reportListEmbeds.length}\``,
                            embeds: [reportListEmbeds[currentPage]],
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
            if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You don\'t have perms to delete reports')
                    .setColor('0xa477fc')
                ]
            })
            const omgSoLongMsg = await interaction.reply({
                embeds: [
                    new MessageEmbed()
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
                    new MessageEmbed()
                    .setTitle('I could not find any codes using this criteria')
                    .setColor('0xa477fc')
                ]
            })

            if (reportList.length === 0) return omgSoLongMsg.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I could not find any codes using this criteria')
                    .setColor('0xa477fc')
                ]
            })


            const confirmReportsDelete = await omgSoLongMsg.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Are you sure')
                    .setColor('0xa477fc')
                    .setDescription(`You are about to delete \`${reportList.length}\` codes with the bellow criteria:\n**Code**: ${interaction.options.getString('code') || 'None'}\n**User ID**: ${interaction.options.getString('user-id') || 'None'}\n**Type**: ${interaction.options.getString('type') || 'None'}\n**Plan**: ${interaction.options.getString('plan') || 'None'}`)
                ],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Confirm')
                        .setStyle('DANGER')
                        .setCustomId('reports-delete'),

                        new MessageButton()
                        .setLabel('Cancel')
                        .setStyle('SUCCESS')
                        .setCustomId('reports-delete-cancel'),
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmReportsDelete.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })
            let collected = false
            collector.on('collect', async(i) => {
                if (i.user.id !== interaction.user.id) return i.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('This is not your command')
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
                        new MessageEmbed()
                        .setTitle('Timed Out')
                        .setColor('0xa477fc')
                    ]
                })
            })
        }
    }
}