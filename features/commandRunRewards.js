const {
    MessageEmbed
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const maintenance = require('../models/mantenance')
const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')

module.exports = (client) => {
        client.on('interactionCreate', async (interaction) => {
            const checkMain = await maintenance.find()
            if (checkMain) return
            const checkBlUs = await blacklistedUsers.findOne({
                userId: interaction.user.id
            })
            const checkBlGi = await blacklistedGuilds.findOne({
                userId: interaction.guild.id
            })
            if (checkBlGi) return
            if (checkBlUs) return

            if (interaction.type !== 'APPLICATION_COMMAND') return
            if (interaction.commandName === 'profile') return
            if (interaction.commandName === 'help') return
            if (interaction.commandName === 'ping') return
            if (interaction.commandName === 'manage-user') return
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
            let addbank = 0
            if (rand === 0) addbank = Math.round(Math.random() * 2)

            if (result.xp + Math.round(Math.random() * 2) >= result.requiredXp) {
                let reward = result.coinMulti === 0 ? Math.floor((Math.random() * (2 - 1 + 100 * result.level) + 1) + 50) : result.coinMulti * Math.floor((Math.random() * (2 - 1 + 100 * result.level) + 1) + 50)
                result.xp = 0
                result.level = result.level + 1
                result.requiredXp = result.requiredXp + 25
                result.wallet = result.wallet + reward
                result.maxBank = result.maxBank + addbank
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
            } else {
                result.xp = result.xp + Math.round(Math.random() * 2)
                result.maxBank = result.maxBank + addbank
                result.save()
            }
        })
    },

    module.exports.config = {
        dbName: 'CHECK_LEVELUP',
        displayName: 'Check for levelup',
    }