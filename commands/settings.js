const {
    MessageSelectMenu,
    MessageButton,
    MessageEmbed,
    MessageActionRow
} = require('discord.js')
const profileSchema = require('../models/userProfile')

module.exports = {
    name: 'settings',
    aliases: [''],
    description: 'Edit your settings',
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
            const selectMenuDev = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('select')
                    .addOptions([{
                            label: 'Dev Mode',
                            description: 'Enable developer mode',
                            value: 'devmode',
                            default: true
                        },
                        {
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Texting',
                            description: 'Allow users to send you texts',
                            value: 'text',
                        }
                    ]),
                )
            const selectMenuDmNofif = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
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
                            default: true
                        },
                        {
                            label: 'Texting',
                            description: 'Allow users to send you texts',
                            value: 'text',
                        }
                    ]),
                )
            const selectMenuText = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
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
                            label: 'Texting',
                            description: 'Allow users to send you texts',
                            value: 'text',
                            default: true
                        }
                    ]),
                )

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('enable')
                    .setDisabled(true)
                    .setLabel('Enable')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('disable')
                    .setDisabled(true)
                    .setLabel('Disable')
                    .setStyle('DANGER'),
                )

            const settingsEmbed = new MessageEmbed()
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
                type: 'BUTTON',
                time: 15000
            })
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })

                if (i.customId === 'enable') {
                    if (currentSetting === 'devMode') userProfile.devMode = true
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = true
                    if (currentSetting === 'texting') userProfile.texting = true
                    userProfile.save()
                    buttons.components[0].setDisabled(true)
                    buttons.components[1].setDisabled(false)
                    if (currentSetting === 'devMode') collectorMessage.edit({
                        components: [selectMenuDev, buttons]
                    })
                    if (currentSetting === 'dmNotifs') collectorMessage.edit({
                        components: [selectMenuDmNofif, buttons]
                    })
                    if (currentSetting === 'texting') collectorMessage.edit({
                        components: [selectMenuText, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'disable') {
                    if (currentSetting === 'devMode') userProfile.devMode = false
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = false
                    if (currentSetting === 'texting') userProfile.texting = false
                    userProfile.save()
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(true)
                    if (currentSetting === 'devMode') collectorMessage.edit({
                        components: [selectMenuDev, buttons]
                    })
                    if (currentSetting === 'dmNotifs') collectorMessage.edit({
                        components: [selectMenuDmNofif, buttons]
                    })
                    if (currentSetting === 'texting') collectorMessage.edit({
                        components: [selectMenuText, buttons]
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
                            components: [selectMenuDev, buttons]
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
                            components: [selectMenuDmNofif, buttons]
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
                            components: [selectMenuText, buttons]
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
            const selectMenuDmNofif = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('select')
                    .addOptions([{
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                            default: true
                        },
                        {
                            label: 'Texting',
                            description: 'Allow users to send you texts',
                            value: 'text',
                        }
                    ]),
                )

            const selectMenuText = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('select')
                    .addOptions([{
                            label: 'DM Notifications',
                            description: 'Get notifications in your DMs',
                            value: 'dmnotifs',
                        },
                        {
                            label: 'Texting',
                            description: 'Allow users to send you texts',
                            value: 'text',
                            default: true
                        }
                    ]),
                )

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('enable')
                    .setDisabled(true)
                    .setLabel('Enable')
                    .setStyle('SUCCESS'),

                    new MessageButton()
                    .setCustomId('disable')
                    .setDisabled(true)
                    .setLabel('Disable')
                    .setStyle('DANGER'),
                )

            const settingsEmbed = new MessageEmbed()
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
                components: [selectMenuDmNofif, buttons],
                fetchReply: true
            })
            const collector = await collectorMessage.createMessageComponentCollector({
                type: 'BUTTON',
                time: 15000
            })
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })

                if (i.customId === 'enable') {
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = true
                    if (currentSetting === 'texting') userProfile.texting = true
                    userProfile.save()
                    buttons.components[0].setDisabled(true)
                    buttons.components[1].setDisabled(false)
                    if (currentSetting === 'dmNotifs') collectorMessage.edit({
                        components: [selectMenuDmNofif, buttons]
                    })
                    if (currentSetting === 'texting') collectorMessage.edit({
                        components: [selectMenuText, buttons]
                    })
                    collector.resetTimer()
                    i.deferUpdate()
                } else if (i.customId === 'disable') {
                    if (currentSetting === 'texting') userProfile.texting = false
                    if (currentSetting === 'dmNotifs') userProfile.dmNotifs = false
                    userProfile.save()
                    buttons.components[0].setDisabled(false)
                    buttons.components[1].setDisabled(true)
                    if (currentSetting === 'dmNotifs') collectorMessage.edit({
                        components: [selectMenuDmNofif, buttons]
                    })
                    if (currentSetting === 'texting') collectorMessage.edit({
                        components: [selectMenuText, buttons]
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
                            components: [selectMenuDmNofif, buttons]
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
                            components: [selectMenuText, buttons]
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