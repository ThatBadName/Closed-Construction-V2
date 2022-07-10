const invSchema = require('../models/inventorySchema')
const functions = require('../checks/functions')
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js')

module.exports = {
    name: 'inventory',
    aliases: [''],
    description: 'View your inventory',
    category: 'Economy',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
        name: 'user',
        description: 'The users whos inventory to view',
        type: 'USER',
        required: false
    }],

    callback: async ({
        interaction
    }) => {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'inventory', 3, interaction)
        if (cldn === true) return
        const user = interaction.options.getString('user') || interaction.user
        functions.createRecentCommand(interaction.user.id, 'inventory', `USER: ${user}`, interaction)

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
            userId: user.id
        })
        const invEmbeds = await functions.genInventoryPages(searchResults)

        if (invEmbeds.length === 1) {
            pageButtons.components[2].setDisabled(true)
            pageButtons.components[3].setDisabled(true)
        }
        const firstEmbed = await interaction.reply({
            embeds: [invEmbeds[0]],
            components: [pageButtons],
            content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
            fetchReply: true
        }).catch(() => {
            return interaction.reply({
                embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Your inventory is empty')],
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
    }
}