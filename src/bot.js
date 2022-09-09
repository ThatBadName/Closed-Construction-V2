const {
  token
} = require('../config.json')
const {
  Client,
  Collection,
  GatewayIntentBits,
  ChannelType
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
const awaitVoteAgainNotifSchema = require('./models/awaitVoteAgainNotif')
const passiveCooldownSchema = require('./models/passiveCooldowns')
const functions = require('./commandFunctions')

const checkForExpired = async () => {
  const query = {
    expires: {
      $lt: new Date()
    },
  }

  await blacklistedGuilds.deleteMany(query)
  await blacklistedUsers.deleteMany(query)
  await commandCooldowns.deleteMany(query)
  await robCooldowns.deleteMany(query)
  await robCooldownsSus.deleteMany(query)
  await recentCommandSchema.deleteMany(query)
  await activeDevCoinSchema.deleteMany(query)
  await robMultiSchema.deleteMany(query)
  await passiveCooldownSchema.deleteMany(query)
  setTimeout(checkForExpired, 1000 * 1)
}
checkForExpired()

const checkForExpiredBoosts = async () => {
  const query = {
    expires: {
      $lt: new Date()
    },
  }

  const results = await xpBoosts.find(query)

  for (const result of results) {
    const {
      userId,
      increase
    } = result

    const userProfile = await profileSchema.findOne({
      userId: userId
    })
    if (!userProfile) continue

    if (userProfile.xpBoost - increase <= 0) {
      userProfile.xpBoost = 0;
      userProfile.save()
    } else {
      userProfile.xpBoost -= increase;
      userProfile.save()
    }

    result.delete()
  }
  setTimeout(checkForExpiredBoosts, 1000 * 1)
}
checkForExpiredBoosts()

const checkForExpiredJobs = async () => {
  const query = {
    getsFiresOn: {
      $lt: new Date()
    },
    hasBeenFired: false
  }

  const results = await profileSchema.find(query)

  for (const result of results) {
    const {
      userId,
    } = result

    const userProfile = await profileSchema.findOne({
      userId: userId
    })
    if (!userProfile) continue

      userProfile.hasBeenFired = true
      userProfile.save()
  }
  setTimeout(checkForExpiredJobs, 1000 * 1)
}
checkForExpiredJobs()

const checkForNotifs = async () => {
  const query = {
    expires: {
      $lt: new Date()
    },
  }

  const resultsForNotifs = await awaitVoteAgainNotifSchema.find(query)

  for (const result of resultsForNotifs) {
    const {
      userId,
    } = result

    functions.createNewNotif(userId, `You are able to [vote again](https://top.gg/bot/994644001397428335/vote)!`)
    const userProfile = await profileSchema.findOne({
      userId: userId
    })
    if (!userProfile) continue
    userProfile.canVote = true
    userProfile.save()

    result.delete()
  }
  setTimeout(checkForNotifs, 1000 * 1)
}
checkForNotifs()

const Topgg = require("@top-gg/sdk")
const express = require("express")
const inventorySchema = require('./models/inventorySchema')
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  WebhookClient
} = require('discord.js')

const app = express()

const webhook = new Topgg.Webhook("ClosedConstruction")
const webhookVoter = new WebhookClient({url: 'https://discord.com/api/webhooks/1005529556318441482/edN5A8FXmzVsCEhg6H4TCq8kT2X3tkdL6u8v-vnRbJ8Z8ETKNY3_fOUlX8RAAtnkljX4'})

app.post("/dblwebhook", webhook.listener(async (vote) => {
  const member = await client.users.fetch(vote.user)
  webhookVoter.send({
    embeds: [
      new EmbedBuilder()
      .setTitle('Thanks for voting!')
      .setDescription(`<@${vote.user}> (\`${vote.user}\`) has just voted on Top.gg!`)
      .setColor('0xa477fc')
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setStyle('Link')
        .setLabel('Vote on Top.gg')
        .setURL('https://top.gg/bot/994644001397428335/vote')
      )
    ]
  })
  
  const checkForProfile = await profileSchema.findOne({
    userId: vote.user
  })
  const checkInv = await inventorySchema.findOne({
    userId: vote.user,
    itemId: 'cheque'
  })

  const date = new Date()
  date.setHours(date.getHours() + 12)

  await awaitVoteAgainNotifSchema.create({
    userId: vote.user,
    expires: date
  })

  if (checkForProfile) {
    var today = new Date()
    if (today.getDay() == 6 || today.getDay() == 0) {
      checkForProfile.wallet += 40000
      checkForProfile.canVote = false
      checkForProfile.save()

      if (!checkInv) inventorySchema.create({
        userId: vote.user,
        itemId: 'cheque',
        item: 'Cheque',
        amount: 3,
        emoji: '<:Cheque:1005448240663117854>'
      })
      else {
        checkInv.amount += 3;
        checkInv.save()
      }

      member.send({
        embeds: [
          new EmbedBuilder()
          .setTitle('Thanks for voting!')
          .setDescription(`As a thank you, we have given you \`40,000\` coins and 3 <:Cheque:1005448240663117854>Cheques`)
          .setColor('0xa477fc')
          .setFooter({
            text: `Cause it's the weekend the rewards are better`
          })
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setStyle('Link')
            .setLabel('Vote on Top.gg')
            .setURL('https://top.gg/bot/994644001397428335/vote')
          )
        ]
      }).catch(() => {})
    } else {
      checkForProfile.wallet += 20000
      checkForProfile.save()

      if (!checkInv) inventorySchema.create({
        userId: vote.user,
        itemId: 'cheque',
        item: 'Cheque',
        amount: 1,
        emoji: '<:Cheque:1005448240663117854>'
      })
      else {
        checkInv.amount += 1;
        checkInv.save()
      }

      member.send({
        embeds: [
          new EmbedBuilder()
          .setTitle('Thanks for voting!')
          .setDescription(`As a thank you, we have given you \`20,000\` coins and 1 <:Cheque:1005448240663117854>Cheque`)
          .setColor('0xa477fc')
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setStyle('Link')
            .setLabel('Vote on Top.gg')
            .setURL('https://top.gg/bot/994644001397428335/vote')
          )
        ]
      }).catch(() => {})
    }
  } else {
    member.send({
      embeds: [
        new EmbedBuilder()
        .setTitle('Thanks for voting!')
        .setDescription(`If you had a bot profile we would have sent you some gifts`)
        .setColor('0xa477fc')
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setStyle('Link')
          .setLabel('Vote on Top.gg')
          .setURL('https://top.gg/bot/994644001397428335/vote')
        )
      ]
    }).catch(() => {})
  }
}))

app.listen(10003)

client.on('guildCreate', async (guild) => {
  const g = await client.guilds.cache.get(guild.id)?.fetch()
  const members = await g.members.fetch()
  if (guild.memberCount < 25 || members.filter(u => !u.user.bot).size <= members.filter(u => u.user.bot).size + 3) {
    const channel = guild.channels.cache.find(channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has('SendMessages'))
    let failedEmbed = false
    try {
      await channel.send({
        embeds: [
          new EmbedBuilder()
          .setTitle('I have left the server')
          .setDescription(
            'There are a few reasons that I may have left this server:\n\n\`1.\` Your server has under 25 members\n\`2.\` Your server has more bots than humans\n\`3.\` There are too many bots for the number of humans in your server' +
            '\n\nThese restrictions are in place because we are trying to get the bot verified and servers like this may get it denied. We will remove these restrictions when the bot is verified' +
            '. If you would like to still use the bot you can join the support server or use it in another server. If your server manages to not have the things listed above then feel free to reinvite the bot'
          )
          .setColor('0xa477fc')
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setLabel('Invite Me')
            .setStyle('Link')
            .setURL('https://discord.com/oauth2/authorize?client_id=994644001397428335&permissions=412921220161&scope=bot%20applications.commands'),

            new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle('Link')
            .setURL('https://discord.gg/9jFqS5H43Q')
          )
        ]
      })
    } catch {
      failedEmbed = true
    }
    if (failedEmbed === true) {
      await channel.send(
        'There are a few reasons that I may have left this server:\n\n\`1.\` Your server has under 25 members\n\`2.\` Your server has more bots than humans\n\`3.\` There are too many bots for the number of humans in your server' +
        '\n\nThese restrictions are in place because we are trying to get the bot verified and servers like this may get it denied. We will remove these restrictions when the bot is verified' +
        '. If you would like to still use the bot you can join the support server or use it in another server. If your server manages to not have the things listed above then feel free to reinvite the bot' +
        '\n\nSupport Server: https://discord.gg/9jFqS5H43Q\nBot Invite: https://discord.com/oauth2/authorize?client_id=994644001397428335&permissions=412921220161&scope=bot%20applications.commands'
      ).catch(() => {})
    }
    setTimeout(() => guild.leave(), 5000)
  }
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
  // console.log(" [antiCrash] :: Multiple Resolves")
  // console.log(type, promise, reason)
})