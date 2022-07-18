const {
    MessageEmbed
} = require("discord.js")

module.exports = {
    name: "leaveguild",
    description: "Leave a guild the bot is in.",
    category: "Dev",
    slash: true,
    testOnly: true,
    ownerOnly: true,
    options: [{
        name: "guildid",
        description: "The ID of the guild to leave",
        required: true,
        type: "STRING",
    }, ],

    callback: async ({
        interaction,
        client
    }) => {
        const guildId = interaction.options.getString("guildid")
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return interaction.reply("No guild was found.")
        try {
            guild.leave()
            return interaction.reply({
                embeds: [new MessageEmbed().setColor("GREEN").setDescription({
                    name: `${client.user.username} has successfully left ${guild.name}`
                })]
            })
        } catch (error) {
            return interaction.reply({
                embeds: [new MessageEmbed().setColor("GREEN").setAuthor({
                    name: `${client.user.username} failed to leave ${guild.name}`,
                    iconURL: client.user.displayAvatarURL({
                        dynamic: true
                    })
                }).addField("Error", `${error}`)]
            })
        }
    }
}