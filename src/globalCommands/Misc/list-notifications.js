const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const notificationSchema = require('../../models/notifications')
const profileSchema = require('../../models/userProfile')
const functions = require('../../commandFunctions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notifications')
        .setDMPermission(false)
        .setDescription('View your notifications')
        .addStringOption(option =>
            option.setName('show')
            .setDescription('Get more information on a notification with its ID')
            .setRequired(false)
            .setAutocomplete(true)
        ),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused()
        let choices = await notificationSchema.find({userId: interaction.user.id}).sort({_id: -1})
        choices = choices.map(n => `${n.Id},${n.Id.slice(2, 7)}`)
        const filtered = choices.filter((choice) =>
            choice.includes(focusedValue)
        ).slice(0, 25)
        await interaction.respond(
            filtered.map((choice) => ({name: choice.split(',')[1], value: choice.split(',')[0]}))
        )
    },

    async execute(
        interaction
    ) {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'notification', 3, interaction)
        if (cldn === true) return

        const wait = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Please wait')
                .setDescription('The bot is fetching all your notifications')
                .setColor('0xa744f2')
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

            await profileSchema.findOneAndUpdate({
                userId: interaction.user.id
            }, {
                hasUnreadNotif: false
            })

        if (interaction.options.getString('show')) {
            const searchResults = await notificationSchema.find({
                userId: interaction.user.id,
                Id: interaction.options.getString('show')
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createNotifsPagesLarge(searchResults)
            functions.createRecentCommand(interaction.user.id, `notifications`, `SHOW: ${interaction.options.getString('show')}`, interaction)
            let firstEmbed
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
                firstEmbed = await wait.edit({
                    embeds: [commandEmbeds[0].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
                    fetchReply: true
                }).catch(() => {
                    return wait.edit({
                        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('No notifications with that ID')],
                        fetchReply: true
                    })
                })
            } else {
                firstEmbed = await wait.edit({
                    embeds: [commandEmbeds[0].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
                    components: [pageButtons],
                    fetchReply: true
                }).catch(() => {
                    return wait.edit({
                        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('No notifications with that ID')],
                        fetchReply: true
                    })
                })
            }

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                type: 'Button',
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
        } else {
            const searchResults = await notificationSchema.find({
                userId: interaction.user.id
            }).sort({
                _id: -1
            })
            const commandEmbeds = await functions.createNotifsPagesSmall(searchResults)
            functions.createRecentCommand(interaction.user.id, `notifications`, `None`, interaction)
            if (commandEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await wait.edit({
                embeds: [commandEmbeds[0].setFooter({text: `Page ${currentPage + 1}/${commandEmbeds.length}`})],
                components: [pageButtons],
                fetchReply: true
            }).catch(() => {
                return wait.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('You have no notifications')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                type: 'Button',
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