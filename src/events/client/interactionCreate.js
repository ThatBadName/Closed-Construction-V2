const {
    EmbedBuilder,
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
    InteractionType,
    ButtonBuilder
} = require('discord.js')
const reportSchema = require('../../models/reports')
const profileSchema = require('../../models/userProfile')
const maintenance = require('../../models/mantenance')
const blacklistedUsers = require('../../models/blacklistUser')
const blacklistedGuilds = require('../../models/blacklistGuild')

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const {
                commands
            } = client
            const {
                commandName
            } = interaction
            const command = commands.get(commandName)
            if (!command) return

            try {
                await command.execute(interaction, client)
                const check = await profileSchema.findOne({userId: interaction.user.id})
                if (check && commandName !== 'notifications' && commandName !== 'information' && commandName !== 'beg' && commandName !== 'dig' && check.hasUnreadNotif === true && check.unreadAlert === true) interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You have an unread notification')
                        .setDescription('You have an unread notification. Run `/notifications` to view it!')
                        .setFooter({text: 'You can disable this alert with /settings'})
                        .setColor('a477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('mark-as-read')
                            .setLabel('Mark as read')
                            .setStyle('Primary')
                        )
                    ],
                    ephemeral: true
                }).catch(() => {})
                const canVoteCheck = await profileSchema.findOne({userId: interaction.user.id, canVote: true, voteReminders: true})
                let failedToSend = false
                if (canVoteCheck) {
                    interaction.user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You can vote again')
                            .setDescription('Click [here](https://top.gg/bot/994644001397428335/vote) to vote')
                            .setFooter({text: 'You can disable this alert with /settings'})
                            .setColor('a477fc')
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                              new ButtonBuilder()
                              .setStyle('Link')
                              .setLabel('Vote')
                              .setURL('https://top.gg/bot/994644001397428335/vote')
                            )
                        ],
                        ephemeral: true
                    }).catch(() => {
                        failedToSend = true
                    })
                    if (failedToSend === true) {
                        interaction.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('You can vote again')
                                .setDescription('Click [here](https://top.gg/bot/994644001397428335/vote) to vote')
                                .setFooter({text: 'You can disable this alert with /settings'})
                                .setColor('a477fc')
                            ],
                            components: [
                                new ActionRowBuilder()
                                .addComponents(
                                  new ButtonBuilder()
                                  .setStyle('Link')
                                  .setLabel('Vote')
                                  .setURL('https://top.gg/bot/994644001397428335/vote')
                                )
                            ]
                        })
                    }

                    canVoteCheck.canVote = false
                    canVoteCheck.save()
                }
            } catch (error) {
                console.error(error)
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

            const checkMain = await maintenance.findOne({
                maintenace: true
            })
            if (checkMain) return
            if (!interaction.guild) return
            const checkBlUs = await blacklistedUsers.findOne({
                userId: interaction.user.id
            })
            const checkBlGi = await blacklistedGuilds.findOne({
                userId: interaction.guild.id
            })
            if (checkBlGi) return
            if (checkBlUs) return

            if (interaction.commandName === 'profile') return
            if (interaction.commandName === 'help') return
            if (interaction.commandName === 'ping') return
            if (interaction.commandName === 'user-manage') return
            const functions = require('../../commandFunctions')
            const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
            if (blks === true) return
            const result = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!result) return profileSchema.create({
                userId: interaction.user.id
            })
            const rand = Math.round(Math.random() * 3)
            const randPlanet = Math.round(Math.random() * 5)
            let addbank = 0
            if (rand === 0) addbank = Math.round(Math.random() * 2)

            if (result.xp + Math.round((Math.random() * (10 - 1) + 1 / 100 * result.xpBoost) + Math.random() * (10 - 1) + 1) >= result.requiredXp) {
                let reward = result.coinMulti === 0 ? 5000 : Math.round(5000 / 100 * result.coinMulti) + 5000
                result.xp = 0
                result.level = result.level + 1
                result.requiredXp = result.requiredXp + 25
                result.wallet = result.wallet + reward
                result.maxBank = result.maxBank + addbank
                result.coinMulti += Math.round(Math.random() * (5 - 1) + 1)
                result.save()

                let userNotDmAble = false
                if (result.dmNotifs === true) {
                        interaction.user.send({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                        }).catch(() => {
                            userNotDmAble = true
                        })
                } else {
                    interaction.channel.send({
                        content: `${interaction.user},`,
                        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                    })
                }
                if (userNotDmAble === true) interaction.channel.send({
                    content: `${interaction.user},`,
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                })
                functions.createNewNotif(interaction.user.id, `You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)
            } else {
                if (randPlanet === 0) {
                    if (result.planetXp + Math.round(Math.random() * (5 - 1) + 1) >= result.requiredPlanetXp) {
                        if (result.unlockedPlanetLevel > result.planetLevel) return
                        result.planetXp = 0
                        result.planetLevel = result.planetLevel + 1
                        result.requiredPlanetXp = result.requiredPlanetXp + 1000
                        result.unlockedPlanetLevel += 0
                        result.save()

                        let userNotDmAble = false
                        if (result.dmNotifs === true) {
                                await interaction.user.send({
                                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                                }).catch(() => {
                                    userNotDmAble = true
                                })
                        } else {
                            await interaction.channel.send({
                                content: `${interaction.user},`,
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                            })
                        }
                        if (userNotDmAble === true) await interaction.channel.send({
                            content: `${interaction.user},`,
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                        })
                        functions.createNewNotif(interaction.user.id, `You are now **planet level ${result.planetLevel}**`)
                    } else {
                        if (result.unlockedPlanetLevel > result.planetLevel) return
                        result.planetXp += Math.round(Math.random() * (5 - 1) + 1)
                        result.save()
                    }
                } else {
                    let amountAdding = Math.random() * (10 - 1) + 1
                    result.xp += Math.round((amountAdding / 100 * result.xpBoost) + amountAdding)
                    result.maxBank = result.maxBank + addbank
                    result.save()
                }
            }
        } else if (interaction.isButton()) {
            const {
                buttons
            } = client
            const {
                customId
            } = interaction
            const button = buttons.get(customId)

            if (interaction.customId === 'dig-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'dig', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'dig', `None`, interaction)

                const command = require('../../things/commandCode/Earth/digAgainEarth')
                command.digAgainOnEarth(interaction)
            } else if (interaction.customId === 'beg-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'beg', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'beg', `None`, interaction)

                const command = require('../../things/commandCode/Earth/begAgainEarth')
                command.begAgainEarth(interaction)
            } else if (interaction.customId === 'fish-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'fish', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'fish', `None`, interaction)

                const command = require('../../things/commandCode/Earth/fishAgainEarth')
                command.fishAgainEarth(interaction)
            } else if (interaction.customId === 'mine-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'mine', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'mine', `None`, interaction)

                const command = require('../../things/commandCode/Earth/mineAgainEarth')
                command.mineAgainEarth(interaction)
            } else if (interaction.customId === 'forage-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'forage', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'forage', `None`, interaction)

                const command = require('../../things/commandCode/Earth/forageAgainEarth')
                command.forageAgainEarth(interaction)
            } else if (interaction.customId === 'hunt-again') {
                const functions = require('../../commandFunctions')
                const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
                if (blks === true) return
                const main = await functions.checkMaintinance(interaction)
                if (main === true) return
                const cldn = await functions.cooldownCheck(interaction.user.id, 'hunt', 8, interaction)
                if (cldn === true) return
                functions.createRecentCommand(interaction.user.id, 'hunt', `None`, interaction)

                const command = require('../../things/commandCode/Earth/huntAgainEarth')
                command.huntAgainEarth(interaction)
            } else if (interaction.customId === 'mark-as-read') {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Notifications marked as read')
                        .setColor('0xa477f2')
                    ],
                    ephemeral: true
                })

                await profileSchema.findOneAndUpdate({userId: interaction.user.id}, {hasUnreadNotif: false})
            }

            if (interaction.customId === 'firstPage') return
            if (interaction.customId === 'backPage') return
            if (interaction.customId === 'nextPage') return
            if (interaction.customId === 'lastPage') return
            if (interaction.customId === 'earth') return
            if (interaction.customId === 'mars') return
            if (interaction.customId === 'iversium') return
            if (interaction.customId === 'inversion') return
            if (interaction.customId === 'schlastttone') return
            if (interaction.customId === 'polaris') return
            if (interaction.customId === 'cycnus') return
            if (interaction.customId === 'ascalaphus') return
            if (interaction.customId === 'minerva') return
            if (interaction.customId === 'nestor') return
            if (interaction.customId === 'hesperus') return
            if (interaction.customId === 'ceyx') return
            if (interaction.customId === 'vesta') return
            if (interaction.customId === 'pirithous') return
            if (interaction.customId === 'bad-kingdom') return
            if (interaction.customId === 'wallet-page') return
            if (interaction.customId === 'bank-page') return
            if (interaction.customId === 'bank-page-server') return
            if (interaction.customId === 'wallet-page-server') return
            if (interaction.customId === 'bio') return
            if (interaction.customId === 'cancel-reset') return
            if (interaction.customId === 'confirm-delete') return
            if (interaction.customId === 'reset-profile') return
            if (interaction.customId === 'planets') return
            if (interaction.customId === 'shop-page1') return
            if (interaction.customId === 'shop-page2') return
            if (interaction.customId === 'shop-page3') return
            if (interaction.customId === 'shop-page4') return
            if (interaction.customId === 'shop-page5') return
            if (interaction.customId === 'report-send') return
            if (interaction.customId === 'report-cancel') return
            const functions = require('../../commandFunctions')
            const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
            if (blks === true) return
            const result = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!result) return profileSchema.create({
                userId: interaction.user.id
            })
            const rand = Math.round(Math.random() * 3)
            const randPlanet = Math.round(Math.random() * 5)
            let addbank = 0
            if (rand === 0) addbank = Math.round(Math.random() * 2)

            if (result.xp + Math.round((Math.random() * (10 - 1) + 1 / 100 * result.xpBoost) + Math.random() * (10 - 1) + 1) >= result.requiredXp) {
                let reward = result.coinMulti === 0 ? 5000 : Math.round(5000 / 100 * result.coinMulti) + 5000
                result.xp = 0
                result.level = result.level + 1
                result.requiredXp = result.requiredXp + 25
                result.wallet = result.wallet + reward
                result.maxBank = result.maxBank + addbank
                result.coinMulti += Math.round(Math.random() * (5 - 1) + 1)
                result.save()

                let userNotDmAble = false

                if (result.dmNotifs === true) {
                        interaction.user.send({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                        }).catch(() => {
                            userNotDmAble = true
                        })
                } else {
                    await interaction.channel.send({
                        content: `${interaction.user},`,
                        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                    })
                }
                if (userNotDmAble === true) await interaction.channel.send({
                    content: `${interaction.user},`,
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                })
                functions.createNewNotif(interaction.user.id, `You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)
            } else {
                if (randPlanet === 0) {
                    if (result.planetXp + Math.round(Math.random() * (5 - 1) + 1) >= result.requiredPlanetXp) {
                        if (result.unlockedPlanetLevel > result.planetLevel) return
                        result.planetXp = 0
                        result.planetLevel = result.planetLevel + 1
                        result.requiredPlanetXp = result.requiredPlanetXp + 1000
                        result.unlockedPlanetLevel += 0 //TODO change to 1 when planets are active. There is 1 for / commands above aswell
                        result.save()

                        let userNotDmAble = false
                        if (result.dmNotifs === true) {
                                await interaction.user.send({
                                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                                }).catch(() => {
                                    userNotDmAble = true
                                })
                        } else {
                            await interaction.channel.send({
                                content: `${interaction.user},`,
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                            })
                        }
                        if (userNotDmAble === true) await interaction.channel.send({
                            content: `${interaction.user},`,
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.planetLevel}**`)]
                        })
                        functions.createNewNotif(interaction.user.id, `You are now **planet level ${result.planetLevel}**`)
                    } else {
                        if (result.unlockedPlanetLevel > result.planetLevel) return
                        result.planetXp += Math.round(Math.random() * (5 - 1) + 1)
                        result.save()
                    }
                } else {
                    let amountAdding = Math.random() * (10 - 1) + 1
                    result.xp += Math.round((amountAdding / 100 * result.xpBoost) + amountAdding)
                    result.maxBank = result.maxBank + addbank
                    result.save()
                }
            }
            if (!button) return new Error('This button has not got any code')

            try {
                await button.execute(interaction, client)
            } catch (err) {
                console.error(err)
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
            }
        } else if (interaction.isSelectMenu()) {
            const {
                selectMenus
            } = client
            const {
                customId
            } = interaction
            const menu = selectMenus.get(customId)
            if (!menu) return new Error('This menu has not got any code')

            try {
                await menu.execute(interaction, client)
            } catch (err) {
                console.error(err)
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
            }
        }
    }
}