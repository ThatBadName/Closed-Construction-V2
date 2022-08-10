const {
    SelectMenuBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    SlashCommandBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')
const passiveCooldownSchema = require('../../models/passiveCooldowns')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDMPermission(false)
        .setDescription('Edit your bot settings'),

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
        functions.createRecentCommand(interaction.user.id, 'settings', `None`, interaction)
        let userProfile = await profileSchema.findOne({
            userId: interaction.user.id
        })

        if (!userProfile) {
            userProfile = await profileSchema.create({
                userId: interaction.user.id
            })
        }

        if (userProfile.developer === true) {
            const selectMenuDev = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Choose a setting')
                    .setCustomId('select')
                    .addOptions([{
                            label: 'Dev Mode',
                            description: 'Enable developer mode',
                            value: 'devmode',
                        },
                        {
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Passive Mode',
                            description: 'Be immune to robbing. You will also not be able to interact with other users',
                            value: 'passive',
                        },
                        {
                            label: 'Unread Notification Alert',
                            description: 'Get notified when you have an unread notification',
                            value: 'notifalert',
                        },
                        {
                            label: 'Vote Alerts',
                            description: 'Get notified when you can vote again',
                            value: 'votealert',
                        }
                    ]),
                )
            const selectMenuDevUsed = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Choose a setting')
                    .setCustomId('select')
                    .addOptions([{
                            label: 'Dev Mode',
                            description: 'Enable developer mode',
                            value: 'devmode',
                        },
                        {
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Passive Mode',
                            description: 'Be immune to robbing. You will also not be able to interact with other users',
                            value: 'passive',
                        },
                        {
                            label: 'Unread Notification Alert',
                            description: 'Get notified when you have an unread notification',
                            value: 'notifalert',
                        },
                        {
                            label: 'Vote Alerts',
                            description: 'Get notified when you can vote again',
                            value: 'votealert',
                        }
                    ]),
                )

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('enable')
                    .setDisabled(true)
                    .setLabel('Enable')
                    .setStyle('Success'),

                    new ButtonBuilder()
                    .setCustomId('disable')
                    .setDisabled(true)
                    .setLabel('Disable')
                    .setStyle('Danger'),
                )

            const settingsEmbed = new EmbedBuilder()
                .setFooter({
                    text: `Use the menu bellow to change your settings`
                })
                .setColor('0xa744f2')

            let currentSetting = 'devMode'
            if (currentSetting === 'devMode') settingsEmbed.setTitle('Dev Mode').setDescription('If your not a developer then how can you see this?')
            if (userProfile.devMode === false) {
                buttons.components[0].setDisabled(false)
                buttons.components[1].setDisabled(true)
            } else {
                buttons.components[0].setDisabled(true)
                buttons.components[1].setDisabled(false)
            }
            const collectorMessage = await interaction.reply({
                embeds: [settingsEmbed],
                components: [selectMenuDev, buttons],
                fetchReply: true
            })
            const collector = await collectorMessage.createMessageComponentCollector({
                type: 'Button',
                time: 15000
            })
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                if (i.customId === 'enable') {
                    if (currentSetting === 'devMode') userProfile.devMode = true
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = true
                    if (currentSetting === 'texting') userProfile.texting = true
                    if (currentSetting === 'notifalert') userProfile.unreadAlert = true
                    if (currentSetting === 'votealert') userProfile.voteReminders = true
                    if (currentSetting === 'passive') {
                        const checkForPassive = await passiveCooldownSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (checkForPassive) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Slow down!')
                                .setDescription(`You have changed your passive status in the past 24 hours. You can change it again <t:${Math.round(checkForPassive.expires.getTime() / 1000)}:R>`)
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true

                        })
                        const date = new Date()
                        date.setHours(date.getHours() + 24)

                        userProfile.passive = true
                        if (userProfile.devMode === false) {
                            await passiveCooldownSchema.create({
                                userId: interaction.user.id,
                                expires: date
                            })

                        }
                    }
                    userProfile.save()
                    buttons.components[0].setDisabled(true)
                    buttons.components[1].setDisabled(false)
                    collectorMessage.edit({
                        components: [selectMenuDevUsed, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'disable') {
                    if (currentSetting === 'devMode') userProfile.devMode = false
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = false
                    if (currentSetting === 'texting') userProfile.texting = false
                    if (currentSetting === 'notifalert') userProfile.unreadAlert = false
                    if (currentSetting === 'votealert') userProfile.voteReminders = false
                    if (currentSetting === 'passive') {
                        const checkForPassive = await passiveCooldownSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (checkForPassive) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Slow down!')
                                .setDescription(`You have changed your passive status in the past 24 hours. You can change it again <t:${Math.round(checkForPassive.expires.getTime() / 1000)}:R>`)
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true

                        })
                        const date = new Date()
                        date.setHours(date.getHours() + 24)

                        userProfile.passive = false
                        if (userProfile.devMode === false) {
                            await passiveCooldownSchema.create({
                                userId: interaction.user.id,
                                expires: date
                            })


                        }
                    }
                    userProfile.save()
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(true)
                    collectorMessage.edit({
                        components: [selectMenuDevUsed, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'select') {
                    if (i.values[0] === 'devmode') {
                        currentSetting = 'devMode'
                        settingsEmbed.setTitle('Dev Mode')
                            .setDescription('If your not a developer then how can you see this?')
                        if (userProfile.devMode === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }
                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'dmnotifs') {
                        currentSetting = 'dmNotifs'
                        settingsEmbed.setTitle('DM Notifications')
                            .setDescription('Notifications will be sent in your DMs when enabled')
                        if (userProfile.dmNotifs === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'text') {
                        currentSetting = 'texting'
                        settingsEmbed.setTitle('Texting')
                            .setDescription('Allow people to text you')
                        if (userProfile.texting === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'notifalert') {
                        currentSetting = 'notifalert'
                        settingsEmbed.setTitle('Unread Notification Alert')
                            .setDescription('Get notified when you have an unread notification')
                        if (userProfile.unreadAlert === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'passive') {
                        currentSetting = 'passive'
                        settingsEmbed.setTitle('Passive Mode')
                            .setDescription('Be immune to robbing. You will also not be able to interact with other users')
                        if (userProfile.passive === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'votealert') {
                        currentSetting = 'votealert'
                        settingsEmbed.setTitle('Vote Alerts')
                            .setDescription('Get notified when you can vote again')
                        if (userProfile.voteReminders === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuDevUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    }
                }
            })
            collector.on('end', () => {
                settingsEmbed.setFooter({
                    text: `This menu has timed out. Please run the command again`
                })
                collectorMessage.edit({
                    components: [],
                    embeds: [settingsEmbed]
                })
            })


        } else {
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Choose a setting')
                    .setCustomId('select')
                    .addOptions([{
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Passive Mode',
                            description: 'Be immune to robbing. You will also not be able to interact with other users',
                            value: 'passive',
                        },
                        {
                            label: 'Unread Notification Alert',
                            description: 'Get notified when you have an unread notification',
                            value: 'notifalert',
                        },
                        {
                            label: 'Vote Alerts',
                            description: 'Get notified when you can vote again',
                            value: 'votealert',
                        }
                    ]),
                )

            const selectMenuUsed = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Choose a setting')
                    .setCustomId('select')
                    .addOptions([{
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Passive Mode',
                            description: 'Be immune to robbing. You will also not be able to interact with other users',
                            value: 'passive',
                        },
                        {
                            label: 'Unread Notification Alert',
                            description: 'Get notified when you have an unread notification',
                            value: 'notifalert',
                        },
                        {
                            label: 'Vote Alerts',
                            description: 'Get notified when you can vote again',
                            value: 'votealert',
                        }
                    ]),
                )

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('enable')
                    .setDisabled(true)
                    .setLabel('Enable')
                    .setStyle('Success'),

                    new ButtonBuilder()
                    .setCustomId('disable')
                    .setDisabled(true)
                    .setLabel('Disable')
                    .setStyle('Danger'),
                )

            const settingsEmbed = new EmbedBuilder()
                .setFooter({
                    text: `Use the menu bellow to change your settings`
                })
                .setColor('0xa744f2')

            let currentSetting = 'dmNotifs'
            if (currentSetting === 'dmNotifs') settingsEmbed.setTitle('DM Notifications').setDescription('Notifications will be sent in your DMs when enabled')
            if (userProfile.dmNotifs === false) {
                buttons.components[0].setDisabled(false)
                buttons.components[1].setDisabled(true)
            } else {
                buttons.components[0].setDisabled(true)
                buttons.components[1].setDisabled(false)
            }
            const collectorMessage = await interaction.reply({
                embeds: [settingsEmbed],
                components: [selectMenu, buttons],
                fetchReply: true
            })
            const collector = await collectorMessage.createMessageComponentCollector({
                type: 'Button',
                time: 15000
            })
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                if (i.customId === 'enable') {
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = true
                    if (currentSetting === 'texting') userProfile.texting = true
                    if (currentSetting === 'notifalert') userProfile.unreadAlert = true
                    if (currentSetting === 'votealert') userProfile.voteReminders = true
                    if (currentSetting === 'passive') {
                        const checkForPassive = await passiveCooldownSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (checkForPassive) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Slow down!')
                                .setDescription(`You have changed your passive status in the past 24 hours. You can change it again <t:${Math.round(checkForPassive.expires.getTime() / 1000)}:R>`)
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true

                        })
                        const date = new Date()
                        date.setHours(date.getHours() + 24)

                        userProfile.passive = true
                        if (userProfile.devMode === false) {
                            await passiveCooldownSchema.create({
                                userId: interaction.user.id,
                                expires: date
                            })

                        }
                    }
                    userProfile.save()
                    buttons.components[0].setDisabled(true)
                    buttons.components[1].setDisabled(false)
                    collectorMessage.edit({
                        components: [selectMenuUsed, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'disable') {
                    if (currentSetting === 'texting') userProfile.texting = false
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = false
                    if (currentSetting === 'notifalert') userProfile.unreadAlert = false
                    if (currentSetting === 'votealert') userProfile.voteReminders = false
                    if (currentSetting === 'passive') {
                        const checkForPassive = await passiveCooldownSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (checkForPassive) return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Slow down!')
                                .setDescription(`You have changed your passive status in the past 24 hours. You can change it again <t:${Math.round(checkForPassive.expires.getTime() / 1000)}:R>`)
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true

                        })
                        const date = new Date()
                        date.setHours(date.getHours() + 24)

                        userProfile.passive = false
                        if (userProfile.devMode === false) {
                            await passiveCooldownSchema.create({
                                userId: interaction.user.id,
                                expires: date
                            })

                        }
                    }
                    userProfile.save()
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(true)
                    collectorMessage.edit({
                        components: [selectMenuUsed, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'select') {
                    if (i.values[0] === 'dmnotifs') {
                        currentSetting = 'dmNotifs'
                        settingsEmbed.setTitle('DM Notifications')
                            .setDescription('Notifications will be sent in your DMs when enabled')
                        if (userProfile.dmNotifs === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'text') {
                        currentSetting = 'texting'
                        settingsEmbed.setTitle('Texting')
                            .setDescription('Allow people to text you')
                        if (userProfile.texting === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'notifalert') {
                        currentSetting = 'notifalert'
                        settingsEmbed.setTitle('Unread Notification Alert')
                            .setDescription('Get notified when you have an unread notification')
                        if (userProfile.unreadAlert === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'passive') {
                        currentSetting = 'passive'
                        settingsEmbed.setTitle('Passive Mode')
                            .setDescription('Be immune to robbing. You will also not be able to interact with other users')
                        if (userProfile.passive === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    } else if (i.values[0] === 'votealert') {
                        currentSetting = 'votealert'
                        settingsEmbed.setTitle('Vote Alerts')
                            .setDescription('Get notified when you can vote again')
                        if (userProfile.voteReminders === false) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        }

                        collectorMessage.edit({
                            embeds: [settingsEmbed],
                            components: [selectMenuUsed, buttons]
                        })
                        collector.resetTimer()
                        i.deferUpdate()
                    }
                }
            })
            collector.on('end', () => {
                settingsEmbed.setFooter({
                    text: `This menu has timed out. Please run the command again`
                })
                collectorMessage.edit({
                    components: [],
                    embeds: [settingsEmbed]
                })
            })
        }
    }
}