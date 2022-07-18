const functions = require('../checks/functions')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const premiumCodeSchema = require('../models/premiumCodes')

module.exports = {
name: 'code',
aliases: [''],
description: 'Manage your premium codes',
category: 'Misc',
slash: true,
ownerOnly: false,
guildOnly: true,
testOnly: true,
options: [
    {
        name: 'generate',
        description: 'Generate a premium code',
        type: 'SUB_COMMAND'
    },
    {
        name: 'list',
        description: 'List all the codes you currently own',
        type: 'SUB_COMMAND'
    }
],

callback: async({interaction}) => {
    const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
    if (blks === true) return
    const main = await functions.checkMaintinance(interaction)
    if (main === true) return
    
    if (interaction.options.getSubcommand() === 'generate') {
        functions.createRecentCommand(interaction.user.id, 'generate-monthly', `None`, interaction)
        const member = interaction.guild.members.cache.get(interaction.user.id)
        if (!member) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Hmm, this is strange')
                .setDescription(`I encountered an internal error when running this command. If this problem keeps occuring please submit a bug report`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
        if (!member.roles.cache.has('998141631075201074')) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You are not a patreon')
                .setDescription(`To generate a monthly premium code you must be a <@&998141631075201074>`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
        
        const code = await functions.genPremiumCode(interaction.user.id, 1, 'Monthly', 'Guild')
        const cldn = await functions.cooldownCheck(interaction.user.id, 'generate-monthly', 2628288, interaction)
        if (cldn === true) return
        
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('I have made you a shiny new code!')
                .setDescription(`Your code is: ||\`${code}\`||`)
                .setFooter({text: 'If you ever forget or loose this code you can run "/code list" to see all your active codes'})
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
        interaction.user.send({
            embeds: [
                new MessageEmbed()
                .setTitle('I have made you a shiny new code!')
                .setDescription(`Your code is: ||\`${code}\`||`)
                .setFooter({text: 'If you ever forget or loose this code you can run "/code list" to see all your active codes'})
                .setColor('0xa477fc')
            ]
        })
    } else if (interaction.options.getSubcommand() === 'list') {
        const cldn = await functions.cooldownCheck(interaction.user.id, 'code-list', 10, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'code-list', `None`, interaction)

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

            const searchResults = await premiumCodeSchema.find({
                creatorId: interaction.user.id
            }).sort({
                _id: -1
            })
            const codeEmbeds = await functions.genCodePages(searchResults)
            if (codeEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }

            let failed = false
            const firstEmbed = await interaction.user.send({
                embeds: [codeEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${codeEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                try {
                    interaction.user.send({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('You do not have any codes')
                            .setColor('0xa477fc')
                        ]
                    })
                } catch {
                    failed = true
                }
            })
            if (failed === true) {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Please enable your DMs')],
                    fetchReply: true
                })
            }
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please check your DMs')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
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
                            content: `Current Page: \`${currentPage + 1}/${codeEmbeds.length}\``,
                            embeds: [codeEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== codeEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === codeEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${codeEmbeds.length}\``,
                            embeds: [codeEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== codeEmbeds.length) {
                        currentPage = codeEmbeds.length - 1
                        if (currentPage + 1 === codeEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${codeEmbeds.length}\``,
                            embeds: [codeEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${codeEmbeds.length}\``,
                            embeds: [codeEmbeds[currentPage]],
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