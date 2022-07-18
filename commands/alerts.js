const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const recentCommands = require('../models/recentCommands')
const profileSchema = require('../models/userProfile')

module.exports = {
    name: 'alerts',
    aliases: [''],
    description: 'View the past 24 hours of command usage',
    category: 'Dev',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: true,
    options: [{
            name: 'userid',
            description: 'See a users most recent commands',
            type: 'STRING',
            required: false
        },
        {
            name: 'command',
            description: 'The command to lookup',
            type: 'STRING',
            required: false
        },
        {
            name: 'guildid',
            description: 'The guild id to lookup',
            type: 'STRING',
            required: false
        },
        {
            name: 'flagged',
            description: 'If the alert is flagged or not',
            type: 'BOOLEAN',
            required: false
        },
        {
            name: 'staff-command',
            description: 'If the alert is a staff command or not',
            type: 'BOOLEAN',
            required: false
        },
        {
            name: 'id',
            description: 'Lookup an alert by its ID',
            type: 'STRING',
            required: false
        },
    ],

    callback: async ({
        interaction
    }) => {
        const checkForDev = await profileSchema.findOne({userId: interaction.user.id, developer: true})
        const checkForAdmin = await profileSchema.findOne({userId: interaction.user.id, botAdmin: true})
        const checkForModerator = await profileSchema.findOne({userId: interaction.user.id, botModerator: true})
        if (!checkForDev && !checkForAdmin && !checkForModerator) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You do not have perms so don\'t try and blacklist people')
                .setColor('0xa477fc')
            ]
        })
        const functions = require('../checks/functions')
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

            let commands
        if (interaction.options.getString('id')) {
            const searchResults = await recentCommands.find({
                Id: interaction.options.getString('id')
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPagesById(searchResults)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('No alerts with that ID')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('userid') && !interaction.options.getString('command') && !interaction.options.getString('guildid')) {

            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                userId: interaction.options.getString('userid')
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('This user has not used any commands in the past 24 hours')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('command') && !interaction.options.getString('userid') && !interaction.options.getString('guildid')) {


            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                command: interaction.options.getString('command'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                command: interaction.options.getString('command'),
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('There has been no usage of this command in the past 24 hours')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('userid') && interaction.options.getString('command') && !interaction.options.getString('guildid')) {
           
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interation.options.getString('command')
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('guildid') && !interaction.options.getString('userid') && !interaction.options.getString('command')) {
            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('guildid') && interaction.options.getString('userid') && !interaction.options.getString('command')) {
            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                guildId: interaction.options.getString('guildid'),
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('guildid') && interaction.options.getString('userid') && interaction.options.getString('command')) {
            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command'),
                guildId: interaction.options.getString('guildid'),
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (interaction.options.getString('guildid') && !interaction.options.getString('userid') && interaction.options.getString('command')) {
            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command'),
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        } else if (!interaction.options.getString('id') && !interaction.options.getString('guildid') && !interaction.options.getString('userid') && !interaction.options.getString('command')) {
            
            if (interaction.options.getBoolean('flagged') === true && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && !interaction.options.getBoolean('staff-command')) commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                staffCommand: true
            }).sort({
                _id: -1
            })
            else if (!interaction.options.getBoolean('flagged') && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                suspicious: true,
                staffCommand: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                staffCommand: true,
                suspicious: false
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === true && interaction.options.getBoolean('staff-command') === true) commands = await recentCommands.find({
                staffCommand: true,
                suspicious: true
            }).sort({
                _id: -1
            })
            else if (interaction.options.getBoolean('flagged') === false && interaction.options.getBoolean('staff-command') === false) commands = await recentCommands.find({
                staffCommand: false,
                suspicious: false
            }).sort({
                _id: -1
            })
            else commands = await recentCommands.find({
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createCommandPages(commands)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [commandEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('No commands have been run in the past 24 hours')],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== commandEmbeds.length) {
                        currentPage = commandEmbeds.length - 1
                        if (currentPage + 1 === commandEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${commandEmbeds.length}\``,
                            embeds: [commandEmbeds[currentPage]],
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
        }
    }
}