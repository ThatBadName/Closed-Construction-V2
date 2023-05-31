const {
  token
} = require('../config.json')
const {
  Client,
  Collection,
  GatewayIntentBits,
  ChannelType,
  Partials
} = require('discord.js')
const fs = require('fs')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites
  ]
})
client.commands = new Collection()
client.buttons = new Collection()
client.selectMenus = new Collection()
client.commandArrayGlobal = []
client.commandArrayLocal = []

const functionFolders = fs.readdirSync('./src/functions')
for (const folder of functionFolders) {
  const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'))
  for (const file of functionFiles) require(`./functions/${folder}/${file}`)(client)
}

client.handleEvents()
client.handleComponents()
client.handleGlobalCommands()
client.handleLocalCommands()
client.login(token)

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
  // console.log(" [antiCrash] :: Multiple Resolves")
  // console.log(type, promise, reason)
})