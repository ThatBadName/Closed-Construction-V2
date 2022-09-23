const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, reasonsToBreakShovelShovelShovel, randomItemsDigsDigDig } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function digAgainOnEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})

    const checkForShovel = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'shovel'
    })
    if (!checkForShovel) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You need a shovel to use this')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy a shovel from the shop (\`/shop buy item:shovel\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Dig Again')
                .setCustomId('dig-again')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setLabel('Buy Shovel')
                .setCustomId('buy-shovel')
                .setStyle('Secondary')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (10000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 4)
    const willToolBreak = Math.round(Math.random() * 100)

    if (willGetRandomItem === 0) {
        let itemToGet = randomItemsDig[Math.floor(Math.random() * randomItemsDig.length)]
        const lookupItem = await invSchema.findOne({
            userId: interaction.user.id,
            itemId: itemToGet.split(',')[0]
        })
        if (!lookupItem) invSchema.create({
            userId: interaction.user.id,
            itemId: itemToGet.split(',')[0],
            item: itemToGet.split(',')[2],
            amount: 1,
            emoji: itemToGet.split(',')[1] || '<:ImageNotFound:1005453599800840262>'
        })
        else {
            lookupItem.amount += 1;
            lookupItem.save()
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} found something`)
                .setColor('0x' + colours.blend)
                .setDescription(`You found a ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while digging.`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else if (willToolBreak === 0) {
        if (checkForShovel.amount === 1) checkForShovel.delete()
        else {checkForShovel.amount -= 1; checkForShovel.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0x' + colours.blend)
                .setDescription(`${reasonsToBreakShovel[Math.floor(Math.random() * reasonsToBreakShovel.length)]}\n`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else {
        let amount = Math.round((randomCoins / 100 * userProfile.coinMulti) + randomCoins)
        userProfile.wallet += amount
        userProfile.save()

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} dug in the ground`)
                .setColor('0x' + colours.blend)
                .setDescription(`You went digging and found \`${amount.toLocaleString()}\` coins`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    digAgainOnEarth
}