const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder,
    ComponentType
} = require('discord.js')
const recentCommands = require('../../models/recentCommands')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('alerts')
    .setDMPermission(false)
    .setDescription('View the past 24 hours of command usage')
    .addStringOption(option => 
        option.setName('userid')
        .setDescription('See a users most recent commands')
        .setRequired(false)
    )

    .addStringOption(option => 
        option.setName('command')
        .setDescription('The command to lookup')
        .setRequired(false)
    )

    .addStringOption(option => 
        option.setName('guildid')
        .setDescription('The guild id to lookup')
        .setRequired(false)
    )

    .addBooleanOption(option => 
        option.setName('flagged')
        .setDescription('If the alert is flagged or not')
        .setRequired(false)
    )

    .addBooleanOption(option => 
        option.setName('staff-command')
        .setDescription('If the alert is a staff command or not')
        .setRequired(false)
    )

    .addStringOption(option => 
        option.setName('id')
        .setDescription('Lookup an alert by its ID')
        .setRequired(false)
    ),

    async execute(
        interaction
    ) {
        const checkForDev = await profileSchema.findOne({userId: interaction.user.id, developer: true})
        const checkForAdmin = await profileSchema.findOne({userId: interaction.user.id, botAdmin: true})
        const checkForModerator = await profileSchema.findOne({userId: interaction.user.id, botModerator: true})
        if (!checkForDev && !checkForAdmin && !checkForModerator) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have perms to do this')
                .setColor('0xa477fc')
            ]
        })
        const functions = require('../../commandFunctions')
        let currentPage = 0
        const pageButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('firstPage')
                .setEmoji('⏪')
                .setDisabled(true)
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setCustomId('backPage')
                .setEmoji('◀️')
                .setDisabled(true)
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setCustomId('nextPage')
                .setEmoji('▶️')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setCustomId('lastPage')
                .setEmoji('⏩')
                .setStyle('Secondary'),
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
                embeds: [commandEmbeds[0].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
                components: [pageButtons],
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('No alerts with that ID')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('This user has not used any commands in the past 24 hours')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('There has been no usage of this command in the past 24 hours')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('I could not find any results for these search queries')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('No commands have been run in the past 24 hours')],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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
        
                            embeds: [commandEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
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