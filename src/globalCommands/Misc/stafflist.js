const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName('stafflist')
    .setDescription('Get a list of our current staff'),

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'stafflist', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'stafflist', `None`, interaction)

        const message = await interaction.reply({
            embeds: [
                new EmbedBuilder()
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

        const staffEmbeds = await functions.createStaffPages(staff)
        if (staffEmbeds.length === 1) {
            pageButtons.components[2].setDisabled(true)
            pageButtons.components[3].setDisabled(true)
        }
        const firstEmbed = await message.edit({
            embeds: [staffEmbeds[0]],
            components: [pageButtons],
            fetchReply: true
        }).catch(() => {
            return message.edit({
                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Hmm. There don\'t seem to be any staff at the moment')],
                fetchReply: true
            })
        })

        const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
            ComponentType: 'Button',
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
                        embeds: [staffEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${staffEmbeds.length}`})],
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
                        embeds: [staffEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${staffEmbeds.length}`})],
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
                        embeds: [staffEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${staffEmbeds.length}`})],
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
                        embeds: [staffEmbeds[currentPage].setFooter({text: `Page ${currentPage + 1}/${staffEmbeds.length}`})],
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