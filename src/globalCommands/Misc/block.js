const blockSchema = require('../../models/blockedUsers')
const {
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    SlashCommandBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('block')
    .setDMPermission(false)
    .setDescription('Manage and view your blocked users')
    .addSubcommand(option =>
        option.setName('add')
        .setDescription('Block a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to block')
            .setRequired(true)    
        )    
    )

    .addSubcommand(option =>
        option.setName('remove')
        .setDescription('Unblock a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to unblock')
            .setRequired(true)    
        )    
    )

    .addSubcommand(option =>
        option.setName('list')
        .setDescription('List your blocked users')
    ),

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'settings', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'list') {
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

            const blocklist = await blockSchema.find({
                blockedById: interaction.user.id
            })
            const blocklistEmbeds = genBlocklistUserPages(blocklist)
            if (blocklistEmbeds.length === 1) {
                pageButtons.components[2].setDisabled(true)
                pageButtons.components[3].setDisabled(true)
            }
            const firstEmbed = await interaction.reply({
                embeds: [blocklistEmbeds[0].setFooter({text: `Page: ${currentPage + 1}/${blocklistEmbeds.length}`})],
                components: [pageButtons],
                fetchReply: true
            }).catch(() => {
                return interaction.reply({
                    embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('You have not blocked anyone, yet....')],
                    fetchReply: true
                })
            })

            const pageButtonCollector = await firstEmbed.createMessageComponentCollector({
                componentType: 'Button',
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
                            embeds: [blocklistEmbeds[currentPage].setFooter({text: `Page: ${currentPage + 1}/${blocklistEmbeds.length}`})],
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
                            embeds: [blocklistEmbeds[currentPage].setFooter({text: `Page: ${currentPage + 1}/${blocklistEmbeds.length}`})],
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
                            embeds: [blocklistEmbeds[currentPage].setFooter({text: `Page: ${currentPage + 1}/${blocklistEmbeds.length}`})],
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
                            embeds: [blocklistEmbeds[currentPage].setFooter({text: `Page: ${currentPage + 1}/${blocklistEmbeds.length}`})],
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
                    new EmbedBuilder()
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
                    new EmbedBuilder()
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
                    new EmbedBuilder()
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
                    new EmbedBuilder()
                    .setTitle('Couldn\'t unblock user.')
                    .setDescription(`${user} is not blocked`)
                    .setColor('0xff3d15')
                ]
            })
            check.delete()
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                const embed = new EmbedBuilder()
                    .setColor('0xff3d15')
                    .setTitle(`Blocked Users`)
                    .setDescription(info)
                blocklistEmbeds.push(embed)
            }
            return blocklistEmbeds
        }
    }

}