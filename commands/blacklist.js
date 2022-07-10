const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js')

module.exports = {
    name: 'blacklist',
    description: 'View and manage the blacklist.',
    category: 'Dev',
    slash: true,
    guildOnly: true,
    testOnly: true,
    ownerOnly: true,
    options: [{
            name: 'add',
            description: 'Add a user/guild to the blacklist',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'id',
                    description: 'The ID of the user/guild',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'type',
                    description: 'Guild/User',
                    type: 'STRING',
                    required: true,
                    choices: [{
                            name: 'guild',
                            value: 'guild'
                        },
                        {
                            name: 'user',
                            value: 'user'
                        }
                    ]
                },
                {
                    name: 'duration',
                    description: 'The duration of the blacklist',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'reason',
                    description: 'The reason for the blacklist',
                    type: 'STRING',
                    required: false
                }
            ]
        },
        {
            name: 'remove',
            description: 'Remove a user/guild from the blacklist',
            type: 'SUB_COMMAND',
            options: [{
                    name: 'id',
                    description: 'The ID of the user/guild',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'type',
                    description: 'Guild/User',
                    type: 'STRING',
                    required: true,
                    choices: [{
                            name: 'Guild',
                            value: 'guild'
                        },
                        {
                            name: 'User',
                            value: 'user'
                        }
                    ]
                }
            ]
        },
        {
            name: 'lookup',
            description: 'Lookup an ID',
            type: 'SUB_COMMAND',
            options: [{
                name: 'id',
                description: 'The ID of the user/guild',
                type: 'STRING',
                required: true
            }]
        },
        {
            name: 'view',
            description: 'View the blacklist',
            type: 'SUB_COMMAND',
            options: [{
                name: 'type',
                description: 'User/Guild',
                type: 'STRING',
                required: true,
                choices: [{
                        name: 'Guild',
                        value: 'guild'
                    },
                    {
                        name: 'User',
                        value: 'user'
                    }
                ]
            }]
        }
    ],

    callback: async ({
        interaction
    }) => {
        const action = interaction.options.getSubcommand()
        switch (action) {
            case "view":
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
                if (interaction.options.getString('type') === 'guild') {
                    const blacklist = await blacklistedGuilds.find()
                    const blacklistEmbeds = genBlacklistGuildPages(blacklist)
                    if (blacklistEmbeds.length === 1) {
                        pageButtons.components[2].setDisabled(true)
                        pageButtons.components[3].setDisabled(true)
                    }
                    const firstEmbed = await interaction.reply({
                        embeds: [blacklistEmbeds[0]],
                        components: [pageButtons],
                        content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                        fetchReply: true
                    }).catch(() => {
                        return interaction.reply({
                            embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('This blacklist is empty')],
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
                                    components: [pageButtons]
                                })
                                i.deferUpdate()
                                pageButtonCollector.resetTimer()
                            } else i.reply({
                                content: `There are no more pages`,
                                ephemeral: true,
                            })
                        } else if (i.customId === 'nextPage') {
                            if (currentPage + 1 !== blacklistEmbeds.length) {
                                currentPage++
                                if (currentPage + 1 === blacklistEmbeds.length) {
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
                                    components: [pageButtons]
                                })
                                i.deferUpdate()
                                pageButtonCollector.resetTimer()
                            } else i.reply({
                                content: `There are no more pages`,
                                ephemeral: true,
                            })
                        } else if (i.customId === 'lastPage') {
                            if (currentPage + 1 !== blacklistEmbeds.length) {
                                currentPage = blacklistEmbeds.length - 1
                                if (currentPage + 1 === blacklistEmbeds.length) {
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
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
                } else if (interaction.options.getString('type') === 'user') {
                    const blacklist = await blacklistedUsers.find()
                    const blacklistEmbeds = genBlacklistUserPages(blacklist)
                    if (blacklistEmbeds.length === 1) {
                        pageButtons.components[2].setDisabled(true)
                        pageButtons.components[3].setDisabled(true)
                    }
                    const firstEmbed = await interaction.reply({
                        embeds: [blacklistEmbeds[0]],
                        components: [pageButtons],
                        content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                        fetchReply: true
                    }).catch(() => {
                        return interaction.reply({
                            embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('This blacklist is empty')],
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
                                    components: [pageButtons]
                                })
                                i.deferUpdate()
                                pageButtonCollector.resetTimer()
                            } else i.reply({
                                content: `There are no more pages`,
                                ephemeral: true,
                            })
                        } else if (i.customId === 'nextPage') {
                            if (currentPage + 1 !== blacklistEmbeds.length) {
                                currentPage++
                                if (currentPage + 1 === blacklistEmbeds.length) {
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
                                    components: [pageButtons]
                                })
                                i.deferUpdate()
                                pageButtonCollector.resetTimer()
                            } else i.reply({
                                content: `There are no more pages`,
                                ephemeral: true,
                            })
                        } else if (i.customId === 'lastPage') {
                            if (currentPage + 1 !== blacklistEmbeds.length) {
                                currentPage = blacklistEmbeds.length - 1
                                if (currentPage + 1 === blacklistEmbeds.length) {
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
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
                                    content: `Current Page: \`${currentPage + 1}/${blacklistEmbeds.length}\``,
                                    embeds: [blacklistEmbeds[currentPage]],
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
                }
                break

            case "add":
                var reason = interaction.options.getString('reason') || 'None Provided'
                if (interaction.options.getString('type') === 'guild') {
                    const check = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    const check2 = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    if (check) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This guild is already on the blacklist')]
                    })
                    if (check2) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This ID was found in the users blacklist')]
                    })
                    if (interaction.options.getString('duration')) {
                        let time
                        let type
                        const blacklistDuration = interaction.options.getString('duration')
                        try {
                            const split = blacklistDuration.match(/\d+|\D+/g)
                            time = parseInt(split[0])
                            type = split[1].toLowerCase()

                        } catch (e) {
                            return interact.reply({
                                content: "Invalid time format. Example format: \"10d\" where 'd' = days, 'h = hours and 'm' = minutes",
                                ephemeral: true
                            })
                        }

                        if (type === 'h') {
                            time *= 60
                        } else if (type === 'd') {
                            time *= 60 * 24
                        } else if (type !== 'm') {
                            return interact.reply({
                                content: 'Please use "m" (minutes), "h" (hours), "d" (days)',
                                ephemeral: true
                            })
                        }

                        const expires = new Date()
                        expires.setMinutes(expires.getMinutes() + time)

                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Added guild to the blacklist')
                                .setFields({
                                    name: 'Guild ID',
                                    value: `\`${interaction.options.getString('id')}\``,
                                    inline: true
                                }, {
                                    name: 'Duration',
                                    value: `\`${blacklistDuration}\``,
                                    inline: true
                                }, {
                                    name: 'Expires',
                                    value: `<t:${Math.round(expires.getTime() / 1000)}> (<t:${Math.round(expires.getTime() / 1000)}:R>)`,
                                    inline: true
                                }, {
                                    name: 'Reason',
                                    value: `${reason}`
                                })
                                .setColor('0xa744f2')
                            ]
                        })
                        blacklistedGuilds.create({
                            guildId: interaction.options.getString('id'),
                            reason: reason,
                            expires: expires,
                            duration: blacklistDuration
                        })

                    } else if (!interaction.options.getString('duration')) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Added guild to the blacklist')
                                .setFields({
                                    name: 'Guild ID',
                                    value: `\`${interaction.options.getString('id')}\``,
                                    inline: true
                                }, {
                                    name: 'Duration',
                                    value: `\`Eternal\``,
                                    inline: true
                                }, {
                                    name: 'Expires',
                                    value: `Never`,
                                    inline: true
                                }, {
                                    name: 'Reason',
                                    value: `${reason}`
                                })
                                .setColor('0xa744f2')
                            ]
                        })
                        blacklistedGuilds.create({
                            guildId: interaction.options.getString('id'),
                            reason: reason,
                        })

                    }
                } else if (interaction.options.getString('type') === 'user') {
                    const check = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    const check2 = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    if (check) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This user is already on the blacklist').setColor('0xa744f2')]
                    })
                    if (check2) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This ID has been found in the guilds blacklist').setColor('0xa744f2')]
                    })
                    if (interaction.options.getString('duration')) {
                        let time
                        let type
                        const blacklistDuration = interaction.options.getString('duration')
                        try {
                            const split = blacklistDuration.match(/\d+|\D+/g)
                            time = parseInt(split[0])
                            type = split[1].toLowerCase()

                        } catch (e) {
                            return interact.reply({
                                content: "Invalid time format. Example format: \"10d\" where 'd' = days, 'h = hours and 'm' = minutes",
                                ephemeral: true
                            })
                        }

                        if (type === 'h') {
                            time *= 60
                        } else if (type === 'd') {
                            time *= 60 * 24
                        } else if (type !== 'm') {
                            return interaction.reply({
                                content: 'Please use "m" (minutes), "h" (hours), "d" (days)',
                                ephemeral: true
                            })
                        }

                        const expires = new Date()
                        expires.setMinutes(expires.getMinutes() + time)

                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Added user to the blacklist')
                                .setFields({
                                    name: 'Guild ID',
                                    value: `\`${interaction.options.getString('id')}\``,
                                    inline: true
                                }, {
                                    name: 'Duration',
                                    value: `\`${blacklistDuration}\``,
                                    inline: true
                                }, {
                                    name: 'Expires',
                                    value: `<t:${Math.round(expires.getTime() / 1000)}> (<t:${Math.round(expires.getTime() / 1000)}:R>)`,
                                    inline: true
                                }, {
                                    name: 'Reason',
                                    value: `${reason}`
                                })
                            ]
                        })
                        blacklistedUsers.create({
                            userId: interaction.options.getString('id'),
                            reason: reason,
                            expires: expires,
                            duration: blacklistDuration
                        })

                    } else if (!interaction.options.getString('duration')) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Added user to the blacklist')
                                .setFields({
                                    name: 'User ID',
                                    value: `\`${interaction.options.getString('id')}\``,
                                    inline: true
                                }, {
                                    name: 'Duration',
                                    value: `\`Eternal\``,
                                    inline: true
                                }, {
                                    name: 'Expires',
                                    value: `Never`,
                                    inline: true
                                }, {
                                    name: 'Reason',
                                    value: `${reason}`
                                })
                            ]
                        })
                        blacklistedUsers.create({
                            userId: interaction.options.getString('id'),
                            reason: reason,
                        })

                    }
                }
                break

            case "remove":
                if (interaction.options.getString('type') === 'guild') {
                    const check = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    if (!check) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This guild is not blacklisted')]
                    })
                    check.delete()
                    interaction.reply({
                        embeds: [new MessageEmbed().setTitle(`Removed guild ${interaction.options.getString('id')} from the blacklist`)]
                    })
                } else {
                    const check = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    if (!check) return interaction.reply({
                        embeds: [new MessageEmbed().setTitle('This user is not blacklisted')]
                    })
                    check.delete()
                    interaction.reply({
                        embeds: [new MessageEmbed().setTitle(`Removed a user from the blacklist`).setDescription(`**User**: <@${interaction.options.getString('id')}> (\`${interaction.options.getString('id')}\`)`)]
                    })
                }
                break

            case "lookup":
                const id = interaction.options.getString('id')
                const blacklistUser = await blacklistedUsers.findOne({
                    userId: id
                })
                const blacklistGuild = await blacklistedUsers.findOne({
                    guildId: id
                })
                if (!blacklistUser && !blacklistGuild) return interaction.reply({
                    embeds: [new MessageEmbed().setTitle('This ID is not in either of the blacklists.')]
                })

                const embed = new MessageEmbed()
                    .setTitle('ID found')
                    .setColor('0xff3d15')
                if (blacklistUser) {
                    embed.setFields({
                        name: 'ID',
                        value: `\`${id}\``,
                        inline: true
                    }, {
                        name: 'Type',
                        value: `\`User\``,
                        inline: true
                    }, {
                        name: 'Added to blacklist',
                        value: `<t:${Math.round(blacklistUser.createdAt.getTime() / 1000)}> (<t:${Math.round(blacklistUser.createdAt.getTime() / 1000)}:R>)`,
                        inline: true
                    }, {
                        name: 'Duration',
                        value: `\`${blacklistUser.duration}\``,
                        inline: true
                    }, {
                        name: 'Expires',
                        value: `${blacklistUser.duration === 'Eternal' ? 'Never' : `<t:${Math.round(blacklistUser.expires.getTime() / 1000)}> (<t:${Math.round(blacklistUser.expires.getTime() / 1000)}:R>)`}`,
                        inline: true
                    }, {
                        name: 'Reason',
                        value: `${blacklistUser.reason}`
                    })
                    interaction.reply({
                        embeds: [embed]
                    })
                } else if (blacklistGuild) {
                    embed.setFields({
                        name: 'ID',
                        value: `\`${id}\``,
                        inline: true
                    }, {
                        name: 'Type',
                        value: `\`User\``,
                        inline: true
                    }, {
                        name: 'Added to blacklist',
                        value: `<t:${Math.round(blacklistGuild.createdAt.getTime() / 1000)}> (<t:${Math.round(blacklistGuild.createdAt.getTime() / 1000)}:R>)`,
                        inline: true
                    }, {
                        name: 'Duration',
                        value: `\`${blacklistGuild.duration}\``,
                        inline: true
                    }, {
                        name: 'Expires',
                        value: `${blacklistGuild.duration === 'Eternal' ? 'Never' : `<t:${Math.round(blacklistGuild.expires.getTime() / 1000)}> (<t:${Math.round(blacklistGuild.expires.getTime() / 1000)}:R>)`}`,
                        inline: true
                    }, {
                        name: 'Reason',
                        value: `${blacklistGuild.reason}`
                    })
                    interaction.reply({
                        embeds: [embed]
                    })
                }
                break
        }

        function genBlacklistUserPages(blacklist) {
            const blacklistEmbeds = []
            let k = 5
            for (let i = 0; i < blacklist.length; i += 5) {
                const current = blacklist.slice(i, k)
                let j = i
                k += 5
                let info = `Nothing on the blacklist`
                info = current.map(item => `**User**: <@${item.userId}> (\`${item.userId}\`)\n**Date Added**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: ${item.duration === 'Eternal' ? 'Never' : `<t:${Math.round(item.expires.getTime() / 1000)}:R>`}`).join('\n\n')
                const embed = new MessageEmbed()
                    .setColor('0xff3d15')
                    .setTitle(`Blacklist - Users`)
                    .setDescription(info)
                blacklistEmbeds.push(embed)
            }
            return blacklistEmbeds
        }

        function genBlacklistGuildPages(blacklist) {
            const blacklistEmbeds = []
            let k = 5
            for (let i = 0; i < blacklist.length; i += 5) {
                const current = blacklist.slice(i, k)
                let j = i
                k += 5
                let info = `Nothing on the blacklist`
                info = current.map(item => `**ID**: \`${item.guildId}\`\n**Date Added**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: ${item.duration === 'Eternal' ? 'Never' : `<t:${Math.round(item.expires.getTime() / 1000)}:R>`}`).join('\n\n')
                const embed = new MessageEmbed()
                    .setColor('0xff3d15')
                    .setTitle(`Blacklist - Guilds`)
                    .setDescription(info)
                blacklistEmbeds.push(embed)
            }
            return blacklistEmbeds
        }
    }
}