const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
} = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guild')
        .setDMPermission(false)
        .setDescription('Manage the bots guilds')
        .addSubcommand(option =>
            option.setName('leave')
            .setDescription('Leave a guild')
            .addBooleanOption(option =>
                option.setName('invite')
                .setDescription('Create an invite to the server')
                .setRequired(true)    
            )
            
            .addStringOption(option =>
                option.setName('guild-name')
                .setDescription('The guild to leave')
                .setAutocomplete(true)
                .setRequired(false)
            )

            .addStringOption(option =>
                option.setName('guild-id')
                .setDescription('The guild to leave')
                .setAutocomplete(true)
                .setRequired(false)
            )

        )
        
        .addSubcommand(option =>
            option.setName('lookup')
            .setDescription('Lookup a guild')
            .addBooleanOption(option =>
                option.setName('invite')
                .setDescription('Create an invite to the server')
                .setRequired(true)    
            )

            .addStringOption(option =>
                option.setName('guild-name')
                .setDescription('The guild to leave')
                .setAutocomplete(true)
                .setRequired(false)
            )

            .addStringOption(option =>
                option.setName('guild-id')
                .setDescription('The guild to leave')
                .setAutocomplete(true)
                .setRequired(false)
            )

        ),

    async autocomplete(interaction, client) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'guild-name') {
            const focusedValue = interaction.options.getFocused()
            let choices = await client.shard.broadcastEval(c => c.guilds.cache.map(g => g.name + ',' + g.id))
            choices = choices[0]
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice.split(',')[0],
                    value: choice.split(',')[1]
                }))
            )
        } else if (focusedOption.name === 'guild-id') {
            const focusedValue = interaction.options.getFocused()
            let choices = await client.shard.broadcastEval(c => c.guilds.cache.map(g => g.id))
            choices = choices[0]
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice,
                    value: choice
                }))
            )
        }
    },

    async execute(interaction, client) {
        const checkForDev = await profileSchema.findOne({
            userId: interaction.user.id,
            developer: true
        })
        const checkForAdmin = await profileSchema.findOne({
            userId: interaction.user.id,
            botAdmin: true
        })
        const checkForMod = await profileSchema.findOne({
            userId: interaction.user.id,
            botModerator: true
        })
        if (!checkForDev && !checkForAdmin && !checkForMod && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have permission to do this')
                .setColor('0xa477fc')
            ]
        })

        if (interaction.options.getSubcommand() === 'leave') {
            if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have permission to do this')
                    .setColor('0xa477fc')
                ]
            })

            const leaveGuildId = interaction.options.getString('guild-name') || interaction.options.getString('guild-id')
            if (!leaveGuildId) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please provide a name or ID')
                    .setColor('0xa477fc')
                ]
            })

            const guild = await client.guilds.cache.find(g => g.id === leaveGuildId)
            if (!guild) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I am not in that guild')
                    .setColor('0xa477fc')
                ]
            })

            let invite = await guild.invites.fetch().catch(() => {})
            if (!invite) {
                if (interaction.options.getBoolean('invite') === true) {
                    channel = await guild.channels.cache.find(channel => channel.type === ChannelType.GuildText)
                    invite = await guild.invites.create(channel, {
                        maxAge: 300
                    }).catch(() => {})
                }

                const confirmEmbed = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Please confirm the following details')
                        .setDescription(`The guild I am about to leave goes by the following`)
                        .setFields({
                            name: 'Name',
                            value: `\`${guild.name}\``,
                            inline: true
                        }, {
                            name: 'ID',
                            value: `\`${guild.id}\``,
                            inline: true
                        }, {
                            name: 'Member Count',
                            value: `\`${guild.memberCount}\``,
                            inline: true
                        }, {
                            name: 'Owner',
                            value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                            inline: true
                        }, {
                            name: 'Invite',
                            value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite.code}](https://discord.gg/${invite.code}) - This invite lasts 5 minutes` : 'Missing Permissions' : 'Not created',
                            inline: true
                        })
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('leave-guild')
                            .setLabel('Confirm')
                            .setStyle('Danger'),

                            new ButtonBuilder()
                            .setCustomId('stay-guild')
                            .setLabel('Cancel')
                            .setStyle('Success'),
                        )
                    ],
                    fetchReply: true
                })

                const confirmLeave = await confirmEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 30000
                })

                let actionTaken = false
                confirmLeave.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    if (i.customId === 'leave-guild') {
                        actionTaken = true
                        confirmLeave.stop()
                        guild.leave()
                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Action Confirmed')
                                .setColor('0xa477fc')
                                .setDescription('I have now left the server')
                                .setFields({
                                    name: 'Name',
                                    value: `\`${guild.name}\``,
                                    inline: true
                                }, {
                                    name: 'ID',
                                    value: `\`${guild.id}\``,
                                    inline: true
                                }, {
                                    name: 'Member Count',
                                    value: `\`${guild.memberCount}\``,
                                    inline: true
                                }, {
                                    name: 'Owner',
                                    value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                    inline: true
                                }, {
                                    name: 'Invite',
                                    value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite.code}](https://discord.gg/${invite.code}) - This invite lasts 5 minutes` : 'Missing Permissions' : 'Not created',
                                    inline: true
                                })
                            ],
                            components: []
                        })
                    } else if (i.customId === 'stay-guild') {
                        actionTaken = true
                        confirmLeave.stop()
                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Action Canceled')
                                .setDescription('I have not left this server')
                                .setColor('0xa477fc')
                                .setFields({
                                    name: 'Name',
                                    value: `\`${guild.name}\``,
                                    inline: true
                                }, {
                                    name: 'ID',
                                    value: `\`${guild.id}\``,
                                    inline: true
                                }, {
                                    name: 'Member Count',
                                    value: `\`${guild.memberCount}\``,
                                    inline: true
                                }, {
                                    name: 'Owner',
                                    value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                    inline: true
                                }, {
                                    name: 'Invite',
                                    value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite.code}](https://discord.gg/${invite.code}) - This invite lasts 5 minutes` : 'Missing Permissions' : 'Not created',
                                    inline: true
                                })
                            ],
                            components: []
                        })
                    }

                })
                confirmLeave.on('end', async (i) => {
                    if (actionTaken === true) return
                    confirmEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Action Canceled - Timed Out')
                            .setColor('0xa477fc')
                            .setDescription('I have not left the server')
                            .setFields({
                                name: 'Name',
                                value: `\`${guild.name}\``,
                                inline: true
                            }, {
                                name: 'ID',
                                value: `\`${guild.id}\``,
                                inline: true
                            }, {
                                name: 'Member Count',
                                value: `\`${guild.memberCount}\``,
                                inline: true
                            }, {
                                name: 'Owner',
                                value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                inline: true
                            }, {
                                name: 'Invite',
                                value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite.code}](https://discord.gg/${invite.code}) - This invite lasts 5 minutes` : 'Missing Permissions' : 'Not created',
                                inline: true
                            })
                        ],
                        components: []
                    })
                })
            } else {
                invite = invite.map(i => i.code)

                const confirmEmbed = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Please confirm the following details')
                        .setDescription(`The guild I am about to leave goes by the following`)
                        .setFields({
                            name: 'Name',
                            value: `\`${guild.name}\``,
                            inline: true
                        }, {
                            name: 'ID',
                            value: `\`${guild.id}\``,
                            inline: true
                        }, {
                            name: 'Member Count',
                            value: `\`${guild.memberCount}\``,
                            inline: true
                        }, {
                            name: 'Owner',
                            value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                            inline: true
                        }, {
                            name: 'Invite',
                            value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite[0]}](https://discord.gg/${invite[0]})` : 'Missing Permissions' : 'Not created',
                            inline: true
                        })
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('leave-guild')
                            .setLabel('Confirm')
                            .setStyle('Danger'),

                            new ButtonBuilder()
                            .setCustomId('stay-guild')
                            .setLabel('Cancel')
                            .setStyle('Success'),
                        )
                    ],
                    fetchReply: true
                })

                const confirmLeave = await confirmEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 30000
                })

                let actionTaken = false
                confirmLeave.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    if (i.customId === 'leave-guild') {
                        actionTaken = true
                        confirmLeave.stop()
                        guild.leave()
                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Action Confirmed')
                                .setColor('0xa477fc')
                                .setDescription('I have now left the server')
                                .setFields({
                                    name: 'Name',
                                    value: `\`${guild.name}\``,
                                    inline: true
                                }, {
                                    name: 'ID',
                                    value: `\`${guild.id}\``,
                                    inline: true
                                }, {
                                    name: 'Member Count',
                                    value: `\`${guild.memberCount}\``,
                                    inline: true
                                }, {
                                    name: 'Owner',
                                    value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                    inline: true
                                }, {
                                    name: 'Invite',
                                    value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite[0]}](https://discord.gg/${invite[0]})` : 'Missing Permissions' : 'Not created',
                                    inline: true
                                })
                            ],
                            components: []
                        })
                    } else if (i.customId === 'stay-guild') {
                        actionTaken = true
                        confirmLeave.stop()
                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Action Canceled')
                                .setDescription('I have not left this server')
                                .setColor('0xa477fc')
                                .setFields({
                                    name: 'Name',
                                    value: `\`${guild.name}\``,
                                    inline: true
                                }, {
                                    name: 'ID',
                                    value: `\`${guild.id}\``,
                                    inline: true
                                }, {
                                    name: 'Member Count',
                                    value: `\`${guild.memberCount}\``,
                                    inline: true
                                }, {
                                    name: 'Owner',
                                    value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                    inline: true
                                }, {
                                    name: 'Invite',
                                    value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite[0]}](https://discord.gg/${invite[0]})` : 'Missing Permissions' : 'Not created',
                                    inline: true
                                })
                            ],
                            components: []
                        })
                    }

                })
                confirmLeave.on('end', async (i) => {
                    if (actionTaken === true) return
                    confirmEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Action Canceled - Timed Out')
                            .setColor('0xa477fc')
                            .setDescription('I have not left the server')
                            .setFields({
                                name: 'Name',
                                value: `\`${guild.name}\``,
                                inline: true
                            }, {
                                name: 'ID',
                                value: `\`${guild.id}\``,
                                inline: true
                            }, {
                                name: 'Member Count',
                                value: `\`${guild.memberCount}\``,
                                inline: true
                            }, {
                                name: 'Owner',
                                value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                                inline: true
                            }, {
                                name: 'Invite',
                                value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite[0]}](https://discord.gg/${invite[0]})` : 'Missing Permissions' : 'Not created',
                                inline: true
                            })
                        ],
                        components: []
                    })
                })
            }
        } else if (interaction.options.getSubcommand() === 'lookup') {
            const leaveGuildId = interaction.options.getString('guild-name') || interaction.options.getString('guild-id')
            if (!leaveGuildId) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please provide a name or ID')
                    .setColor('0xa477fc')
                ]
            })

            const guild = await client.guilds.cache.find(g => g.id === leaveGuildId)
            if (!guild) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I am not in that guild')
                    .setColor('0xa477fc')
                ]
            })

            let invite = await guild.invites.fetch().catch(() => {})
            if (!invite) {
                if (interaction.options.getBoolean('invite') === true) {
                    channel = await guild.channels.cache.find(channel => channel.type === ChannelType.GuildText)
                    invite = await guild.invites.create(channel, {
                        maxAge: 300
                    }).catch(() => {})
                }

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Found Guild')
                        .setFields({
                            name: 'Name',
                            value: `\`${guild.name}\``,
                            inline: true
                        }, {
                            name: 'ID',
                            value: `\`${guild.id}\``,
                            inline: true
                        }, {
                            name: 'Member Count',
                            value: `\`${guild.memberCount}\``,
                            inline: true
                        }, {
                            name: 'Owner',
                            value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                            inline: true
                        }, {
                            name: 'Invite',
                            value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite.code}](https://discord.gg/${invite.code}) - This invite lasts 5 minutes` : 'Missing Permissions' : 'Not created',
                            inline: true
                        })
                        .setColor('0xa477fc')
                    ],
                })
            } else {
                invite = invite.map(i => i.code)

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Guild Found')
                        .setFields({
                            name: 'Name',
                            value: `\`${guild.name}\``,
                            inline: true
                        }, {
                            name: 'ID',
                            value: `\`${guild.id}\``,
                            inline: true
                        }, {
                            name: 'Member Count',
                            value: `\`${guild.memberCount}\``,
                            inline: true
                        }, {
                            name: 'Owner',
                            value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`,
                            inline: true
                        }, {
                            name: 'Invite',
                            value: interaction.options.getBoolean('invite') === true ? invite ? `[${invite[0]}](https://discord.gg/${invite[0]})` : 'Missing Permissions' : 'Not created',
                            inline: true
                        })
                        .setColor('0xa477fc')
                    ],
                })
            }
        }

    }
}