const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'Why',
    aliases: [''],
    description: 'Why would you do this command?',
    category: 'Misc',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
        name: 'why_did_you_use_this_command',
        description: 'Please tell me the reason you used this command',
        type: 'STRING',
        required: true,
    }],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'why', 3, interaction)
        if (cldn === true) return
        let why = interaction.options.getString('why_did_you_use_this_command')
        functions.createRecentCommand(interaction.user.id, 'why', `WHY: ${why.slice(0, 100)}`, interaction)

        const willGetRandomItem = Math.round(Math.random() * 50)
        if (willGetRandomItem === 0) {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Why?')
                    .setColor('0xa744fc')
                    .setDescription(`Why did you just get a <:FunnyDog:995418957601329222> Funny Dog`)
                ]
            })
        } else interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Why?')
                .setColor('0xa744fc')
            ]
        })
    }
}