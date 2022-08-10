const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDMPermission(false)
    .setDescription('Get stats about the bot'),

    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true
        })

        const registeredUserCount = await profileSchema.find()
        const highestBank = await profileSchema.findOne().sort({bank: -1})
        const highestWallet = await profileSchema.findOne().sort({wallet: -1})

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Bot Stats!')
                .setColor('0xa477fc')
                .setFields({
                    name: 'Ping',
                    value: `API Latency: \`${client.ws.ping}\`ms\nClient Ping: \`${message.createdTimestamp - interaction.createdTimestamp}\`ms`,
                    inline: true
                }, {
                    name: 'Counts',
                    value:
                        `Registered Users: \`${registeredUserCount.length}\`\n` +
                        `Most Coins In Wallet: \`${highestWallet.wallet.toLocaleString()}\` (<@${highestWallet.userId}>)\n` +
                        `Most Coins In Bank: \`${highestBank.bank.toLocaleString()}\` (<@${highestBank.userId}>)\n` +
                        `\nServers: \`${client.guilds.cache.size.toLocaleString()}\`\nUsers: \`${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()}\``
                })
            ]
        })
    }
}