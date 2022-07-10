const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const recentCommands = require('../models/recentCommands')

module.exports = {
    name: 'alerts',
    aliases: [''],
    description: 'View the past 24 hours of command usage',
    category: 'Devs',
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
            name: 'id',
            description: 'Lookup an alert by its ID',
            type: 'STRING',
            required: false
        },
        {
            name: 'guildid',
            description: 'The guild id to lookup',
            type: 'STRING',
            required: false
        }
    ],

    callback: async ({
        interaction
    }) => {
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


            const commands = await recentCommands.find({
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


            const commands = await recentCommands.find({
                command: interaction.options.getString('command')
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
            const commands = await recentCommands.find({
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command')
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
            const commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid')
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
            const commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
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
            const commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                userId: interaction.options.getString('userid'),
                command: interaction.options.getString('command')
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
            const commands = await recentCommands.find({
                guildId: interaction.options.getString('guildid'),
                command: interaction.options.getString('command')
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
            const commands = await recentCommands.find().sort({
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