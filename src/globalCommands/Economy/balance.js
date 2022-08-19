const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')
const blockSchema = require('../../models/blockedUsers')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDMPermission(false)
    .setDescription('Manage your coins')
    .addSubcommand(option =>
        option.setName('deposit')
        .setDescription('Deposit coins into the bank')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of coins to move (Use 0 to move all)')
            .setRequired(true)
            .setMinValue(0)
        )
    )

    .addSubcommand(option =>
        option.setName('withdraw')
        .setDescription('Withdraw coins from the bank')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of coins to move (Use 0 to move all)')
            .setRequired(true)
            .setMinValue(0)
        )
    )

    .addSubcommand(option =>
        option.setName('view')
        .setDescription('View your balance')
    ),

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'balance', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'deposit') {
            functions.createRecentCommand(interaction.user.id, `balance-deposit`, `AMOUNT: ${interaction.options.getInteger('amount')}`, interaction)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            const amountToMove = interaction.options.getInteger('amount')
            if (!userProfile) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You don\'t have enough in your wallet to do this')
                        .setColor('0xa744f2')
                    ],
                    ephemeral: true
                })

                profileSchema.create({
                    userId: interaction.user.id
                })
            }
            if (amountToMove > userProfile.wallet) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t move more than your wallet balance.')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.wallet <= 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You don\'t have enough in your wallet to do this')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (amountToMove < 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t move less than 0 coins')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.bank + amountToMove > userProfile.maxBank) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You don\'t have enough bank space to do this')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })

            if (amountToMove === 0) {
                var amountMove = userProfile.maxBank - userProfile.bank
                if (amountMove >= userProfile.wallet) {
                    amountMove = userProfile.wallet
                }
            } else {
                amountMove = amountToMove
            }

            userProfile.wallet -= amountMove
            userProfile.bank += amountMove
            await userProfile.save()
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Deposited Coins')
                    .setFields(
                        {name: 'Wallet', value: `\`${userProfile.wallet.toLocaleString()}\``, inline: true},
                        {name: 'Bank', value: `\`${userProfile.bank.toLocaleString()}/${userProfile.maxBank.toLocaleString()}\` (${Math.round(userProfile.bank / userProfile.maxBank * 100)}% full)`, inline: true},
                    )
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'withdraw') {
            functions.createRecentCommand(interaction.user.id, `balance-withdraw`, `AMOUNT: ${interaction.options.getInteger('amount')}`, interaction)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            const amountToMove = interaction.options.getInteger('amount')
            if (!userProfile) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You don\'t have enough in your bank to do this')
                        .setColor('0xa744f2')
                    ],
                    ephemeral: true
                })

                profileSchema.create({
                    userId: interaction.user.id
                })
            }
            if (amountToMove < 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t move less than 0 coins')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (userProfile.bank <= 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You don\'t have any coins in your bank')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })
            if (amountToMove > userProfile.bank) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t move more than whats in your bank')
                    .setColor('0xa744f2')
                ],
                ephemeral: true
            })

            if (amountToMove === 0) {
                var amountMove = userProfile.bank
            } else amountMove = amountToMove

            userProfile.wallet += amountMove
            userProfile.bank -= amountMove
            await userProfile.save()
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Coins Withdrawn')
                    .setFields(
                        {name: 'Wallet', value: `\`${userProfile.wallet.toLocaleString()}\``, inline: true},
                        {name: 'Bank', value: `\`${userProfile.bank.toLocaleString()}/${userProfile.maxBank.toLocaleString()}\` (${Math.round(userProfile.bank / userProfile.maxBank * 100)}% full)`, inline: true},
                    )
                    .setColor('0xa744f2')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'view') {
            functions.createRecentCommand(interaction.user.id, `balance-view`, 'None', interaction)
            const result = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!result) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`${interaction.user.username}'s balance`)
                        .setColor('0xa744f2')
                        .setDescription(`**Wallet**: \`0\` coins\n**Bank**: \`0\` coins`)
                    ]
                })
                profileSchema.create({
                    userId: interaction.user.id
                })
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`${interaction.user.username}'s balance`)
                        .setColor('0xa744f2')
                        .setDescription(`**Wallet**: \`${result.wallet.toLocaleString()}\` coins\n**Bank**: \`${result.bank.toLocaleString()}/${result.maxBank.toLocaleString()}\` (${Math.round(result.bank / result.maxBank * 100)}% full) coins`)
                    ]
                })
            }
        }
    }
}