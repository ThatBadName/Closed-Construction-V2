const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, reasonsToBreakGun, randomItemsHunt } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function huntOnEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})

    const checkForPick = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'rifle'
    })
    const checkForAmmo = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'ammo'
    })
    if (!checkForPick) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You need a rifle to use this')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy a rifle from the shop (\`/shop buy item:rifle\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Hunt Again')
                .setCustomId('hunt-again')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setLabel('Buy Rifle')
                .setCustomId('buy-rifle')
                .setStyle('Secondary')
            )
        ]
    })
    if (!checkForAmmo) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You do not have any ammo')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy ammo from the shop (\`/shop buy item:ammo\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Hunt Again')
                .setCustomId('hunt-again')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setLabel('Buy Ammo')
                .setCustomId('buy-ammo')
                .setStyle('Secondary')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (10000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 4)
    const willToolBreak = Math.round(Math.random() * 100)

    if (willGetRandomItem === 0) {
        let itemToGet = randomItemsHunt[Math.floor(Math.random() * randomItemsHunt.length)]
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
                .setDescription(`You found ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while hunting.`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Hunt Again')
                    .setCustomId('hunt-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else if (willToolBreak === 0) {
        if (checkForPick.amount === 1) checkForPick.delete()
        else {checkForPick.amount -= 1; checkForPick.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0x' + colours.blend)
                .setDescription(`${reasonsToBreakGun[Math.floor(Math.random() * reasonsToBreakGun.length)]}\n`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Hunt Again')
                    .setCustomId('hunt-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else {
        let amount = Math.round((randomCoins / 100 * userProfile.coinMulti) + randomCoins)
        userProfile.wallet += amount
        userProfile.save()

        if (checkForAmmo.amount === 1) checkForAmmo.delete()
        else {checkForAmmo.amount -= 1; checkForAmmo.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} went hunting`)
                .setColor('0x' + colours.blend)
                .setDescription(`You went hunting and found \`${amount.toLocaleString()}\` coins`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Hunt Again')
                    .setCustomId('hunt-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    huntOnEarth
}