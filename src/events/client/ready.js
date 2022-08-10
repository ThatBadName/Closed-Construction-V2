const mongoose = require('mongoose')
const {
    mongoUri
} = require('../../../config.json')
const {
    ActivityType
} = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[Startup] ${client.user.username} is online`)
        mongoose.connect(mongoUri, {
            keepAlive: true
        }).then(console.log(`[Startup] ${client.user.username} has connected to mongo`))

        let current = 'user'
        const rotate = async () => {
            if (current === 'user') updateStatusHelp()
            else if (current === 'server') updateStatusUser()
            else if (current === 'help') updateStatusRegistered()
            else if (current === 'registered') updateStatusServer()

            setTimeout(rotate, 60000)
        }
        rotate()

        function updateStatusServer() {
            client.user.setPresence({
                activities: [{
                    name: `${client.guilds.cache.size.toLocaleString()} servers`,
                    type: ActivityType.Watching
                }],
                status: 'dnd',
            })
            current = 'server'
        }
        function updateStatusUser() {
            client.user.setPresence({
                activities: [{
                    name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()} users`,
                    type: ActivityType.Watching
                }],
                status: 'dnd',
            })
            current = 'user'
        }
        function updateStatusHelp() {
            client.user.setPresence({
                activities: [{
                    name: `/help`,
                    type: ActivityType.Playing
                }],
                status: 'dnd',
            })
            current = 'help'
        }
        async function updateStatusRegistered() {
            const registeredUsers = await profileSchema.find()
            client.user.setPresence({
                activities: [{
                    name: `${registeredUsers.length.toLocaleString()} registered users`,
                    type: ActivityType.Listening
                }],
                status: 'dnd',
            })
            current = 'registered'
        }
    }
}