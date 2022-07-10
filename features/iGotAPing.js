const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js')

module.exports = (client) => {
        client.on('messageCreate', async (message) => {
            if (message.channel.type === 'DM') return
            if (message.author.bot) return

            if (message.content.startsWith('<@994644001397428335>')) {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://discord.com/api/oauth2/authorize?client_id=994644001397428335&permissions=1644935244887&scope=applications.commands+bot')
                        .setLabel('Invite Me')
                    )
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setLabel('Support Server')
                        .setURL('https://discord.gg/9jFqS5H43Q')
                    )
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://soumou.laurens.host')
                        .setLabel('Documentation')
                    )

                const pingEmbed = new MessageEmbed()
                    .setTitle(`You pinged me!`)
                    .setDescription('If you need any help with the bot please join the [Support Server](https://discord.gg/9jFqS5H43Q) or read the [Docs](https://soumou.laurens.host)')
                    .setFields({
                        name: 'Where are my commands?',
                        value: 'I use /commands. Type `/` and you can see a list of them',
                        inline: true,
                    })
                    .setColor('RANDOM')
                    .setFooter({
                        text: 'This message will only appear if your message starts with my tag'
                    })
                message.reply({
                    embeds: [pingEmbed],
                    components: [row]
                })
            }
        })
    },

    module.exports.config = {
        dbName: 'I GOT A PING',
        displayName: 'I got a ping',
    }