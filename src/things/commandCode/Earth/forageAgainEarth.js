const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, reasonsToBreakAxe, randomItemsForage } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function forageAgainEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})

    const checkForAxe = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'axe'
    })
    if (!checkForAxe) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You need an axe to use this')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy an axe from the shop (\`/shop buy item:axe\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Forage Again')
                .setCustomId('forage-again')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setLabel('Buy Axe')
                .setCustomId('buy-axe')
                .setStyle('Secondary')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (5000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 5)
    const willToolBreak = Math.round(Math.random() * 100)

    if (willGetRandomItem === 0) {
        let itemToGet = randomItemsForage[Math.floor(Math.random() * randomItemsForage.length)]
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
                .setDescription(`You found a ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while mining.`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Forage Again')
                    .setCustomId('forage-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else if (willToolBreak === 0) {
        if (checkForAxe.amount === 1) checkForAxe.delete()
        else {checkForAxe.amount -= 1; checkForAxe.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0x' + colours.blend)
                .setDescription(`${reasonsToBreakAxe[Math.floor(Math.random() * reasonsToBreakAxe.length)]}\n`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Forage Again')
                    .setCustomId('forage-again')
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
                .setTitle(`${interaction.user.tag} went foraging`)
                .setColor('0x' + colours.blend)
                .setDescription(`You went foraging and found \`${amount.toLocaleString()}\` coins`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Forage Again')
                    .setCustomId('forage-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    forageAgainEarth
}