const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const profileSchema = require('../models/userProfile')

module.exports = {
    name: 'stafflist',
    aliases: [''],
    description: 'Get a list of all the bot staff',
    category: 'Misc',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'stafflist', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'stafflist', `None`, interaction)

        const message = await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('0xcc6e73')
                .setTitle('Here is the message from the devs while you wait')
                .setFields({
                    name: 'Kschlatt\'s Dev Notes',
                    value: `Well this bot was a learning experince.`
                }, {
                    name: `BadName's stuff`,
                    value: `Hi! I'm bad and idk what to put here but i hope u have a good time using the bot`
                })
                .setFooter({
                    text: `Made by the 2 magical devs!`
                })
            ],
            fetchReply: true
        })

        let staff = await profileSchema.find({
            $or: [
                {
                    developer: true
                },
                {
                    botAdmin: true
                },
                {
                    botModerator: true
                }
            ]
        }).sort({
            createdAt: 1
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

        const staffEmbeds = await functions.createStaffPages(staff)
        if (staffEmbeds.length === 1) {
            pageButtons.components[2].setDisabled(true)
            pageButtons.components[3].setDisabled(true)
        }
        const firstEmbed = await message.edit({
            embeds: [staffEmbeds[0]],
            components: [pageButtons],
            content: `Current Page: \`${currentPage + 1}/${staffEmbeds.length}\``,
            fetchReply: true
        }).catch(() => {
            return message.edit({
                embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Hmm. There don\'t seem to be any staff at the moment')],
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
                        content: `Current Page: \`${currentPage + 1}/${staffEmbeds.length}\``,
                        embeds: [staffEmbeds[currentPage]],
                        components: [pageButtons]
                    })
                    i.deferUpdate()
                    pageButtonCollector.resetTimer()
                } else i.reply({
                    content: `There are no more pages`,
                    ephemeral: true,
                })
            } else if (i.customId === 'nextPage') {
                if (currentPage + 1 !== staffEmbeds.length) {
                    currentPage++
                    if (currentPage + 1 === staffEmbeds.length) {
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
                        content: `Current Page: \`${currentPage + 1}/${staffEmbeds.length}\``,
                        embeds: [staffEmbeds[currentPage]],
                        components: [pageButtons]
                    })
                    i.deferUpdate()
                    pageButtonCollector.resetTimer()
                } else i.reply({
                    content: `There are no more pages`,
                    ephemeral: true,
                })
            } else if (i.customId === 'lastPage') {
                if (currentPage + 1 !== staffEmbeds.length) {
                    currentPage = staffEmbeds.length - 1
                    if (currentPage + 1 === staffEmbeds.length) {
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
                        content: `Current Page: \`${currentPage + 1}/${staffEmbeds.length}\``,
                        embeds: [staffEmbeds[currentPage]],
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
                        content: `Current Page: \`${currentPage + 1}/${staffEmbeds.length}\``,
                        embeds: [staffEmbeds[currentPage]],
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