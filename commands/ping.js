const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
name: 'ping',
aliases: [''],
description: 'Pong! Get the ping of the bot.',
category: 'Misc',
slash: true,
ownerOnly: false,
guildOnly: true,
testOnly: false,
options: [],

callback: async({interaction, client}) => {
    const functions = require('../checks/functions')
    const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
    if (blks === true) return
    const main = await functions.checkMaintinance(interaction)
    if (main === true) return
    const cldn = await functions.cooldownCheck(interaction.user.id, 'ping', 3, interaction)
    if (cldn === true) return
    functions.createRecentCommand(interaction.user.id, 'ping', `None`, interaction)

    var responseTime = Math.round(Date.now() - interaction.createdTimestamp)
    var responseTime = String(responseTime).slice(1)
    let totalSeconds = (client.uptime / 1000)
    let days = Math.floor(totalSeconds / 86400)
    totalSeconds %= 86400
    let hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    let minutes = Math.floor(totalSeconds / 60)
    let seconds = Math.floor(totalSeconds % 60)

    interaction.reply({
        ephemeral: true,
        embeds: [
            new MessageEmbed()
            .setTitle('Pong!')
            .setColor('0xa744f2')
            .setFields({
                name: 'Bots Uptime',
                value: `I have been online for ${days === 1 ? `\`${days}\` day` : `\`${days}\` days`}, ${hours === 1 ? `\`${hours}\` hour` : `\`${hours}\` hours`}, ${minutes === 1 ? `\`${minutes}\` minute` : `\`${minutes}\` minutes`} and ${seconds === 1 ? `\`${seconds}\` second` : `\`${seconds}\` seconds`}`
            }, {
                name: 'Discord To Bot API Latency',
                value: `\`${String(responseTime)}\`ms`,
                inline: true
            }, {
                name: 'Bot\'s Client Ping',
                value: `\`${client.ws.ping}\`ms`,
                inline: true
            })
        ],
        components: [
            new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Invite Me!')
                .setStyle('LINK')
                .setURL('https://discord.com/api/oauth2/authorize?client_id=994644001397428335&permissions=1644935244887&scope=applications.commands+bot'),

                new MessageButton()
                .setLabel('Support Server')
                .setStyle('LINK')
                .setURL('https://discord.gg/9jFqS5H43Q'),

                new MessageButton()
                .setLabel('Docs')
                .setStyle('LINK')
                .setURL('https://soumou.laurens.host'),
            )
        ]
    })
}
}