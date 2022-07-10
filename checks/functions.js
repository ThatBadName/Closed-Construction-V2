const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')
const commandCooldowns = require('../models/cooldowns')
const profileSchema = require('../models/userProfile')
const recentCommandSchema = require('../models/recentCommands')
const robCooldowns = require('../models/robCooldowns')
const notificationSchema = require('../models/notifications')
const maintenance = require('../models/mantenance')
const premiumUsers = require('../models/premiumUsers')
const premiumGuilds = require('../models/premiumGuilds')
const voucher_codes = require('voucher-code-generator')
const premiumCodeSchema = require('../models/premiumCodes')
const {
    MessageEmbed
} = require('discord.js')

async function blacklistCheck(idUser, idGuild, interaction) {
    const blacklistCheckUser = await blacklistedUsers.findOne({
        userId: idUser
    })
    const blacklistCheckGuild = await blacklistedGuilds.findOne({
        userId: idGuild
    })
    if (blacklistCheckUser) return interaction.reply({
        ephemeral: true,
        embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('You are blacklisted from using the bot.').setDescription('Appeal in the [support server](https://discord.gg/hK3gEQ2XUf)').setFields({
            name: 'Date Added',
            value: `<t:${Math.round(blacklistCheckUser.createdAt.getTime() / 1000)}> (<t:${Math.round(blacklistCheckUser.createdAt.getTime() / 1000)}:R>)`,
            inline: true
        }, {
            name: `Expires`,
            value: `${blacklistCheckUser.duration === 'Eternal' ? 'Never' : `<t:${Math.round(blacklistCheckUser.expires.getTime() / 1000)}:R>`}`,
            inline: true
        }, {
            name: 'Duration',
            value: `\`${blacklistCheckUser.duration}\``,
            inline: true
        }, {
            name: 'Reason',
            value: `${blacklistCheckUser.reason}`
        })]
    }).then(e => {
        return true
    })
    if (blacklistCheckGuild) return interaction.reply({
        ephemeral: true,
        embeds: [new MessageEmbed().setColor('0xa744f2').setTitle('This server has been blacklisted from using the bot.').setDescription('If you are the server owner you can appeal in the [support server](https://discord.gg/hK3gEQ2XUf)').setFields({
            name: 'Date Added',
            value: `<t:${Math.round(blacklistCheckGuild.createdAt.getTime() / 1000)}> (<t:${Math.round(blacklistCheckGuild.createdAt.getTime() / 1000)}:R>)`,
            inline: true
        }, {
            name: `Expires`,
            value: `${blacklistCheckGuild.duration === 'Eternal' ? 'Never' : `<t:${Math.round(blacklistCheckGuild.expires.getTime() / 1000)}:R>`}`,
            inline: true
        }, {
            name: 'Duration',
            value: `\`${blacklistCheckGuild.duration}\``,
            inline: true
        }, {
            name: 'Reason',
            value: `${blacklistCheckGuild.reason}`
        })]
    }).then(e => {
        return true
    })
}

async function checkMaintinance(interaction) {
    const checkMain = await maintenance.findOne()
    const userProfileDev = await profileSchema.findOne({
        userId: interaction.user.id,
        developer: true
    })
    if (userProfileDev) return
    if (checkMain) {
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`Maintenance Mode Is Currently Active`)
                .setColor('0xa744f2')
                .setDescription(`**YOU HAVE NOT BEEN BANNED FROM USING THE BOT IF YOU THINK YOU ARE I CAN'T EVEN THINK AGAIN**\n\n**Reason for maintenance**:\n\`\`\`fix\n${checkMain.maintenanceReason}\n\`\`\``)
            ]
        })
        return true
    }
}


async function cooldownCheck(userID, command, timeout, interaction) {
    const userProfileDev = await profileSchema.findOne({
        userId: interaction.user.id,
        devMode: true
    })
    if (userProfileDev) return
    const checkForCooldowns = await commandCooldowns.findOne({
        userId: userID,
        command: command
    })
    if (checkForCooldowns) {
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Slow it down!')
                .setURL('https://www.youtube.com/watch?v=fkkNfCkupxM')
                .setDescription(`You can use this command again <t:${Math.round(checkForCooldowns.expires.getTime() / 1000)}:R>`)
                .setColor('0xff0000')
            ],
            ephemeral: true
        })
        return true
    }
    const date = new Date()
    date.setSeconds(date.getSeconds() + timeout)
    commandCooldowns.create({
        userId: userID,
        command: command,
        expires: date
    })
}

async function cooldownRobCheck(userID, userRobbedId, timeout, interaction) {
    const userProfileDev = await profileSchema.findOne({
        userId: interaction.user.id,
        devMode: true
    })
    if (userProfileDev) return
    const checkForCooldowns = await robCooldowns.findOne({
        userRobbedId: userRobbedId,
    })
    if (checkForCooldowns) {
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Slow it down!')
                .setURL('https://www.youtube.com/watch?v=fkkNfCkupxM')
                .setDescription(`<@${userRobbedId}> has been robbed within the past hour`)
                .setColor('0xff0000')
            ],
            ephemeral: true
        })
        return true
    }
    const date = new Date()
    date.setSeconds(date.getSeconds() + timeout)
    commandCooldowns.create({
        userId: userID,
        userRobbedId: userRobbedId,
        expires: date
    })
}

async function createRecentCommand(userId, command, commandInfo, interaction) {
    let password = [];
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let passString
    let passWordLength = 7
    for (let i = 0; i < passWordLength; i++) {
        password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }
    passString = password.join('')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)
    recentCommandSchema.create({
        userId: userId,
        command: command,
        commandInfo: commandInfo,
        expires: expires,
        Id: 'A-' + passString,
        guildName: interaction.guild.name,
        guildId: interaction.guild.id
    })

}

async function createCommandPages(commands) {
    const commandEmbeds = []
    let k = 6
    for (let i = 0; i < commands.length; i += 6) {
        const current = commands.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `**User**: <@${item.userId}> (\`${item.userId}\`)\n**Guild**: ${item.guildName} (\`${item.guildId}\`)\n**Command**: \`${item.command}\`\n**Suspicious**: ${item.suspicious}\n**Alert ID**: \`${item.Id}\``).join('\n\n')
        const embed = new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Results`)
            .setDescription(info)
        commandEmbeds.push(embed)
    }
    return commandEmbeds
}

async function createCommandPagesById(id) {
    const commandEmbeds = []
    let k = 6
    for (let i = 0; i < id.length; i += 6) {
        const current = id.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `**User**: <@${item.userId}> (\`${item.userId}\`)\n**Guild**: ${item.guildName} (\`${item.guildId}\`)\n**Command**: \`${item.command}\`\n**Suspicious**: ${item.suspicious}\n**Command Info**: ${item.commandInfo}\n\**Command Run**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: <t:${Math.round(item.expires.getTime() / 1000)}:R>\n**Alert ID**: \`${item.Id}\``).join('\n\n')
        const embed = new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Results`)
            .setDescription(info)
        commandEmbeds.push(embed)
    }
    return commandEmbeds
}

async function createNewNotif(userId, notification) {
    let password = [];
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let passString
    let passWordLength = 7
    for (let i = 0; i < passWordLength; i++) {
        password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }
    passString = password.join('')
    notificationSchema.create({
        userId: userId,
        notification: notification,
        Id: 'N-' + passString
    })
}

async function createNotifsPagesSmall(notifications) {
    const notifEmbeds = []
    let k = 6
    for (let i = 0; i < notifications.length; i += 6) {
        const current = notifications.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `**Notification**: ${item.notification.slice(0, 30)}\n**Notification ID**: \`${item.Id}\``).join('\n\n')
        const embed = new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Notifications`)
            .setDescription(info)
            .setFooter({
                text: `Do /notifications show:<id> to see more info on a notification`
            })
        notifEmbeds.push(embed)
    }
    return notifEmbeds
}

async function createNotifsPagesLarge(notifications) {
    const notifEmbeds = []
    let k = 6
    for (let i = 0; i < notifications.length; i += 6) {
        const current = notifications.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `**Notification**: ${item.notification}\n**Sent At**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Notification ID**: \`${item.Id}\``).join('\n\n')
        const embed = new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Notifications`)
            .setDescription(info)
        notifEmbeds.push(embed)
    }
    return notifEmbeds
}

async function checkPremiumUser(userId) {
    const check = await premiumUsers.findOne({
        userId: userId
    })
    if (check) return true
}

async function checkPremiumGuild(guildId) {
    const check = await premiumGuilds.findOne({
        guildId: guildId
    })
    if (check) return true
}

async function createPremiumUser(userId, expiresInMinutes) {
    const check = await premiumUsers.findOne({
        userId: userId
    })
    const date = new Date()
    date.setMinutes(date.getMinutes() + expiresInMinutes)
    if (check) {
        check.delete()
        return await premiumUsers.create({
            userId: userId,
            expires: expiresInMinutes
        })
    }
    await premiumUsers.create({
        userId: userId,
        expires: expiresInMinutes
    })
}

async function createPremiumGuild(guildId, expiresInMinutes) {
    const check = await premiumGuilds.findOne({
        guildId: guildId
    })
    const date = new Date()
    date.setMinutes(date.getMinutes() + expiresInMinutes)
    if (check) {
        check.delete()
        return await premiumGuilds.create({
            guildId: guildId,
            expires: expiresInMinutes
        })
    }
    await premiumGuilds.create({
        guildId: userId,
        expires: expiresInMinutes
    })
}

async function genPremiumCode(amount, plan, type) {
    let codes = []

    for (var i = 0; i < amount; i++) {
        const codePremium = voucher_codes.generate({
            pattern: "#####-#####-#####-#####",
        });

        const code = codePremium.toString().toUpperCase();

        const find = await premiumCodeSchema.findOne({
            code: code,
        });

        if (!find) {
            premiumCodeSchema.create({
                code: code,
                plan: plan,
                type: type
            });

            codes.push(`${i + 1}- ${code}`);
        }
    }

    return codes
}

async function genInventoryPages(inventory) {
    const invEmbeds = []
    let k = 7
    for (let i = 0; i < inventory.length; i += 7) {
        const current = inventory.slice(i, k)
        let j = i
        k += 7
        let info = ``
        info = current.map(item => `${item.emoji} **${item.item}** (\`${item.amount.toLocaleString()}\`)\n**ID**: \`${item.itemId}\``).join('\n\n')
        const embed = new MessageEmbed()
            .setColor('0xa744f2')
            .setTitle(`Inventory`)
            .setDescription(info)
        invEmbeds.push(embed)
    }
    return invEmbeds
}


module.exports = {
    blacklistCheck,
    cooldownCheck,
    createRecentCommand,
    createCommandPages,
    createCommandPagesById,
    cooldownRobCheck,
    createNewNotif,
    createNotifsPagesSmall,
    createNotifsPagesLarge,
    checkMaintinance,
    createPremiumGuild,
    createPremiumUser,
    checkPremiumGuild,
    checkPremiumUser,
    genPremiumCode,
    genInventoryPages,
}