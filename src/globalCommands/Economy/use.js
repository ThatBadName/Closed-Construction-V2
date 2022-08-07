const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js')
const inventorySchema = require('../../models/inventorySchema')
const profileSchema = require('../../models/userProfile')
const allItems = require('../../things/items/allItems')
const xpBoostSchema = require('../../models/xpBoosts')
const activeDevCoinSchema = require('../../models/activeDevCoins')
const robMultiSchema = require('../../models/robMulti')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use-item')
        .setDMPermission(false)
        .setDescription('Use an item')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('The item to use')
            .setRequired(true)
            .setAutocomplete(true)
            .setMaxLength(25)
        )

        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of the item to use')
            .setMinValue(1)
            .setRequired(false)
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item') {
            const focusedValue = interaction.options.getFocused()
            const choices = items.map(i => `${i.name},${i.id}`).sort()
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice.split(',')[0],
                    value: choice.split(',')[1]
                }))
            )
        }
    },

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'use', 5, interaction)
        if (cldn === true) return

        let itemQuery = interaction.options.getString('item')
        itemQuery = itemQuery.toLowerCase()
        let amount = interaction.options.getInteger('amount') || 1
        if (amount < 1) amount = 1

        functions.createRecentCommand(interaction.user.id, 'use', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

        const search = !!allItems.find((value) => value.id === itemQuery)
        if (!search) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('I could not find that item')
                .setColor('0xa744f2')
            ]
        })
        const itemFound = allItems.find((value) => value.id === itemQuery)
        if (itemFound.usable === false) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('That item cannot be used')
                .setColor('0xa477fc')
            ]
        })

        let userInv = await inventorySchema.findOne({
            userId: interaction.user.id,
            itemId: itemFound.id
        })
        if (!userInv) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have this item')
                .setColor('0xa477fc')
            ]
        })

        if (amount > userInv.amount) amount = userInv.amount
        if (itemFound.id !== 'dev-coin' && itemFound.id !== 'scout') {
            if (amount === userInv.amount) userInv.delete()
            else userInv.amount -= amount;
            userInv.save()
        }

        let userProfile = await profileSchema.findOne({
            userId: interaction.user.id
        })
        if (!userProfile) userProfile = await profileSchema.create({
            userId: interaction.user.id
        })
        switch (itemFound.id) {
            case "cheque":
                const spaceToAdd = Math.floor(Math.random() * (10000 - 1000) + 1000) * amount
                userProfile.maxBank += spaceToAdd
                userProfile.save()

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Added bank space')
                        .setDescription(`You expanded your bank space from \`${userProfile.maxBank - spaceToAdd}\` to \`${userProfile.maxBank}\` (+${spaceToAdd})`)
                        .setFooter({text: `You used ${amount === 1 ? `1 Cheque` : `${amount} Cheques`}`})
                        .setColor('0xa477fc')
                    ]
                })
                break

            case "xp-coin":
                const amountToAdd = Math.floor(Math.random() * (75 - 10) + 10) * amount
                userProfile.xpBoost += amountToAdd
                userProfile.save()

                const date = new Date()
                date.setHours(date.getHours() + amount)
                xpBoostSchema.create({
                    userId: interaction.user.id,
                    expires: date,
                    increase: amountToAdd
                })
                expires = date


                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Added XP Boost')
                        .setDescription(`You have gained a \`${amountToAdd}%\` XP boost that will expire <t:${Math.round(expires.getTime() / 1000)}:R>. Your total XP boost is now \`${userProfile.xpBoost}%\``)
                        .setFooter({text: `You used ${amount === 1 ? `1 Coin` : `${amount} Coins`}`})
                        .setColor('0xa477fc')
                    ]
                })
                break
                case "dev-coin":
                    const check = await activeDevCoinSchema.findOne({userId: interaction.user.id})
                    if (check) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You already have a dev coin active')
                            .setColor('0xa477fc')
                        ]
                    })

                    if (amount === userInv.amount) userInv.delete()
                    else userInv.amount -= 1;
                    userInv.save()

                    const date1 = new Date()
                    date1.setHours(date1.getHours() + 12)

                    activeDevCoinSchema.create({
                        userId: interaction.user.id,
                        expires: date1
                    })

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Activated dev coin')
                            .setDescription('You used a dev coin. Your command cooldowns have been reduced by 50% (There are some exeptions). Its effects wear off in 12 hours')
                            .setColor('0xa477fc')
                        ]
                    })

                break
                case "scout":
                    const find = await robMultiSchema.findOne({userId: interaction.user.id})
                    if (find.increase > 15) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Don\'t be so greedy')
                            .setDescription('You can only have 1 scout active at once')
                            .setColor('0xa477fc')
                        ]
                    })

                    if (amount === userInv.amount) userInv.delete()
                    else userInv.amount -= 1;
                    userInv.save()

                    const date2 = new Date()
                    date2.setHours(date2.getHours() + 24)

                    robMultiSchema.create({
                        userId: interaction.user.id,
                        expires: date2,
                        increase: 15
                    })

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Activated scout')
                            .setDescription('You used a scout. You will now be able to rob 15% more coins than the usual max. Its effects wear off in 24 hours')
                            .setColor('0xa477fc')
                        ]
                    })

                break

        }
    }
}