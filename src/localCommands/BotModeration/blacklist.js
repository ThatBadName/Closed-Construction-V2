const blacklistedUsers = require('../../models/blacklistUser')
const blacklistedGuilds = require('../../models/blacklistGuild')
const botSchema = require('../../models/bot')
const profileSchema = require('../../models/userProfile')
const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    SlashCommandBuilder
} = require('discord.js')
const functions = require('../../commandFunctions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDMPermission(false)
        .setDescription('View and manage the blacklist')
        .addSubcommand(option =>
            option.setName('add')
            .setDescription('Add a user/guild to the blacklist')
            .addStringOption(option =>
                option.setName('id')
                .setDescription('The ID of the user/guild')
                .setRequired(true)
            )

            .addStringOption(option =>
                option.setName('type')
                .setDescription('User/Guild')
                .addChoices({
                    name: 'Guild',
                    value: 'guild'
                }, {
                    name: 'User',
                    value: 'user'
                })
                .setRequired(true)
            )

            .addStringOption(option =>
                option.setName('duration')
                .setDescription('The duration of the punishment')
                .setRequired(false)
            )

            .addStringOption(option =>
                option.setName('reason')
                .setDescription('The reason for the punishment')
                .setRequired(false)
                .setMaxLength(250)
            )
        )

        .addSubcommand(option =>
            option.setName('remove')
            .setDescription('Remove a user/guild from the blacklist')
            .addStringOption(option =>
                option.setName('id')
                .setDescription('The ID of the user/guild')
                .setRequired(true)
            )

            .addStringOption(option =>
                option.setName('type')
                .setDescription('User/Guild')
                .addChoices({
                    name: 'Guild',
                    value: 'guild'
                }, {
                    name: 'User',
                    value: 'user'
                })
                .setRequired(true)
            )
        )

        .addSubcommand(option =>
            option.setName('lookup')
            .setDescription('Lookup a punishment')
            .addStringOption(option =>
                option.setName('id')
                .setDescription('The ID of the user/guild')
                .setRequired(false)
            )

            .addIntegerOption(option =>
                option.setName('case')
                .setDescription('The case number')
                .setRequired(false)
            )
        )

        .addSubcommand(option =>
            option.setName('view')
            .setDescription('View the blacklist')
            .addStringOption(option =>
                option.setName('type')
                .setDescription('User/Guild')
                .addChoices({
                    name: 'Guild',
                    value: 'guild'
                }, {
                    name: 'User',
                    value: 'user'
                })
                .setRequired(true)
            )
        ),

    async execute(
        interaction
    ) {
        const checkForDev = await profileSchema.findOne({
            userId: interaction.user.id,
            developer: true
        })
        const checkForAdmin = await profileSchema.findOne({
            userId: interaction.user.id,
            botAdmin: true
        })
        const checkForModerator = await profileSchema.findOne({
            userId: interaction.user.id,
            botModerator: true
        })
        if (!checkForDev && !checkForAdmin && !checkForModerator) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have permission to do this')
                .setColor('0xa477fc')
            ]
        })

        const action = interaction.options.getSubcommand()
        switch (action) {
            case "view":
                functions.createRecentCommand(interaction.user.id, 'blacklist-view', `TYPE: ${interaction.options.getString('type')}`, interaction, false, true)
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
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('This blacklist is empty')],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('This blacklist is empty')],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                                    embeds: [blacklistEmbeds[currentPage].setFooter({
                                        text: `Page ${currentPage + 1}/${blacklistEmbeds.length}`
                                    })],
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
                const checkIfDev = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    developer: true
                })
                const checkIfAdmin = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    botAdmin: true
                })
                const checkIfModerator = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    botModerator: true
                })
                if (checkIfDev || checkIfAdmin || checkIfModerator) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Don\'t try to blacklist other bot staff')
                        .setColor('0xa477fc')
                    ]
                })
                if (!checkForDev && !checkForAdmin) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You do not have permission to do this')
                        .setColor('0xa477fc')
                    ]
                })
                var reason = interaction.options.getString('reason') || 'None Provided'
                if (interaction.options.getString('type') === 'guild') {
                    const check = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    const check2 = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    if (check) return interaction.reply({
                        embeds: [new EmbedBuilder().setTitle('This guild is already on the blacklist')]
                    })
                    if (check2) return interaction.reply({
                        embeds: [new EmbedBuilder().setTitle('This ID was found in the users blacklist')]
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

                        functions.createRecentCommand(interaction.user.id, 'blacklist-add', `TYPE: Guild | ID: ${interaction.options.getString('id')} | DURATION: ${interaction.options.getString('duration')} | REASON: ${reason}`, interaction, false, true)

                        const expires = new Date()
                        expires.setMinutes(expires.getMinutes() + time)

                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
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
                        const caseNumber = await botSchema.findOne()

                        await blacklistedGuilds.create({
                            id: caseNumber.blacklistCaseAmount + 1,
                            guildId: interaction.options.getString('id'),
                            reason: reason,
                            expires: expires,
                            duration: blacklistDuration
                        })

                        caseNumber.blacklistCaseAmount += 1
                        caseNumber.save()

                    } else if (!interaction.options.getString('duration')) {
                        functions.createRecentCommand(interaction.user.id, 'blacklist-add', `TYPE: Guild | ID: ${interaction.options.getString('id')} | DURATION: Eternal | REASON: ${reason}`, interaction, true, true)
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
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
                        const caseNumber = await botSchema.findOne()
                        await blacklistedGuilds.create({
                            id: caseNumber.blacklistCaseAmount + 1,
                            guildId: interaction.options.getString('id'),
                            reason: reason,
                        })

                        caseNumber.blacklistCaseAmount += 1
                        caseNumber.save()

                    }
                } else if (interaction.options.getString('type') === 'user') {
                    const check = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    const check2 = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    if (check) return interaction.reply({
                        embeds: [new EmbedBuilder().setTitle('This user is already on the blacklist').setColor('0xa744f2')]
                    })
                    if (check2) return interaction.reply({
                        embeds: [new EmbedBuilder().setTitle('This ID has been found in the guilds blacklist').setColor('0xa744f2')]
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

                        functions.createRecentCommand(interaction.user.id, 'blacklist-add', `TYPE: User | ID: ${interaction.options.getString('id')} | DURATION: ${interaction.options.getString('duration')} | REASON: ${reason}`, interaction, false, true)

                        const expires = new Date()
                        expires.setMinutes(expires.getMinutes() + time)

                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
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
                        const caseNumber = await botSchema.findOne()
                        await blacklistedUsers.create({
                            id: caseNumber.blacklistCaseAmount + 1,
                            userId: interaction.options.getString('id'),
                            reason: reason,
                            expires: expires,
                            duration: blacklistDuration
                        })

                        caseNumber.blacklistCaseAmount += 1
                        caseNumber.save()

                    } else if (!interaction.options.getString('duration')) {
                        functions.createRecentCommand(interaction.user.id, 'blacklist-add', `TYPE: User | ID: ${interaction.options.getString('id')} | DURATION: Eternal | REASON: ${reason}`, interaction, true, true)
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
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
                        const caseNumber = await botSchema.findOne()
                        await blacklistedUsers.create({
                            id: caseNumber.blacklistCaseAmount + 1,
                            userId: interaction.options.getString('id'),
                            reason: reason,
                        })

                        caseNumber.blacklistCaseAmount += 1
                        caseNumber.save()

                    }
                }
                break

            case "remove":
                const checkIfDev1 = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    developer: true
                })
                const checkIfAdmin1 = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    botAdmin: true
                })
                const checkIfModerator1 = await profileSchema.findOne({
                    userId: interaction.options.getString('id'),
                    botModerator: true
                })
                if (checkIfDev1 || checkIfAdmin1 || checkIfModerator1) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You can\'t remove bot staff from the blacklist')
                        .setColor('0xa477fc')
                    ]
                })
                if (!checkForDev && !checkForAdmin) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You do not have perms to manage the blacklist')
                        .setColor('0xa477fc')
                    ]
                })
                const omgSoLongMsg1 = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Please wait while the bot finds the documents')
                        .setColor('0xa477fc')
                    ],
                    fetchReply: true
                })
                if (interaction.options.getString('type') === 'guild') {
                    const check = await blacklistedGuilds.findOne({
                        guildId: interaction.options.getString('id')
                    })
                    if (!check) return omgSoLongMsg1.edit({
                        embeds: [new EmbedBuilder().setTitle('This guild is not blacklisted')]
                    })
                    functions.createRecentCommand(interaction.user.id, 'blacklist-remove', `TYPE: Guild | ID: ${interaction.options.getString('id')}`, interaction, true, true)
                    check.delete()
                    omgSoLongMsg1.edit({
                        embeds: [new EmbedBuilder().setTitle(`Removed guild ${interaction.options.getString('id')} from the blacklist`)]
                    })
                } else {
                    const check = await blacklistedUsers.findOne({
                        userId: interaction.options.getString('id')
                    })
                    if (!check) return omgSoLongMsg1.edit({
                        embeds: [new EmbedBuilder().setTitle('This user is not blacklisted')]
                    })
                    functions.createRecentCommand(interaction.user.id, 'blacklist-remove', `TYPE: User | ID: ${interaction.options.getString('id')}`, interaction, true, true)
                    check.delete()
                    omgSoLongMsg1.edit({
                        embeds: [new EmbedBuilder().setTitle(`Removed a user from the blacklist`).setDescription(`**User**: <@${interaction.options.getString('id')}> (\`${interaction.options.getString('id')}\`)`)]
                    })
                }
                break

            case "lookup":
                const omgSoLongMsg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Please wait while the bot finds the documents')
                        .setColor('0xa477fc')
                    ],
                    fetchReply: true
                })
                const id = interaction.options.getString('id')
                const caseNumber = interaction.options.getInteger('case')
                let blacklistUser
                let blacklistGuild
                if (id && !caseNumber) {
                    blacklistUser = await blacklistedUsers.findOne({
                        userId: id
                    })
                    blacklistGuild = await blacklistedGuilds.findOne({
                        guildId: id
                    })
                }
                if (!id && caseNumber) {
                    blacklistUser = await blacklistedUsers.findOne({
                        id: caseNumber
                    })
                    blacklistGuild = await blacklistedGuilds.findOne({
                        id: caseNumber
                    })
                }
                if (!caseNumber && !id) return omgSoLongMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Please fill in at least 1 field')
                        .setColor('0xa477fc')
                    ],
                })
                if (caseNumber && id) return omgSoLongMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Only 1 field can be filled')
                        .setColor('0xa477fc')
                    ],
                })
                functions.createRecentCommand(interaction.user.id, 'blacklist-lookup', `ID: ${interaction.options.getString('id')}`, interaction, false, true)
                if (!blacklistUser && !blacklistGuild) return omgSoLongMsg.edit({
                    embeds: [new EmbedBuilder().setTitle('This ID is not in either of the blacklists.')]
                })

                const embed = new EmbedBuilder()
                    .setTitle('Item Found')
                    .setColor('0xff3d15')
                if (blacklistUser) {
                    embed.setFields({
                        name: 'ID',
                        value: `\`${blacklistUser.userId}\``,
                        inline: true
                    }, {
                        name: 'Case',
                        value: `\`${blacklistUser.id}\``,
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
                    omgSoLongMsg.edit({
                        embeds: [embed]
                    })
                } else if (blacklistGuild) {
                    embed.setFields({
                        name: 'ID',
                        value: `\`${blacklistGuild.userId}\``,
                        inline: true
                    }, {
                        name: 'Case',
                        value: `\`${blacklistGuild.id}\``,
                        inline: true
                    }, {
                        name: 'Type',
                        value: `\`Guild\``,
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
                    omgSoLongMsg.edit({
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
                info = current.map(item => `**Case**: \`${item.id}\`\n**User**: <@${item.userId}> (\`${item.userId}\`)\n**Date Added**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: ${item.duration === 'Eternal' ? 'Never' : `<t:${Math.round(item.expires.getTime() / 1000)}:R>`}`).join('\n\n')
                const embed = new EmbedBuilder()
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
                info = current.map(item => `**Case**: \`${item.id}\`\n**ID**: \`${item.guildId}\`\n**Date Added**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: ${item.duration === 'Eternal' ? 'Never' : `<t:${Math.round(item.expires.getTime() / 1000)}:R>`}`).join('\n\n')
                const embed = new EmbedBuilder()
                    .setColor('0xff3d15')
                    .setTitle(`Blacklist - Guilds`)
                    .setDescription(info)
                blacklistEmbeds.push(embed)
            }
            return blacklistEmbeds
        }
    }
}