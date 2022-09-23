const invSchema = require('../../../models/inventorySchema')
const profileSchema = require('../../../models/userProfile')
const { colours, emojis, begLocations } = require('../../../things/constants')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')

async function begOnEarth(interaction) {
    let userProfile = await profileSchema.findOne({
        userId: interaction.user.id
    })
    if (!userProfile) userProfile = await profileSchema.create({userId: interaction.user.id})
    const randomCoins = Math.round(Math.random() * (10000 - 1) + 1)
    const willGetRandomItem = Math.round(Math.random() * 175)
    const willGetDevCoin = Math.round(Math.random() * 19)
    if (willGetDevCoin === 0) {
        const lookupDevCoin = await invSchema.findOne({
            userId: interaction.user.id,
            itemId: 'dev coin'
        })
        if (!lookupDevCoin) invSchema.create({
            userId: interaction.user.id,
            itemId: 'dev coin',
            item: 'Dev Coin',
            amount: 1,
            emoji: emojis.devCoin
        })
        else lookupDevCoin.amount += 1;
        lookupDevCoin.save()

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} begged KSchlatt`)
                .setColor('0xa744fc')
                .setDescription(`Schlatt gave you a ${emojis.devCoin} Dev Coin`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Beg Again')
                    .setCustomId('beg-again')
                    .setStyle('Secondary')
                )
            ]
        })
    } else if (willGetRandomItem === 0) {
        const lookupFunnyDog = await invSchema.findOne({
            userId: interaction.user.id,
            itemId: 'funny dog'
        })
        if (!lookupFunnyDog) invSchema.create({
            userId: interaction.user.id,
            itemId: 'funny dog',
            item: 'Funny dog',
            amount: 1,
            emoji: emojis.funnyDog
        })
        else lookupFunnyDog.amount += 1;
        lookupFunnyDog.save()

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.user.tag} went begging in the pet shop`)
                .setColor('0xa744fc')
                .setDescription(`The pet shop owner gave you a ${emojis.funnyDog} Funny Dog but took your shovel`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Beg Again')
                    .setCustomId('beg-again')
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
                .setTitle(`${interaction.user.tag} went begging`)
                .setColor('0x' + colours.blend)
                .setDescription(`${(begLocations[Math.floor(Math.random() * begLocations.length)]).replaceAll('{amount}', `${amount.toLocaleString()}`)}`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Beg Again')
                    .setCustomId('beg-again')
                    .setStyle('Secondary')
                )
            ]
        })
    }
}

module.exports = {
    begOnEarth
}