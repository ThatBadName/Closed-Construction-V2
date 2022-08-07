const {
  token
} = require('../config.json')
const {
  Client,
  Collection,
  GatewayIntentBits
} = require('discord.js')
const fs = require('fs')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites
  ]
})

client.commands = new Collection()
client.commandArrayGlobal = []
client.commandArrayLocal = []

const functionFolders = fs.readdirSync('./src/functions')
for (const folder of functionFolders) {
  const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'))
  for (const file of functionFiles) require(`./functions/${folder}/${file}`)(client)
}

client.handleEvents()
client.handleGlobalCommands()
client.handleLocalCommands()
client.login(token)

// Expired Cooldowns
const blacklistedGuilds = require('./models/blacklistGuild')
const blacklistedUsers = require('./models/blacklistUser')
const commandCooldowns = require('./models/cooldowns')
const robCooldowns = require('./models/robCooldowns')
const robCooldownsSus = require('./models/robCooldownsSus')
const recentCommandSchema = require('./models/recentCommands')
const profileSchema = require('./models/userProfile')
const xpBoosts = require('./models/xpBoosts')
const activeDevCoinSchema = require('./models/activeDevCoins')
const robMultiSchema = require('./models/robMulti')

const check = async () => {
  const query = {
    expires: {
      $lt: new Date()
    },
  }

  const results = await xpBoosts.find(query)

  for (const result of results) {
    const { userId, increase } = result
    
    const userProfile = await profileSchema.findOne({userId: userId})
    if (!userProfile) continue

    if (userProfile.xpBoost - increase <= 0) {userProfile.xpBoost = 0; userProfile.save()}
    else {userProfile.xpBoost -= increase; userProfile.save()}

    result.delete()
  }

  await blacklistedGuilds.deleteMany(query)
  await blacklistedUsers.deleteMany(query)
  await commandCooldowns.deleteMany(query)
  await robCooldowns.deleteMany(query)
  await robCooldownsSus.deleteMany(query)
  await recentCommandSchema.deleteMany(query)
  await activeDevCoinSchema.deleteMany(query)
  await robMultiSchema.deleteMany(query)
  setTimeout(check, 1000 * 1)
}
check()


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