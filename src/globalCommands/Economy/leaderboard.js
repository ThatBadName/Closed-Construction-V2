const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const functions = require('../../commandFunctions')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDMPermission(false)
    .setDescription('View the leaderboard'),

    async execute(
        interaction
    ) {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'leaderboard', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'leaderboard', `None`, interaction)

        let textWallet = ''
        const resultsWallet = await profileSchema.find().sort({
            wallet: -1
        }).limit(15)

        let textBank = ''
        const resultsBank = await profileSchema.find().sort({
            bank: -1
        }).limit(15)

        for (let counter = 0; counter < resultsWallet.length; ++counter) {
            const {
                userId,
                wallet = 0
            } = resultsWallet[counter]

            textWallet += `**#${counter + 1}** <@${userId}> - \`${wallet.toLocaleString()}\` coins\n`
        }
        for (let counter = 0; counter < resultsBank.length; ++counter) {
            const {
                userId,
                bank = 0
            } = resultsBank[counter]

            textBank += `**#${counter + 1}** <@${userId}> - \`${bank.toLocaleString()}\` coins\n`
        }

        const lbEmbedWallet = new EmbedBuilder()
            .setTitle('Balance Leaderboard')
            .setColor('0xa744f2')
            .setFooter({
                text: 'This is calculated off of wallets only'
            })
            .setDescription(textWallet)

        const lbEmbedBank = new EmbedBuilder()
            .setTitle('Balance Leaderboard')
            .setColor('0xa744f2')
            .setFooter({
                text: 'This is calculated off of banks only'
            })
            .setDescription(textBank)

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('wallet-page')
                .setLabel('Wallet Leaderboard')
                .setStyle('Secondary')
                .setDisabled(true),

                new ButtonBuilder()
                .setCustomId('bank-page')
                .setLabel('Bank Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false)
            )

        const leaderboardMessage = await interaction.reply({
            embeds: [lbEmbedWallet],
            components: [buttons],
            fetchReply: true
        })

        const collector = await leaderboardMessage.createMessageComponentCollector({
            type: 'Button',
            time: 20000
        })

        collector.on('collect', (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not your button')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true,
                })

            if (i.customId === 'wallet-page') {
                buttons.components[0].setDisabled(true)
                buttons.components[1].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedWallet],
                    components: [buttons]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'bank-page') {
                buttons.components[0].setDisabled(false)
                buttons.components[1].setDisabled(true)
                leaderboardMessage.edit({
                    embeds: [lbEmbedBank],
                    components: [buttons]
                })
                i.deferUpdate()
                collector.resetTimer()
            }
        })

        collector.on('end', () => {
            buttons.components[0].setDisabled(true)
            buttons.components[1].setDisabled(true)
            leaderboardMessage.edit({
                components: [buttons]
            })
        })

    }
}