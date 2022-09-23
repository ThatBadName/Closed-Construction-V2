const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, randomItemsMineMars, reasonsToBreakPick } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function mineAgainEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})

    const checkForPick = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'pickaxe'
    })
    if (!checkForPick) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You need a pickaxe to use this')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy a pick from the shop (\`/shop buy item:pickaxe\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Mine Again')
                .setCustomId('mine-again')
                .setStyle('Secondary'),

                new ButtonBuilder()
                .setLabel('Buy Pickaxe')
                .setCustomId('buy-pickaxe')
                .setStyle('Secondary')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (10000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 4)
    const willToolBreak = Math.round(Math.random() * 100)

    if (willGetRandomItem === 0) {
        let itemToGet = randomItemsMineMars[Math.floor(Math.random() * randomItemsMineMars.length)]
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
                .setDescription(`You found ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while mining.`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Mine Again')
                    .setCustomId('mine-again')
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
                .setDescription(`${reasonsToBreakPick[Math.floor(Math.random() * reasonsToBreakPick.length)]}\n`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Mine Again')
                    .setCustomId('mine-again')
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
                .setTitle(`${interaction.user.tag} went mining`)
                .setColor('0x' + colours.blend)
                .setDescription(`You went mining and found \`${amount.toLocaleString()}\` coins`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Mine Again')
                    .setCustomId('mine-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    mineAgainEarth
}