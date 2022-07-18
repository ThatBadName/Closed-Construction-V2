const blockSchema = require('../models/blockedUsers')
const {
    MessageButton,
    MessageActionRow,
    MessageEmbed
} = require('discord.js')

module.exports = {
    name: 'block',
    aliases: [''],
    description: 'Manage and view your blocked users',
    category: 'Misc',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
            name: 'add',
            description: 'Add a user to your blocked users list',
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                description: 'The user to block',
                type: 'USER',
                required: true
            }]
        },
        {
            name: 'view',
            description: 'View your blocked users',
            type: 'SUB_COMMAND'
        },
        {
            name: 'remove',
            description: 'Unblock a user',
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                description: 'The user to unlock',
                type: 'USER',
                required: true
            }]
        }
    ],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'settings', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'view') {
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

            const blocklist = await blockSchema.find({
                blockedById: interaction.user.id
            })
            const blocklistEmbeds = genBlocklistUserPages(blocklist)
            if (blocklistEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [blocklistEmbeds[0]],
                components: [pageButtons],
                content: `Current Page: \`${currentPage + 1}/${blocklistEmbeds.length}\``,
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new MessageEmbed().setColor(0xff0000).setTitle('You have not blocked anyone, yet....')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })

            pageButtonCollector.on('collect', async (i) => {
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
                            content: `Current Page: \`${currentPage + 1}/${blocklistEmbeds.length}\``,
                            embeds: [blocklistEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'nextPage') {
                    if (currentPage + 1 !== blocklistEmbeds.length) {
                        currentPage++
                        if (currentPage + 1 === blocklistEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${blocklistEmbeds.length}\``,
                            embeds: [blocklistEmbeds[currentPage]],
                            components: [pageButtons]
                        })
                        i.deferUpdate()
                        pageButtonCollector.resetTimer()
                    } else i.reply({
                        content: `There are no more pages`,
                        ephemeral: true,
                    })
                } else if (i.customId === 'lastPage') {
                    if (currentPage + 1 !== blocklistEmbeds.length) {
                        currentPage = blocklistEmbeds.length - 1
                        if (currentPage + 1 === blocklistEmbeds.length) {
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
                            content: `Current Page: \`${currentPage + 1}/${blocklistEmbeds.length}\``,
                            embeds: [blocklistEmbeds[currentPage]],
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
                            content: `Current Page: \`${currentPage + 1}/${blocklistEmbeds.length}\``,
                            embeds: [blocklistEmbeds[currentPage]],
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
                    content: `Panel timed out`,
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'add') {
            const user = interaction.options.getUser('user')
            if (user.id === interaction.user.id) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You can\'t block yourself')
                    .setColor('0xff3d15')
                ]
            })
            const check = await blockSchema.findOne({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            if (check) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Couldn\'t block user.')
                    .setDescription(`${user} is already blocked`)
                    .setColor('0xff3d15')
                ]
            })
            blockSchema.create({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('User blocked')
                    .setDescription(`${user} has been blocked`)
                    .setColor('0xff3d15')
                ]
            })

        } else if (interaction.options.getSubcommand() === 'remove') {
            const user = interaction.options.getUser('user')
            const check = await blockSchema.findOne({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            if (!check) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Couldn\'t unblock user.')
                    .setDescription(`${user} is not blocked`)
                    .setColor('0xff3d15')
                ]
            })
            check.delete()
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Unblocked user.')
                    .setDescription(`${user} has been unblocked`)
                    .setColor('0xff3d15')
                ]
            })
        }

        function genBlocklistUserPages(blacklist) {
            const blocklistEmbeds = []
            let k = 5
            for (let i = 0; i < blacklist.length; i += 5) {
                const current = blacklist.slice(i, k)
                let j = i
                k += 5
                let info = `Nothing on the blocklist`
                info = current.map(item => `**User**: <@${item.blockedUserId}> (\`${item.blockedUserId}\`)\n**Date Added**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n`).join('\n\n')
                const embed = new MessageEmbed()
                    .setColor('0xff3d15')
                    .setTitle(`Blocked Users`)
                    .setDescription(info)
                blocklistEmbeds.push(embed)
            }
            return blocklistEmbeds
        }
    }

}