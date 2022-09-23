const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const functions = require('../../commandFunctions')
const profileSchema = require('../../models/userProfile')
const {
    colours
} = require('../../things/constants')

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

        const wait = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Please Wait')
                .setDescription('This may take a while depending on the size of your server')
                .setColor('0x' + colours.blend)
            ],
            fetchReply: true
        })

        let textWalletGlobal = ''
        const resultsWallet = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            wallet: -1
        }).limit(15)

        let textBankGlobal = ''
        const resultsBank = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            bank: -1
        }).limit(15)

        let textWalletServer = ''
        const resultsWalletServer = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            wallet: -1
        })

        let textBankServer = ''
        const resultsBankServer = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            bank: -1
        }).limit(15)

        let textLevelGlobal = ''
        const resultsLevel = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            level: -1
        }).limit(15)

        let textLevelServer = ''
        const resultsLevelServer = await profileSchema.find({
            showOnLeaderboards: true
        }).sort({
            level: -1
        })

        for (let counter = 0; counter < resultsWallet.length; ++counter) {
            const {
                userId,
                wallet = 0
            } = resultsWallet[counter]

            textWalletGlobal += `**#${counter + 1}** <@${userId}> - \`${wallet.toLocaleString()}\` coins\n`
        }
        for (let counter = 0; counter < resultsBank.length; ++counter) {
            const {
                userId,
                bank = 0
            } = resultsBank[counter]

            textBankGlobal += `**#${counter + 1}** <@${userId}> - \`${bank.toLocaleString()}\` coins\n`
        }
        for (let counter = 0; counter < resultsBank.length; ++counter) {
            const {
                userId,
                level = 0
            } = resultsLevel[counter]

            textLevelGlobal += `**#${counter + 1}** <@${userId}> - Level \`${level.toLocaleString()}\`\n`
        }
        let memberCounterWallet = 0
        for (let counter = 0; counter < 15; ++counter) {
            const {
                userId,
                wallet = 0
            } = resultsWalletServer[counter]
            const user = await interaction.guild.members.fetch(userId).catch(() => {})
            if (user) {
                textWalletServer += `**#${memberCounterWallet + 1}** <@${userId}> - \`${wallet.toLocaleString()}\` coins\n`
                    ++memberCounterWallet
            }
        }
        let memberCounterBank = 0
        for (let counter = 0; counter < 15; ++counter) {
            const {
                userId,
                bank = 0
            } = resultsBankServer[counter]
            const user = await interaction.guild.members.fetch(userId).catch(() => {})
            if (user) {
                textBankServer += `**#${memberCounterBank + 1}** <@${userId}> - \`${bank.toLocaleString()}\` coins\n`
                    ++memberCounterBank
            }
        }
        let memberCounterLevel = 0
        for (let counter = 0; counter < 15; ++counter) {
            const {
                userId,
                level = 0
            } = resultsLevelServer[counter]
            const user = await interaction.guild.members.fetch(userId).catch(() => {})
            if (user) {
                textLevelServer += `**#${memberCounterLevel + 1}** <@${userId}> - Level \`${level.toLocaleString()}\`\n`
                    ++memberCounterLevel
            }
        }

        const lbEmbedWallet = new EmbedBuilder()
            .setTitle('Global Wallet Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textWalletGlobal || 'No users here yet')

        const lbEmbedBank = new EmbedBuilder()
            .setTitle('Global Bank Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textBankGlobal || 'No users here yet')

        const lbEmbedWalletGuild = new EmbedBuilder()
            .setTitle('Server Wallet Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textWalletServer || 'No users here yet')

        const lbEmbedBankGuild = new EmbedBuilder()
            .setTitle('Server Bank Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textBankServer || 'No users here yet')

        const lbEmbedLevelGuild = new EmbedBuilder()
            .setTitle('Server Level Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textLevelServer || 'No users here yet')

        const lbEmbedLevelGlobal = new EmbedBuilder()
            .setTitle('Global Level Leaderboard')
            .setColor('0x' + colours.blend)
            .setDescription(textLevelGlobal || 'No users here yet')

        const buttonsGlobal = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('Global')
                .setDisabled(true)
                .setLabel('Global:')
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('wallet-page')
                .setLabel('Wallet Leaderboard')
                .setStyle('Secondary')
                .setDisabled(true),

                new ButtonBuilder()
                .setCustomId('bank-page')
                .setLabel('Bank Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false),

                new ButtonBuilder()
                .setCustomId('level-page')
                .setLabel('Level Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false),
            )

        const buttonsGuild = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('Server')
                .setDisabled(true)
                .setLabel('Server:')
                .setStyle('Primary'),

                new ButtonBuilder()
                .setCustomId('wallet-page-server')
                .setLabel('Wallet Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false),

                new ButtonBuilder()
                .setCustomId('bank-page-server')
                .setLabel('Bank Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false),

                new ButtonBuilder()
                .setCustomId('level-page-server')
                .setLabel('Level Leaderboard')
                .setStyle('Secondary')
                .setDisabled(false)
            )

        const leaderboardMessage = await wait.edit({
            embeds: [lbEmbedWallet],
            components: [buttonsGlobal, buttonsGuild],
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
                buttonsGlobal.components[1].setDisabled(true)
                buttonsGlobal.components[2].setDisabled(false)
                buttonsGlobal.components[3].setDisabled(false)
                buttonsGuild.components[1].setDisabled(false)
                buttonsGuild.components[2].setDisabled(false)
                buttonsGuild.components[3].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedWallet],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'bank-page') {
                buttonsGlobal.components[1].setDisabled(false)
                buttonsGlobal.components[2].setDisabled(true)
                buttonsGlobal.components[3].setDisabled(false)
                buttonsGuild.components[1].setDisabled(false)
                buttonsGuild.components[2].setDisabled(false)
                buttonsGuild.components[3].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedBank],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'level-page') {
                buttonsGlobal.components[1].setDisabled(false)
                buttonsGlobal.components[2].setDisabled(false)
                buttonsGlobal.components[3].setDisabled(true)
                buttonsGuild.components[1].setDisabled(false)
                buttonsGuild.components[2].setDisabled(false)
                buttonsGuild.components[3].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedLevelGlobal],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'wallet-page-server') {
                buttonsGlobal.components[1].setDisabled(false)
                buttonsGlobal.components[2].setDisabled(false)
                buttonsGlobal.components[3].setDisabled(false)
                buttonsGuild.components[1].setDisabled(true)
                buttonsGuild.components[2].setDisabled(false)
                buttonsGuild.components[3].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedWalletGuild],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'bank-page-server') {
                buttonsGlobal.components[1].setDisabled(false)
                buttonsGlobal.components[2].setDisabled(false)
                buttonsGlobal.components[3].setDisabled(false)
                buttonsGuild.components[1].setDisabled(false)
                buttonsGuild.components[2].setDisabled(true)
                buttonsGuild.components[3].setDisabled(false)
                leaderboardMessage.edit({
                    embeds: [lbEmbedBankGuild],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            } else if (i.customId === 'level-page-server') {
                buttonsGlobal.components[1].setDisabled(false)
                buttonsGlobal.components[2].setDisabled(false)
                buttonsGlobal.components[3].setDisabled(false)
                buttonsGuild.components[1].setDisabled(false)
                buttonsGuild.components[2].setDisabled(false)
                buttonsGuild.components[3].setDisabled(true)
                leaderboardMessage.edit({
                    embeds: [lbEmbedLevelGuild],
                    components: [buttonsGlobal, buttonsGuild]
                })
                i.deferUpdate()
                collector.resetTimer()
            }
        })

        collector.on('end', () => {
            buttonsGlobal.components[1].setDisabled(true)
            buttonsGlobal.components[2].setDisabled(true)
            buttonsGlobal.components[3].setDisabled(true)
            buttonsGuild.components[1].setDisabled(true)
            buttonsGuild.components[2].setDisabled(true)
            buttonsGuild.components[3].setDisabled(true)
            leaderboardMessage.edit({
                components: [buttonsGlobal, buttonsGuild]
            })
        })

    }
}