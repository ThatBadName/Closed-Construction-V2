const {
    MessageEmbed
} = require('discord.js')

module.exports = {
    name: 'Devs',
    aliases: [''],
    description: 'Information About the bot and the devs. And the work behind it.',
    category: 'Misc',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'devs', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'devs', `None`, interaction)

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('0xcc6e73')
                .setTitle('Here is the message from the devs')
                .setFields({
                    name: 'Kschlatt\'s Dev Notes',
                    value: `Well this bot was a learning experince.`
                }, {
                    name: `BadName's stuff`,
                    value: `Hi! I'm bad and idk what to put here but i hope u have a good time using the bot`
                })
                .setFooter({
                    text: `Made by the 2 magical devs!`
                })
            ]
        })
    }
}