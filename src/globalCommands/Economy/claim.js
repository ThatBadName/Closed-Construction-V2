const profileSchema = require('../../models/userProfile')
const {
    EmbedBuilder,
    SlashCommandBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('claim')
    .setDMPermission(false)
    .setDescription('Claim some coins')
    .addSubcommand(option =>
        option.setName('daily')
        .setDescription('Claim your daily coins')
    )

    .addSubcommand(option =>
        option.setName('weekly')
        .setDescription('Claim your weekly coins')
    )

    .addSubcommand(option =>
        option.setName('monthly')
        .setDescription('Claim your monthly coins')
    ),

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return

        if (interaction.options.getSubcommand() === 'daily') {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'daily', 86400, interaction)
            if (cldn === true) return
            functions.createRecentCommand(interaction.user.id, 'claim-daily', `None`, interaction)

            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                profileSchema.create({
                    userId: interaction.user.id,
                    wallet: 10000
                })
            } else {
                userProfile.wallet += 10000
                userProfile.save()
            }
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You have claimed your daily coins!')
                    .setDescription(`You have been given \`10,000\` coins`)
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'weekly') {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'weekly', 604800, interaction)
            if (cldn === true) return
            functions.createRecentCommand(interaction.user.id, 'claim-weekly', `None`, interaction)

            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                profileSchema.create({
                    userId: interaction.user.id,
                    wallet: 25000
                })
            } else {
                userProfile.wallet += 25000
                userProfile.save()
            }
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You have claimed your weekly coins!')
                    .setDescription(`You have been given \`25,000\` coins`)
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'monthly') {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'monthly', 2628288, interaction)
            if (cldn === true) return
            functions.createRecentCommand(interaction.user.id, 'claim-monthly', `None`, interaction)

            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                profileSchema.create({
                    userId: interaction.user.id,
                    wallet: 1000000
                })
            } else {
                userProfile.wallet += 1000000
                userProfile.save()
            }
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You have claimed your monthly coins!')
                    .setDescription(`You have been given \`1,000,000\` coins`)
                    .setColor('0xa744f2')
                ]
            })
        }
    }
}