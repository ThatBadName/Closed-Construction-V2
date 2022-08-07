const mongoose = require('mongoose')
const { mongoUri } = require('../../../config.json')

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[Startup] ${client.user.username} is online`)
        mongoose.connect(mongoUri, { keepAlive: true }).then(console.log(`[Startup] ${client.user.username} has connected to mongo`))

        const check = async () => {
            const rng = Math.floor(Math.random() * 10)
            if (rng === 0) {
                client.user.setPresence({
                    activities: [{
                        name: 'Breaking Bad',
                        url: 'https://twitch.tv/schlattk',
                        type: 'STREAMING'
                    }],
                    status: 'idle'
                })
            }
            if (rng === 1) {
                client.user.setPresence({
                    activities: [{
                        name: 'Away from my job of being a bot',
                        type: 'PLAYING'
                    }],
                    status: 'idle'
                })
            }
            if (rng === 2) {
                client.user.setPresence({
                    activities: [{
                        name: 'The Devs',
                        type: 'WATCHING'
                    }],
                    status: 'dnd'
                })
            }
            if (rng === 3) {
                client.user.setPresence({
                    activities: [{
                        name: 'KSchlatt',
                        type: 'WATCHING'
                    }],
                    status: 'online'
                })
            }
            if (rng === 4) {
                client.user.setPresence({
                    activities: [{
                        name: 'ThatBadName',
                        type: 'WATCHING'
                    }],
                    status: 'dnd'
                })
            }
            if (rng === 5) {
                client.user.setPresence({
                    activities: [{
                        name: 'for abuse',
                        type: 'WATCHING'
                    }],
                    status: 'dnd'
                })
            }
            if (rng === 6) {
                client.user.setPresence({
                    activities: [{
                        name: 'Logging',
                        type: 'Playing'
                    }],
                    status: 'idle'
                })
            }
            if (rng === 7) {
                client.user.setPresence({
                    activities: [{
                        name: 'the world burn',
                        type: 'WATCHING'
                    }],
                    status: 'dnd'
                })
            }
            if (rng === 8) {
                client.user.setPresence({
                    activities: [{
                        name: 'the devs',
                        type: 'LISTENING'
                    }],
                    status: 'Online'
                })
            }
            if (rng === 9) {
                client.user.setPresence({
                    activities: [{
                        name: 'Fix The Server',
                        type: 'PLAYING'
                    }],
                    status: 'idle'
                })
            }
            if (rng === 10) {
                client.user.setPresence({
                    activities: [{
                        name: 'Cheese Cake',
                        type: 'PLAYING'
                    }],
                    status: 'idle'
                })
            }
    
            setTimeout(check, 1000 * 60)
        }
        check()
    }
}