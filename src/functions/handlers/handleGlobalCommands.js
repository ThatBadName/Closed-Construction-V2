const fs = require('fs')
const {
    REST
} = require('@discordjs/rest')
const {
    Routes
} = require('discord-api-types/v10')
const {
    token,
    clientId
} = require('../../../config.json')

module.exports = (client) => {
    client.handleGlobalCommands = async () => {
        const commandFolders = fs.readdirSync('./src/globalCommands')
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/globalCommands/${folder}`).filter(file => file.endsWith('.js'))

            const {
                commands,
                commandArrayGlobal
            } = client
            for (const file of commandFiles) {
                const command = require(`../../globalCommands/${folder}/${file}`)
                commands.set(command.data.name, command)
                commandArrayGlobal.push(command.data.toJSON())
            }
        }

        const rest = new REST({
            version: "10"
        }).setToken(token)
        try {
            console.log(`[Commands] Started refreshing global (/) commands`)

            await rest.put(
                Routes.applicationCommands(clientId), {
                    body: client.commandArrayGlobal
                }
            )

            console.log(`[Commands] Successfully reloaded global (/) commands`)
        } catch (error) {
            console.error(error)
        }
    }
}