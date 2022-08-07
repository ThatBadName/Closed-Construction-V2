const {
    EmbedBuilder, SlashCommandBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')
const robCooldownsSus = require('../../models/robCooldownsSus')
const robMultiSchema = require('../../models/robMulti')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rob')
    .setDMPermission(false)
    .setDescription('Rob another users coins. Or try to..')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to rob')
        .setRequired(true)
    ),

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
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
                    new EmbedBuilder()
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
                new EmbedBuilder()
                .setTitle(`${victim.tag} does not have a bot profile`)
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })
        if (thiefProfile.passive === true) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You are in passive mode')
                .setDescription('While in this mode you are unable to rob other users')
                .setFooter({text: `Disable it in the settings menu`})
                .setColor('0xa477fc')
            ]
        })
        if (victimProfile.passive === true) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('This user is in passive mode')
                .setColor('0xa477fc')
            ]
        })

        if (thiefProfile.wallet < 5000) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You need to have at least 5,000 to rob')
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })

        if (victimProfile.wallet < 10000) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${victim.tag} is too poor for you to bother robbing`)
                .setColor('0xa744f2')
            ],
            ephemeral: true
        })

        const willRobWork = Math.round(Math.random())
        const takeFromTheif = Math.round(Math.random() * Math.round((25 / 100) * thiefProfile.wallet))
        const checkForMulti = await robMultiSchema.findOne({userId: interaction.user.id})
        let takeFromVictim
        if (checkForMulti) takeFromVictim = Math.round(Math.random() * Math.round((30 + checkForMulti.increase / 100) * victimProfile.wallet))
        else takeFromVictim = Math.round(Math.random() * Math.round((30  / 100) * victimProfile.wallet))

        if (willRobWork === 0) {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'rob', 300, interaction)
            if (cldn === true) return
            const message = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
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
                    new EmbedBuilder()
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
                    new EmbedBuilder()
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
                        new EmbedBuilder()
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
                        new EmbedBuilder()
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
                    new EmbedBuilder()
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