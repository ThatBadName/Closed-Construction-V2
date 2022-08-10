const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function huntAgainEarth(interaction) {
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
            .setColor('0xa744fc')
            .setDescription('You can buy a rifle from the shop (\`/shop buy item:rifle\`)')
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
    if (!checkForAmmo) return interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle('You do not have any ammo')
            .setColor('0xa744fc')
            .setDescription('You can buy ammo from the shop (\`/shop buy item:ammo\`)')
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

    const randomCoins = Math.round(Math.random() * (250 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 25)
    const willToolBreak = Math.round(Math.random() * 10)
    const reasonsToBreak = [
        `Your rifle got jammed and you threw it agains a rock in fustration`,
        `Your rifle decided that it would no longer work`,
        `You dropped your rifle down a very big hole. Not sure it's possible to get it back`,
        `A bear stole your rifle off you`,
        `You were so bad at aiming you smashed your rifle against a rock`
    ]

    if (willGetRandomItem === 0) {
        const randomItems = [
            `scout,<:Scout:1005521226887864480>,Scout`,
            `berries,<:Berries:1006621693009215559>,Berries`,
            `snake,<:ImageNotFound:1005453599800840262>,Snake`,
            `duck,<:ImageNotFound:1005453599800840262>,Duck`,
            `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
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

        if (checkForPick.amount === 1) checkForPick.delete()
        else {checkForPick.amount -= 1; checkForPick.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0xa744fc')
                .setDescription(`You found ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while hunting. Bad news though, ${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}`)
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
                .setColor('0xa744fc')
                .setDescription(`${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}\n`)
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
        const multi = Math.round(randomCoins / 100 * userProfile.coinMulti)
        const amount = randomCoins + multi
        userProfile.wallet += amount
        userProfile.save()

        if (checkForAmmo.amount === 1) checkForAmmo.delete()
        else {checkForAmmo.amount -= 1; checkForAmmo.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} went hunting`)
                .setColor('0xa744f2')
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
    huntAgainEarth
}