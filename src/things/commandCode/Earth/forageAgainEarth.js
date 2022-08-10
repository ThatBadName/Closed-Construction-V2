const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
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
            .setColor('0xa744fc')
            .setDescription('You can buy an axe from the shop (\`/shop buy item:axe\`)')
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

    const randomCoins = Math.round(Math.random() * (250 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 25)
    const willToolBreak = Math.round(Math.random() * 10)
    const reasonsToBreak = [
        `A wolf came and stole your axe`,
        `You ate some berries that made you feel sick, you went home leaving your axe in the woods`,
        `You tried to cut some wood that was too hard`,
        `You lost your axe`
    ]

    if (willGetRandomItem === 0) {
        const randomItems = [
            `berries,<:Berries:1006621693009215559>,Berries`,
            `snake,<:ImageNotFound:1005453599800840262>,Snake`,
            `duck,<:ImageNotFound:1005453599800840262>,Duck`,
            `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
            `string,<:ImageNotFound:1005453599800840262>,String`,
            `glue,<:Glue:1006637919873806416>,Glue`,
            `tape,<:DuctTape:1006293231476166737>,Tape`,
            `wood,<:ImageNotFound:1005453599800840262>,Wood`,
            `metal,<:ImageNotFound:1005453599800840262>,Metal`,
            `plastic,<:ImageNotFound:1005453599800840262>,Plastic`,
            `camera,<:ImageNotFound:1005453599800840262>,Camera`,
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

        if (checkForAxe.amount === 1) checkForAxe.delete()
        else {checkForAxe.amount -= 1; checkForAxe.save()}

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0xa744fc')
                .setDescription(`You found a ${itemToGet.split(',')[1]}${itemToGet.split(',')[2]} while mining. Bad news though, ${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}`)
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
                .setColor('0xa744fc')
                .setDescription(`${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}\n`)
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
        const multi = Math.round(randomCoins / 100 * userProfile.coinMulti)
        const amount = randomCoins + multi
        userProfile.wallet += amount
        userProfile.save()

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} went forgaing`)
                .setColor('0xa744f2')
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