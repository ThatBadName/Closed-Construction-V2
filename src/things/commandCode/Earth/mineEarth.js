const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function mineOnEarth(interaction) {
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
            .setColor('0xa744fc')
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

    const randomCoins = Math.round(Math.random() * (5000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 5)
    const willToolBreak = Math.round(Math.random() * 100)
    const reasonsToBreak = [
        `A very hard rock made your pick get stuck`,
        `Your torch blew out and you lost your pick`,
        `You snapped the handle off your pick`
    ]

    if (willGetRandomItem === 0) {
        const randomItems = [
            `rocks,<:ImageNotFound:1005453599800840262>,Rocks`,
            `rocks,<:ImageNotFound:1005453599800840262>,Rocks`,
            `rocks,<:ImageNotFound:1005453599800840262>,Rocks`,
            `rocks,<:ImageNotFound:1005453599800840262>,Rocks`,
            `minerals,<:ImageNotFound:1005453599800840262>,Minerals`
        ]
        let itemToGet = randomItems[Math.floor(Math.random() * randomItems.length)]
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
                .setColor('0xa744fc')
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
                .setColor('0xa744fc')
                .setDescription(`${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}\n`)
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
                .setColor('0xa744f2')
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
    mineOnEarth
}