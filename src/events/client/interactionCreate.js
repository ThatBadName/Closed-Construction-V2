const {
    EmbedBuilder,
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
    InteractionType,
    ButtonBuilder,
    WebhookClient
} = require('discord.js')
const {
    checkEcoBan,
    checkBotBan
} = require('../../botFunctions/blacklist/check')
const {
    create
} = require('../../botFunctions/botManagement/buttons/create')
const {
    remove
} = require('../../botFunctions/botManagement/buttons/delete')
const {
    wipe
} = require('../../botFunctions/botManagement/buttons/wipe')
const {
    lookInBox
} = require('../../botFunctions/buttons')
const {
    addXp
} = require('../../botFunctions/inventory')
const {
    addCommandRun,
    createProfile,
    checkSettings,
} = require('../../botFunctions/main')
const {
    colours,
    economyCommands,
    economyButtons,
    xpCommands,
    supportServerUrl,
    materialsBasic,
    wildEconomyButtons
} = require('../../constants')
const fs = require('fs')
const {
    report
} = require('../../botFunctions/botManagement/report')
const {
    commandTrackerAdd
} = require('../../botFunctions/botManagement/commands')
const {
    cityMenu
} = require('../../botFunctions/city/menu/main')
const {
    editCustomModal
} = require('../../botFunctions/city/menu/edit-modal')
const {
    editCitySelectMenuCustom
} = require('../../botFunctions/city/menu/edit-select-menu')
const {
    upgradeCitySelectMenuCustom
} = require('../../botFunctions/city/menu/upgrade-select-menu')
const {
    manageSelectMenu
} = require('../../botFunctions/city/menu/manage-select-menu')
const {
    buildMenuOptions
} = require('../../botFunctions/city/menu/build-menu-options')
const {
    settingsMenuInteraction
} = require('../../botFunctions/settingsMenu/interact/initial')
const {
    settingsToggle
} = require('../../botFunctions/settingsMenu/interact/settingsToggle')
const {
    buildBasic
} = require('../../botFunctions/city/build/basic')
const {
    maintenanceCheck
} = require('../../botFunctions/blacklist/maintenanceCheck')
const {
    nextAction
} = require('../../botFunctions/activity/nextActionInteraction')
const {
    refreshProfile
} = require('../../botFunctions/refresh/main')
const {
    questIntitialInteraction
} = require('../../botFunctions/quests/menu/initial')

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        const botBan = checkBotBan(interaction.user.id)
        if (botBan !== null) {
            if (botBan.type === 'User') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You have been banned from using the bot')
                    .setColor(colours.blend)
                    .setDescription(`Expires: ${botBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(botBan.expires / 1000))}> (<t:${Math.floor(Math.round(botBan.expires / 1000))}:R>)`}\nReason:\n${botBan.reason}`)
                    .setFooter({
                        text: `You can join the support server to appeal | Case: ${botBan.case}`
                    })
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle('Link')
                        .setURL(supportServerUrl)
                        .setLabel('Support Server')
                    )
                ],
                ephemeral: true
            })
            if (botBan.type === 'Guild') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('This server has been banned from using the bot')
                    .setColor(colours.blend)
                    .setDescription(`Expires: ${botBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(botBan.expires / 1000))}> (<t:${Math.floor(Math.round(botBan.expires / 1000))}:R>)`}\nReason:\n${botBan.reason}`)
                    .setFooter({
                        text: `The server owner may join the support server to appeal | Case: ${botBan.case}`
                    })
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle('Link')
                        .setURL(supportServerUrl)
                        .setLabel('Support Server')
                    )
                ],
                ephemeral: true
            })
        }

        if (interaction.isChatInputCommand()) {
            const {
                commands
            } = client
            const {
                commandName
            } = interaction
            const command = commands.get(commandName)
            if (!command) return

            if (maintenanceCheck(interaction.user.id, 'Commands') === true) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(colours.error)
                    .setDescription('The commands module is currently in maintenance. Join the support server for more information')
                ],
                ephemeral: true,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setURL(supportServerUrl)
                        .setLabel('Support Server')
                        .setStyle('Link')
                    )
                ]
            })
            let firstCmd = false
            if (xpCommands.includes(interaction.commandName)) addXp(1 + Math.round(parseInt(fs.readFileSync(`./database/users/${interaction.user.id}/multi`, 'ascii')) / 10), interaction.user.id)
            if (economyCommands.includes(interaction.commandName)) {
                if (maintenanceCheck(interaction.user.id, 'Economy') === true) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colours.error)
                        .setDescription('The economy module is currently in maintenance. Join the support server for more information')
                    ],
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(supportServerUrl)
                            .setLabel('Support Server')
                            .setStyle('Link')
                        )
                    ]
                })
                const ecoBan = checkEcoBan(interaction.user.id)
                if (ecoBan !== null) {
                    if (ecoBan.type === 'User') return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You have been banned from using the bot\'s economy')
                            .setColor(colours.blend)
                            .setDescription(`**You are still able to use regular commands**\n\nExpires: ${ecoBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(ecoBan.expires / 1000))}> (<t:${Math.floor(Math.round(ecoBan.expires / 1000))}:R>)`}\nReason:\n${ecoBan.reason}`)
                            .setFooter({
                                text: `You can join the support server to appeal | Case: ${ecoBan.case}`
                            })
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle('Link')
                                .setURL(supportServerUrl)
                                .setLabel('Support Server')
                            )
                        ],
                        ephemeral: true
                    })
                    if (ecoBan.type === 'Guild') return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This server has been banned from using the bot\'s economy')
                            .setColor(colours.blend)
                            .setDescription(`**You are still able to use regular commands**\n\nExpires: ${ecoBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(ecoBan.expires / 1000))}> (<t:${Math.floor(Math.round(ecoBan.expires / 1000))}:R>)`}\nReason:\n${ecoBan.reason}`)
                            .setFooter({
                                text: `The server owner may join the support server to appeal | Case: ${ecoBan.case}`
                            })
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle('Link')
                                .setURL(supportServerUrl)
                                .setLabel('Support Server')
                            )
                        ],
                        ephemeral: true
                    })
                }
                if (!fs.existsSync(`./database/users/${interaction.user.id}`)) {
                    await createProfile(interaction);
                    firstCmd = true
                } else {
                    const checkFirst = addXp(Math.round(Math.random() * (2 - 0) + 0), interaction.user.id, client)
                    if (checkFirst === 'first') firstCmd = true
                }

                if (fs.readFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'ascii') !== 'no') {
                    setTimeout(() => {
                        interaction.channel.send({
                            content: `${interaction.user}`,
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Quest Completed!')
                                .setColor(colours.blend)
                                .setDescription(fs.readFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'ascii'))
                            ]
                        }).catch(() => {})
                        fs.writeFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'no')
                    }, 1000)
                }
            }

            if (!firstCmd) {
                addCommandRun(interaction)
                let location = 'DM'
                let information = 'None'
                let infoArr = []
                if (!interaction.options._hoistedOptions.length < 1) {
                    for (let i = 0; i < interaction.options._hoistedOptions.length; ++i) {
                        infoArr.push(`${interaction.options._hoistedOptions[i].name}: ${interaction.options._hoistedOptions[i].value}`)
                    }
                    information = infoArr.join('\n')
                }
                if (interaction.guild) location = `Guild - ${interaction.guild.id}`
                commandTrackerAdd(interaction.user.id, location, interaction.commandName, information)

                try {
                    await command.execute(interaction, client)
                    setTimeout(() => {
                        if (checkSettings(interaction.user.id).newAlerts === true) {
                            if (!fs.readFileSync(`./database/bot/alert/readUsers`, 'ascii').split(',').includes(interaction.user.id)) {
                                interaction.followUp({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('You have an unread alert!')
                                        .setDescription(`Do </alert:1061361295632384076> to view it`)
                                        .setColor(colours.blend)
                                        .setFooter({
                                            text: 'You can disable this message in /settings'
                                        })
                                    ],
                                    ephemeral: true
                                })
                            }
                        }
                    }, 1000)
                } catch (error) {
                    console.error(error)
                    const webhookClient = new WebhookClient({
                        url: `https://discord.com/api/webhooks/1023674577374691419/Ot2AQXk_04n37gOsZNrFN935Ai3rGfCqKv5qRHHmMkT32IAsl0OPjtOSI8oOSBVuFNI0`
                    })
                    webhookClient.send({
                        embeds: [
                            new EmbedBuilder()
                            .setDescription(error)
                            .setTitle('Slash Command Error')
                        ]
                    })
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Hmm. This is strange')
                            .setColor('0xa477fc')
                            .setDescription('Something went wrong while executing this command. If this continues please report it with the \`/report bug\` command or in the [support server](https://discord.gg/9jFqS5H43Q)')
                        ],
                        ephemeral: true
                    })
                }
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Hello there, ${interaction.user.username}!`)
                        .setDescription(`It seems that this is your first time using the bot. I have made you a bot profile ready for you to start your city.\n\n` +
                            `If you ever need any help or just want to chat with other bot users feel free to join the support server. `
                        )
                        .setThumbnail(interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024
                        }))
                        .setFooter({
                            text: `Please run this command again`,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024
                            })
                        })
                        .setColor(colours.blend)
                        .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle('Link')
                            .setURL(supportServerUrl)
                            .setLabel('Support Server')
                        )
                    ]
                })
            }
        } else if (interaction.isButton()) {
            const {
                buttons
            } = client
            const {
                customId
            } = interaction
            if (maintenanceCheck(interaction.user.id, 'Buttons') === true) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(colours.error)
                    .setDescription('The buttons module is currently in maintenance. Join the support server for more information')
                ],
                ephemeral: true,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setURL(supportServerUrl)
                        .setLabel('Support Server')
                        .setStyle('Link')
                    )
                ]
            })
            if (economyButtons.includes(interaction.customId.split('-')[0])) {
                if (maintenanceCheck(interaction.user.id, 'Economy') === true) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colours.error)
                        .setDescription('The economy module is currently in maintenance. Join the support server for more information')
                    ],
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(supportServerUrl)
                            .setLabel('Support Server')
                            .setStyle('Link')
                        )
                    ]
                })
                const ecoBan = checkEcoBan(interaction.user.id)
                if (ecoBan !== null) {
                    if (ecoBan.type === 'User') return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You have been banned from using the bot\'s economy')
                            .setColor(colours.blend)
                            .setDescription(`**You are still able to use regular commands**\n\nReason:\n${ecoBan.reason}`)
                            .setFooter({
                                text: `You can join the support server to appeal`
                            })
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle('Link')
                                .setURL(supportServerUrl)
                                .setLabel('Support Server')
                            )
                        ],
                        ephemeral: true
                    })
                    if (ecoBan.type === 'Guild') return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This server has been banned from using the bot\'s economy')
                            .setColor(colours.blend)
                            .setDescription(`**You are still able to use regular commands**\n\nReason:\n${ecoBan.reason}`)
                            .setFooter({
                                text: `You can join the support server to appeal`
                            })
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle('Link')
                                .setURL(supportServerUrl)
                                .setLabel('Support Server')
                            )
                        ],
                        ephemeral: true
                    })
                }
            }

            if (!fs.existsSync(`./database/users/${interaction.user.id}`)) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Hello there, ${interaction.user.username}!`)
                        .setDescription(`It seems that this is your first time using the bot. I have made you a bot profile ready for you to start your city.\n\n` +
                            `If you ever need any help or just want to chat with other bot users feel free to join the support server. `
                        )
                        .setThumbnail(interaction.user.displayAvatarURL({
                            dynamic: true,
                            size: 1024
                        }))
                        .setFooter({
                            text: `Please run this command again`,
                            iconURL: interaction.user.displayAvatarURL({
                                dynamic: true,
                                size: 1024
                            })
                        })
                        .setColor(colours.blend)
                        .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle('Link')
                            .setURL(supportServerUrl)
                            .setLabel('Support Server')
                        )
                    ]
                })
                return await createProfile(interaction)
            }

            let found = false
            wildEconomyButtons.map(i => i.startsWith(interaction.customId.split('|')[0].split('-')[0]) ? found = true : null)
            if (found === true) {
                if (maintenanceCheck(interaction.user.id, 'Economy') === true) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colours.error)
                        .setDescription('The economy module is currently in maintenance. Join the support server for more information')
                    ],
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(supportServerUrl)
                            .setLabel('Support Server')
                            .setStyle('Link')
                        )
                    ]
                })
                addXp(Math.round(Math.random() * (2 - 0) + 0), interaction.user.id, client)
                addCommandRun(interaction)
            }
            if (fs.readFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'ascii') !== 'no') {
                setTimeout(() => {
                    interaction.message.reply({
                        content: `${interaction.user}`,
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Quest Completed!')
                            .setColor(colours.blend)
                            .setDescription(fs.readFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'ascii'))
                        ]
                    }).catch(() => {})
                    fs.writeFileSync(`./database/users/${interaction.user.id}/admin/unlockedQuest`, 'no')
                }, 1000)
            }
            if (interaction.customId.startsWith('build-building')) return await buildBasic(interaction, materialsBasic) //! Needs to be completed
            if (interaction.customId.startsWith('quests')) return await questIntitialInteraction(interaction, client)
            if (interaction.customId.startsWith('settings-B')) return await settingsToggle(interaction, client)
            if (interaction.customId.startsWith('rewards-')) return lookInBox(interaction)
            if (interaction.customId.startsWith('wipe-')) return wipe(interaction, client)
            if (interaction.customId.startsWith('delete-')) return remove(interaction, client)
            if (interaction.customId.startsWith('activity|')) return await nextAction(interaction, client)
            if (interaction.customId.startsWith('create-')) return create(interaction, client)
            if (interaction.customId.startsWith('report-')) return await report(interaction, client)
            if (interaction.customId.includes('cityMenu|')) return await cityMenu(interaction, client)
            if (interaction.customId.includes('build-')) return await buildMenuOptions(interaction, client)
            if (interaction.customId.includes('refresh-')) return await refreshProfile(interaction, client)
            const button = buttons.get(customId)
            if (!button) return new Error('This button has not got any code')


            try {
                await button.execute(interaction, client)
            } catch (err) {
                console.error(err)
                const webhookClient = new WebhookClient({
                    url: `https://discord.com/api/webhooks/1023674577374691419/Ot2AQXk_04n37gOsZNrFN935Ai3rGfCqKv5qRHHmMkT32IAsl0OPjtOSI8oOSBVuFNI0`
                })
                webhookClient.send({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(err)
                        .setTitle('Button Error')
                    ]
                })
            }
        } else if (interaction.isContextMenuCommand()) {
            const {
                commands
            } = client
            const {
                commandName
            } = interaction
            const contextCommand = commands.get(commandName)
            if (!contextCommand) return

            try {
                await contextCommand.execute(interaction, client)
            } catch (error) {
                console.error(error)
                const webhookClient = new WebhookClient({
                    url: `https://discord.com/api/webhooks/1023674577374691419/Ot2AQXk_04n37gOsZNrFN935Ai3rGfCqKv5qRHHmMkT32IAsl0OPjtOSI8oOSBVuFNI0`
                })
                webhookClient.send({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(error)
                        .setTitle('Context Command Error')
                    ]
                })
            }
        } else if (interaction.isStringSelectMenu()) {
            const {
                selectMenus
            } = client
            const {
                customId
            } = interaction
            if (maintenanceCheck(interaction.user.id, 'SelectMenus') === true) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(colours.error)
                    .setDescription('The select menu module is currently in maintenance. Join the support server for more information')
                ],
                ephemeral: true,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setURL(supportServerUrl)
                        .setLabel('Support Server')
                        .setStyle('Link')
                    )
                ]
            })
            if (interaction.customId.startsWith('city-edit-options')) return editCitySelectMenuCustom(interaction, client)
            if (interaction.customId.startsWith('city-upgrade-options')) return await upgradeCitySelectMenuCustom(interaction, client)
            if (interaction.customId.startsWith('city-management-options')) return await manageSelectMenu(interaction, client)
            if (interaction.customId.startsWith('profile-settings')) return await settingsMenuInteraction(interaction, client)
            const menu = selectMenus.get(customId)
            if (!menu) return new Error('This menu has not got any code')
            try {
                await menu.execute(interaction, client)
            } catch (err) {
                console.error(err)
                const webhookClient = new WebhookClient({
                    url: `https://discord.com/api/webhooks/1023674577374691419/Ot2AQXk_04n37gOsZNrFN935Ai3rGfCqKv5qRHHmMkT32IAsl0OPjtOSI8oOSBVuFNI0`
                })
                webhookClient.send({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(err)
                        .setTitle('Select Menu Error')
                    ]
                })
            }
        } else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
            const {
                commands
            } = client
            const {
                commandName
            } = interaction
            const command = commands.get(commandName)
            if (!command) return

            try {
                await command.autocomplete(interaction, client)
            } catch (error) {
                console.error(error)
                const webhookClient = new WebhookClient({
                    url: `https://discord.com/api/webhooks/1023674577374691419/Ot2AQXk_04n37gOsZNrFN935Ai3rGfCqKv5qRHHmMkT32IAsl0OPjtOSI8oOSBVuFNI0`
                })
                webhookClient.send({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(error)
                        .setTitle('Autocomplete Error')
                    ]
                })
            }
        } else if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId.startsWith('city-edit-modal')) await editCustomModal(interaction, client)
        }
    }
}