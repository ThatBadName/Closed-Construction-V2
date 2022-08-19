const invSchema = require('../../models/inventorySchema')
const functions = require('../../commandFunctions')
const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    SlashCommandBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('inventory')
    .setDMPermission(false)
    .setDescription('Look inside an inventory')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user who you want to view the inventory of')
        .setRequired(false)    
    ),

    async execute(
        interaction
    ) {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'inventory', 3, interaction)
        if (cldn === true) return
        const user = interaction.options.getUser('user') || interaction.user
        functions.createRecentCommand(interaction.user.id, 'inventory', `USER: ${user}`, interaction)

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

        const wait = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Please Wait')
                .setColor('0xa744f2')
            ],
            fetchReply: true
        })

        const searchResults = await invSchema.find({
            userId: user.id
        })
        const invEmbeds = await functions.genInventoryPages(searchResults)

        let firstEmbed
        if (invEmbeds.length === 1) {
            firstEmbed = await wait.edit({
                embeds: [invEmbeds[0]],
                components: [],
                fetchReply: true
            }).catch(() => {
                return wait.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`${user.tag}'s inventory is empty`)],
                    fetchReply: true
                })
            })
        } else {
            firstEmbed = await wait.edit({
                embeds: [invEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${invEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return wait.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`${user.tag}'s inventory is empty`)],
                    fetchReply: true
                })
            })
        }

        const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
            type: 'Button',
            time: 30000
        })

        pageButtonCollector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
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