const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDMPermission(false)
    .setDescription('Get stats about the bot'),

    async execute(interaction, client) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return

        const cldn = await functions.cooldownCheck(interaction.user.id, 'stats', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'stats', `None`, interaction)

        const message = await interaction.deferReply({
            fetchReply: true
        })
        const promises = [
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];
        
        Promise.all(promises)
            .then(async(results) => {
                const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
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
                                `\nServers: \`${totalGuilds.toLocaleString()}\`\nUsers: \`${totalMembers.toLocaleString()}\`\nShard: \`${interaction.guild.shard.id.toLocaleString()}/${client.shard.ids.length.toLocaleString() - 1}\``
                        })
                    ]
                })
            })

    }
}