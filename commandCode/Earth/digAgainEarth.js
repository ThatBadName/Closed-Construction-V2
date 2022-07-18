const invSchema = require('../../models/inventorySchema')
const profileSchema = require('../../models/userProfile')
const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
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
            new MessageEmbed()
            .setTitle('You need a shovel to use this')
            .setColor('0xa744fc')
            .setDescription('You can buy a shovel from the shop (\`/shop buy item:shovel\`)')
        ],
        components: [
            new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Dig Again')
                .setCustomId('dig-again')
                .setStyle('SECONDARY')
            )
        ]
    })

    const randomCoins = Math.round(Math.random() * (250 - 5) + 5)
    const willGetRandomItem = Math.round(Math.random() * 100)
    const willToolBreak = Math.round(Math.random() * 10)
    const reasonsToBreak = [
        'Your shovel hit a rock and shattered into pieces',
        'Some mole decided to grab your shovel and hide it',
        'Your hands got sweaty and you dropped your shovel. You got too lazy to pick it up so you went home',
        'You left your shovel at home and a beaver ate it',
        'You met Bad in the quary and he took your shovel',
        'KSchlatt decided to prank you but it went a bit far.. You lost your shovel'
    ]

    if (willGetRandomItem === 0) {
        const lookupFunnyDog = await invSchema.findOne({
            userId: interaction.user.id,
            itemId: 'mayo-dog'
        })
        if (!lookupFunnyDog) invSchema.create({
            userId: interaction.user.id,
            itemId: 'mayo-dog',
            item: 'Funny dog',
            amount: 1,
            emoji: '<:FunnyDog:995418957601329222>'
        })
        else lookupFunnyDog.amount += 1;
        lookupFunnyDog.save()

        if (checkForShovel.amount === 1) checkForShovel.delete()
        else {checkForShovel.amount -= 1; checkForShovel.save()}

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0xa744fc')
                .setDescription(`A <:FunnyDog:995418957601329222> Funny Dog bit of the blade of your shovel but you managed to grab the dog by it's collar\n\nYou have been given a <:FunnyDog:995418957601329222> Funny Dog`)
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('SECONDARY')
                )
            ]
        })
    } else if (willToolBreak === 0) {
        if (checkForShovel.amount === 1) checkForShovel.delete()
        else {checkForShovel.amount -= 1; checkForShovel.save()}

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`${interaction.user.tag} Uhhh something happened`)
                .setColor('0xa744fc')
                .setDescription(`${reasonsToBreak[Math.floor(Math.random() * reasonsToBreak.length)]}\n`)
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('SECONDARY')
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
                new MessageEmbed()
                .setTitle(`${interaction.user.tag} dug in the ground`)
                .setColor('0xa744f2')
                .setDescription(`You went digging and found \`${amount}\` coins`)
                .setFooter({
                    text: `${multi === 0 ? '' : `+${multi} coins (Your multiplier is +${userProfile.coinMulti}%)`}`
                })
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Dig Again')
                    .setCustomId('dig-again')
                    .setStyle('SECONDARY')
                )
            ]
        })
    }
}

module.exports = {
    digAgainOnEarth
}