const {
    MessageEmbed
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const maintenance = require('../models/mantenance')
const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')

module.exports = (client) => {
        client.on('interactionCreate', async (interaction) => {
            const checkMain = await maintenance.findOne({maintenace: true})
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
            if (interaction.commandName === 'manage-user') return
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
            const functions = require('../checks/functions')
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

            if (result.xp + Math.round(Math.random() * (10 - 1) + 1) >= result.requiredXp) {
                let reward = result.coinMulti === 0 ? 5000 : Math.round(5000 / 100 * result.coinMulti) + 5000
                result.xp = 0
                result.level = result.level + 1
                result.requiredXp = result.requiredXp + 25
                result.wallet = result.wallet + reward
                result.maxBank = result.maxBank + addbank
                result.coinMulti += Math.round(Math.random() * (5 - 1) + 1)
                result.save()

                if (result.dmNotifs === true) {
                    try {
                        interaction.user.send({
                            embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                        })
                    } catch (err) {
                        interaction.channel.send({
                            content: `${interaction.user},`,
                            embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                        })
                    }
                } else {
                    interaction.channel.send({
                        content: `${interaction.user},`,
                        embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)]
                    })
                }
                functions.createNewNotif(interaction.user.id, `You are now **level ${result.level}**. As a reward you have been given \`${reward}\` coins`)
            } else {
                if (randPlanet === 0) {
                    if (result.planetXp + Math.round(Math.random() * (5 - 1) + 1) >= result.requiredPlanetXp) {
                        result.planetXp = 0
                        result.planetLevel = result.level + 1
                        result.requiredPlanetXp = result.requiredPlanetXp + 1000
                        result.unlockedPlanetLevel += 1
                        result.save()
        
                        if (result.dmNotifs === true) {
                            try {
                                interaction.user.send({
                                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.level}**`)]
                                })
                            } catch (err) {
                                interaction.channel.send({
                                    content: `${interaction.user},`,
                                    embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.level}**`)]
                                })
                            }
                        } else {
                            interaction.channel.send({
                                content: `${interaction.user},`,
                                embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('Congrats, You leveled up!').setDescription(`You are now **planet level ${result.level}**`)]
                            })
                        }
                        functions.createNewNotif(interaction.user.id, `You are now **planet level ${result.level}**`)
                    } else {
                        if (result.unlockedPlanetLevel > result.planetLevel) return
                        result.planetXp += Math.round(Math.random() * (5 - 1) + 1)
                        result.save()
                    }
                } else {
                    result.xp += Math.round(Math.random() * (10 - 1) + 1)
                    result.maxBank = result.maxBank + addbank
                    result.save()
                }
            }
        })
    },

    module.exports.config = {
        dbName: 'CHECK_LEVELUP',
        displayName: 'Check for levelup',
    }