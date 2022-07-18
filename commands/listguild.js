const {
    CommandInteraction,
    Client,
    MessageEmbed,
    Message
} = require("discord.js");

module.exports = {
    name: "listguilds",
    description: "Shows total guilds/names",
    category: 'Dev',
    slash: true,
    testOnly: true,
    ownerOnly: true,
    options: [{
            name: 'list',
            description: 'List 50 of the servers im in',
            type: 'SUB_COMMAND'
        },
        {
            name: 'view',
            description: 'View a server',
            type: 'SUB_COMMAND',
            options: [{
                name: 'guildid',
                description: 'The guild to view',
                type: 'STRING',
                required: true
            }, ]
        }
    ],

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    callback: async ({
        interaction,
        client
    }) => {
        if (interaction.options.getSubcommand() === 'list') {
            const guild = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).first(50);
            const description = guild.map((guild, index) => `#**${index + 1}** ${guild.name} | \`${guild.id}\` | ${guild.memberCount} Members`).join('\n');
            let embed = new MessageEmbed()
                .setDescription(`\`\`\`${description}\`\`\``)
                .setColor('0xa744f2')
            interaction.reply({
                embeds: [embed]
            });
        } else if (interaction.options.getSubcommand() === 'view') {
            const guild = client.guilds.cache.find(g => g.id === interaction.options.getString('guildid'))
            if (!guild) return interaction.reply({
                embeds: [new MessageEmbed().setTitle('Im not in this guild')]
            })
            let invite = await guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT").first().createInvite({
                maxAge: 60
            })
            let embed = new MessageEmbed()
                .setTitle(`${guild.name} (${guild.id})`)
                .setDescription(`${invite}`)
            interaction.reply({
                embeds: [embed]
            })
        }
    }
}