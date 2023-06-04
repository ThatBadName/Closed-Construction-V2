const fs = require('fs')
const {
    REST
} = require('@discordjs/rest')
const {
    Routes
} = require('discord-api-types/v10')
const {
    token,
    testGuildId,
    clientId
} = require('../../../config.json')

module.exports = (client) => {
    client.handleLocalCommands = async () => {
        const commandFolders = fs.readdirSync('./src/localCommands')
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/localCommands/${folder}`).filter(file => file.endsWith('.js'))

            const {
                commands,
                commandArrayLocal
            } = client
            for (const file of commandFiles) {
                const command = require(`../../localCommands/${folder}/${file}`)
                commands.set(command.data.name, command)
                commandArrayLocal.push(command.data.toJSON())
            }
        }

        const rest = new REST({
            version: "10"
        }).setToken(token)
        try {
            console.log(`[Commands] Started refreshing local (/) commands`)

            await rest.put(
                Routes.applicationGuildCommands(clientId, testGuildId), {
                    body: client.commandArrayLocal
                }
            )

            console.log(`[Commands] Successfully reloaded local (/) commands`)
        } catch (error) {
            console.error(error)
        }
    }
}