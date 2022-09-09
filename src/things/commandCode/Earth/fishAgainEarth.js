const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function fishAgainEarth(interaction) {
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
            .setColor('0xa744fc')
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

    const randomCoins = Math.round(Math.random() * (5000 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 5)
    const willToolBreak = Math.round(Math.random() * 100)
    const reasonsToBreak = [
        `A fish ate your bait, and the fishing wire, and the rod. HOW????`,
        `You got pushed into the river by a stranger. You got out but you lost your fishing rod`,
        `Lol ur fishing rod broke. Mabye get a better one next time`,
        `A dog came and took your fishing rod thinking it was a stick`,
        `You decided to fish under a tree. Not a surprise that your rod got stuck. You went home with nothing`,
        `You dropped your fishing rod into the river, it floated away`
    ]

    if (willGetRandomItem === 0) {
        const randomItems = [
            `wood,<:ImageNotFound:1005453599800840262>,Wood`,
            `plastic,<:ImageNotFound:1005453599800840262>,Plastic`,
            `string,<:ImageNotFound:1005453599800840262>,String`,
            `camera,<:ImageNotFound:1005453599800840262>,Camera`,
            `squid,<:ImageNotFound:1005453599800840262>,Squid`,
            `fish,<:Fish:1006637918095413339>,Fish`,
            `duck,<:ImageNotFound:1005453599800840262>,Duck`
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
                .setColor('0xa744fc')
                .setDescription(`${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}\n`)
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
                .setColor('0xa744f2')
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
    fishAgainEarth
}