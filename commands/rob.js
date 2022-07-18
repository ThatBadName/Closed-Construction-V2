const {
    MessageEmbed
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const robCooldownsSus = require('../models/robCooldownsSus')

module.exports = {
    name: 'rob',
    aliases: [''],
    description: 'Rob a user',
    category: 'Economy',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
        name: 'user',
        description: 'The user to rob',
        type: 'USER',
        required: true
    }],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const victim = interaction.options.getUser('user')
        const theif = interaction.user

        const susRob = await robCooldownsSus.findOne({userId: interaction.user.id})

        const thiefProfile = await profileSchema.findOne({
            userId: interaction.user.id
        })
        const victimProfile = await profileSchema.findOne({
            userId: victim.id
        })
        if (!thiefProfile) {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You need to have at least 5,000 to rob')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })

            return await profileSchema.create({
                userId: interaction.user.id
            })
        }
        if (!victimProfile) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`${victim.tag} does not have a bot profile`)
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })

        if (thiefProfile.wallet < 5000) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You need to have at least 5,000 to rob')
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })

        if (victimProfile.wallet < 5000) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`${victim.tag} is too poor for you to bother robbing`)
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })

        const willRobWork = Math.round(Math.random())
        const takeFromTheif = Math.round(Math.random() * Math.round((25 / 100) * thiefProfile.wallet))
        const takeFromVictim = Math.round(Math.random() * Math.round((30 / 100) * victimProfile.wallet))

        if (willRobWork === 0) {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'rob', 300, interaction)
            if (cldn === true) return
            const message = await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                    .setDescription(`The bot is processing the rob. This shouldn't take long`)
                ],
                fetchReply: true
            })
            if (!susRob) functions.createRecentCommand(interaction.user.id, `rob`, `[SUCCESS] USERROBBED: ${victim.id} | AMOUNT: ${takeFromVictim.toLocaleString()}`, interaction)
            else functions.createRecentCommand(interaction.user.id, `rob`, `[SUCCESS] USERROBBED: ${victim.id} | AMOUNT: ${takeFromVictim.toLocaleString()}`, interaction, true)
            const date2 = new Date()
            date2.setSeconds(date2.getSeconds() + 300 + 30)
            await robCooldownsSus.create({
                userId: interaction.user.id,
                expires: date2
            })

            const robCldn = await functions.cooldownRobCheck(interaction.user.id, victim.id, 3600, interaction)
            if (robCldn === true) return

            thiefProfile.wallet += takeFromVictim
            victimProfile.wallet -= takeFromVictim
            thiefProfile.save()
            victimProfile.save()

            if (victimProfile.dmNotifs === true) {

                await victim.send({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You have just been robbed')
                        .setColor('0xa744f2')
                        .setDescription(`${theif} just robbed you for \`${takeFromVictim.toLocaleString()}\` coins`)
                    ]
                }).catch(e => {
                    failedRecipient = true

                })
            }
            if (thiefProfile.dmNotifs === true) {

                await theif.send({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You have robbed someone')
                        .setColor('0xa744f2')
                        .setDescription(`You just robbed ${victim} for \`${takeFromVictim.toLocaleString()}\` coins`)
                    ]
                }).catch(e => {
                    failedRecipient = true

                })
            }
            message.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You have robbed someone')
                    .setColor('0xa744f2')
                    .setDescription(`You just robbed ${victim} for \`${takeFromVictim.toLocaleString()}\` coins`)
                ]
            })
            functions.createNewNotif(victim.id, `${theif} just robbed you for \`${takeFromVictim.toLocaleString()}\` coins`)
            functions.createNewNotif(theif.id, `You just robbed ${victim} for \`${takeFromVictim.toLocaleString()}\` coins`)
        } else if (willRobWork === 1) {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'rob', 300, interaction)
            if (cldn === true) return

            const message = await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                    .setDescription(`The bot is processing the rob. This shouldn't take long`)
                ],
                fetchReply: true
            })

            if (!susRob) functions.createRecentCommand(interaction.user.id, `rob`, `[FAILED] USERROBBED: ${victim.id} | AMOUNTLOST: ${takeFromTheif.toLocaleString()}`, interaction)
            else functions.createRecentCommand(interaction.user.id, `rob`, `[FAILED] USERROBBED: ${victim.id} | AMOUNTLOST: ${takeFromTheif.toLocaleString()}`, interaction, true)
            const date2 = new Date()
            date2.setSeconds(date2.getSeconds() + 300 + 30)
            await robCooldownsSus.create({
                userId: interaction.user.id,
                expires: date2
            })

            thiefProfile.wallet -= takeFromTheif
            victimProfile.wallet += takeFromTheif
            thiefProfile.save()
            victimProfile.save()

            if (victimProfile.dmNotifs === true) {

                await victim.send({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('Someone tried to rob you')
                        .setColor('0xa744f2')
                        .setDescription(`${theif} just tried to rob you but failed competely. They were made to pay \`${takeFromTheif.toLocaleString()}\` coins`)
                    ]
                }).catch(e => {
                    failedRecipient = true

                })
            }
            if (thiefProfile.dmNotifs === true) {

                await theif.send({
                    embeds: [
                        new MessageEmbed()
                        .setTitle('You tried to rob someone')
                        .setColor('0xa744f2')
                        .setDescription(`You just tried to rob ${victim} but failed. You were made to pay \`${takeFromTheif.toLocaleString()}\` coins`)
                    ]
                }).catch(e => {
                    failedRecipient = true

                })
            }
            message.edit({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You tried to rob someone')
                    .setColor('0xa744f2')
                    .setDescription(`You just tried to rob ${victim} but failed. You were made to pay \`${takeFromTheif.toLocaleString()}\` coins`)
                ]
            })
            functions.createNewNotif(victim.id, `${theif} just tried to rob you but failed competely. They were made to pay \`${takeFromTheif.toLocaleString()}\` coins`)
            functions.createNewNotif(theif.id, `You just tried to rob ${victim} but failed. You were made to pay \`${takeFromTheif.toLocaleString()}\` coins`)
        }
    }
}