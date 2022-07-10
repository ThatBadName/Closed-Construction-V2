const discordJs = require('discord.js')
const wokCommands = require('wokcommands')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const {
    Intents
} = discordJs
const client = new discordJs.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
})

process.on("unhandledRejection", (reason, p) => {
    console.log(" [antiCrash] :: Unhandled Rejection/Catch")
    console.log(reason, p)
})

process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch")
    console.log(err, origin)
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)")
    console.log(err, origin)
})

process.on("multipleResolves", (type, promise, reason) => {
    console.log(" [antiCrash] :: Multiple Resolves")
    console.log(type, promise, reason)
})

client.on('ready', () => {
    new wokCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'features'),
        defaultLangauge: 'english',
        dbOptions: {
            keepAlive: true
        },
        disabledDefaultCommands: [
            'help',
            'command',
            'language',
            'prefix',
            'requiredrole',
            'channelonly'
        ],
        mongoUri: process.env.MONGO_URI,
        ignoreBots: true,
        testServers: ['994642021425877112'],
        botOwners: ['804265795835265034', '974856016183328789']
    })
})
client.login(process.env.TOKEN)