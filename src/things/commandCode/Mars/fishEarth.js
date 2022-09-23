const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, reasonsToBreakRod, randomItemsFish } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function fishOnEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})

    const checkForRod = await invSchema.findOne({
        userId: interaction.user.id,
        itemId: 'rod'
    })
    if (!checkForRod) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You need a fishing rod to use this')
            .setColor('0x' + colours.alert)
            .setDescription('You can buy a rod from the shop (\`/shop buy item:rod\`)')
        ],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Fish Again')
                .setCustomId('fish-again')
                .setStyle('Secondary'),
    
                new ButtonBuilder()
                .setLabel('Buy Rod')
                .setCustomId('buy-rod')
                .setStyle('Secondary')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (10000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 4)
    const willToolBreak = Math.round(Math.random() * 100)

    if (willGetRandomItem === 0) {
        let itemToGet = randomItemsFish[Math.floor(Math.random() * randomItemsFish.length)]
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
                .setDescription(`You found a ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while fishing.`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Fish Again')
                    .setCustomId('fish-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else if (willToolBreak === 0) {
        if (checkForRod.amount === 1) checkForRod.delete()
        else {checkForRod.amount -= 1; checkForRod.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0x' + colours.blend)
                .setDescription(`${reasonsToBreakRod[Math.floor(Math.random() * reasonsToBreakRod.length)]}\n`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Fish Again')
                    .setCustomId('fish-again')
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
                .setTitle(`${interaction.user.tag} went fishing`)
                .setColor('0x' + colours.blend)
                .setDescription(`You went fishing and found \`${amount.toLocaleString()}\` coins`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Fish Again')
                    .setCustomId('fish-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    fishOnEarth
}