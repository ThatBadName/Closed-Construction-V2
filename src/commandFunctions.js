const blacklistedUsers = require('./models/blacklistUser')
const blacklistedGuilds = require('./models/blacklistGuild')
const commandCooldowns = require('./models/cooldowns')
const profileSchema = require('./models/userProfile')
const recentCommandSchema = require('./models/recentCommands')
const robCooldowns = require('./models/robCooldowns')
const notificationSchema = require('./models/notifications')
const maintenance = require('./models/mantenance')
const premiumUsers = require('./models/premiumUsers')
const premiumGuilds = require('./models/premiumGuilds')
const voucher_codes = require('voucher-code-generator')
const premiumCodeSchema = require('./models/premiumCodes')
const activeDevCoinSchema = require('./models/activeDevCoins')
const {
    EmbedBuilder,
    WebhookClient
} = require('discord.js')

async function blacklistCheck(idUser, idGuild, interaction) {
    const blacklistCheckUser = await blacklistedUsers.findOne({
        userId: idUser
    })
    const blacklistCheckGuild = await blacklistedGuilds.findOne({
        guildId: idGuild
    })
    if (blacklistCheckUser) return interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('You are blacklisted from using the bot.').setDescription('Appeal in the [support server](https://discord.gg/hK3gEQ2XUf)').setFields({
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
        }).setFooter({text: `Case ID: ${blacklistCheckUser.id}`})]
    }).then(e => {
        return true
    })
    if (blacklistCheckGuild) return interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle('This server has been blacklisted from using the bot.').setDescription('If you are the server owner you can appeal in the [support server](https://discord.gg/hK3gEQ2XUf)').setFields({
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
        }).setFooter({text: `Case ID: ${blacklistCheckGuild.id}`})]
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
    const userProfileAdmin = await profileSchema.findOne({
        userId: interaction.user.id,
        botAdmin: true
    })
    if (userProfileDev || userProfileAdmin) return
    if (checkMain) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Maintenance Mode Is Currently Active`)
                .setColor('0xa744f2')
                .setDescription(`**Reason for maintenance**:\n\`\`\`fix\n${checkMain.maintenanceReason}\n\`\`\``)
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
                new EmbedBuilder()
                .setTitle('Slow it down!')
                .setURL('https://www.youtube.com/watch?v=fkkNfCkupxM')
                .setDescription(`You can use this command again <t:${Math.round(checkForCooldowns.expires.getTime() / 1000)}:R>`)
                .setColor('0xff0000')
            ],
            ephemeral: true
        })
        return true
    }
    const result = await activeDevCoinSchema.findOne({userId: userID})
    const date = new Date()
    if (result && interaction.commandName !== 'daily' && interaction.commandName !== 'weekly' && interaction.commandName !== 'monthly' && interaction.commandName !== 'trade' && interaction.commandName !== 'report') {
        date.setSeconds(date.getSeconds() + Math.round(timeout / 2))
        commandCooldowns.create({
            userId: userID,
            command: command,
            expires: date
        })
    } else {
        date.setSeconds(date.getSeconds() + timeout)
        commandCooldowns.create({
            userId: userID,
            command: command,
            expires: date
        })
    }
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
                new EmbedBuilder()
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
    await robCooldowns.create({
        userId: userID,
        userRobbedId: userRobbedId,
        expires: date
    })
}

async function createRecentCommand(userId, command, commandInfo, interaction, sus, staff) {
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
    const expiresStaff = new Date()
    expiresStaff.setMonth(expiresStaff.getMonth() + 1)
    const webhookSus = new WebhookClient({url: "https://discord.com/api/webhooks/996501433648169081/jqOyQ0awRJMWrZHyxyLGE_sFan7Pe5V2WhOlr7KadqYY-HQULOMmiScZUugnyvYb5uwh"})
    const webhookStaff = new WebhookClient({url: "https://discord.com/api/webhooks/996503382221131836/koerD962bqjB-sMDH7j_7ZZf_tkQlnAyJ_Hb9u5kIV3OQixsUW02I9sJh3q5XHQvI2CG"})
    if (!sus && !staff) {
        recentCommandSchema.create({
            userId: userId,
            command: command,
            commandInfo: commandInfo,
            expires: expires,
            Id: 'A-' + passString,
            guildName: interaction.guild.name,
            guildId: interaction.guild.id
        }).catch(() => {})
    }
    else if (sus === true && !staff) {
        recentCommandSchema.create({
            userId: userId,
            command: command,
            commandInfo: commandInfo,
            expires: expires,
            Id: 'A-' + passString,
            guildName: interaction.guild.name,
            guildId: interaction.guild.id,
            suspicious: true
        }).catch(() => {})
        webhookSus.send({
            content: `<@&996502735031640094>,`,
            username: 'Closed Public',
            avatarURL: "https://cdn.discordapp.com/attachments/995132759309811742/1002989256035270696/closed_public_glow_no_text.png",
            embeds: [
                new EmbedBuilder()
                .setTitle(`Command: ${command}`)
                .setColor('0xa477fc')
                .setFields({
                    name: 'User',
                    value: `<@${userId}> (\`${userId}\`)`,
                    inline: true
                }, {
                    name: 'Command',
                    value: `Command Name: \`${command}\`\nCommand Info: \`${commandInfo}\``
                }, {
                    name: 'Guild',
                    value: `Guild Name: \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\``
                }, {
                    name: 'Alert ID',
                    value: `\`A-${passString}\``
                })
            ]
        })
    }
    else if (staff === true && sus === false) {
        recentCommandSchema.create({
            userId: userId,
            command: command,
            commandInfo: commandInfo,
            expires: expiresStaff,
            Id: 'A-' + passString,
            guildName: interaction.guild.name,
            guildId: interaction.guild.id,
            staffCommand: true
        }).catch(() => {})
        webhookStaff.send({
            content: `<@&996502846553993367>,`,
            username: 'Closed Public',
            avatarURL: "https://cdn.discordapp.com/attachments/995132759309811742/1002989256035270696/closed_public_glow_no_text.png",
            embeds: [
                new EmbedBuilder()
                .setTitle(`Command: ${command}`)
                .setColor('0xa477fc')
                .setFields({
                    name: 'User',
                    value: `<@${userId}> (\`${userId}\`)`,
                    inline: true
                }, {
                    name: 'Command',
                    value: `Command Name: \`${command}\`\nCommand Info: \`${commandInfo}\``
                }, {
                    name: 'Guild',
                    value: `Guild Name: \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\``
                }, {
                    name: 'Alert ID',
                    value: `\`A-${passString}\``
                })
            ]
        })
    }
    else if (sus === true && staff === true) {
        recentCommandSchema.create({
            userId: userId,
            command: command,
            commandInfo: commandInfo,
            expires: expiresStaff,
            Id: 'A-' + passString,
            guildName: interaction.guild.name,
            guildId: interaction.guild.id,
            suspicious: true,
            staffCommand: true
        }).catch(() => {})
        webhookSus.send({
            content: `<@&996502735031640094>,`,
            username: 'Closed Public',
            avatarURL: "https://cdn.discordapp.com/attachments/995132759309811742/1002989256035270696/closed_public_glow_no_text.png",
            embeds: [
                new EmbedBuilder()
                .setTitle(`Command: ${command}`)
                .setColor('0xa477fc')
                .setFields({
                    name: 'User',
                    value: `<@${userId}> (\`${userId}\`)`,
                    inline: true
                }, {
                    name: 'Command',
                    value: `Command Name: \`${command}\`\nCommand Info: \`${commandInfo}\``
                }, {
                    name: 'Guild',
                    value: `Guild Name: \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\``
                }, {
                    name: 'Alert ID',
                    value: `\`A-${passString}\``
                })
            ]
        })
        webhookStaff.send({
            content: `<@&996502846553993367>,`,
            username: 'Closed Public',
            avatarURL: "https://cdn.discordapp.com/attachments/995132759309811742/1002989256035270696/closed_public_glow_no_text.png",
            embeds: [
                new EmbedBuilder()
                .setTitle(`Command: ${command}`)
                .setColor('0xa477fc')
                .setFields({
                    name: 'User',
                    value: `<@${userId}> (\`${userId}\`)`,
                    inline: true
                }, {
                    name: 'Command',
                    value: `Command Name: \`${command}\`\nCommand Info: \`${commandInfo}\``
                }, {
                    name: 'Guild',
                    value: `Guild Name: \`${interaction.guild.name}\`\nGuild ID: \`${interaction.guild.id}\``
                }, {
                    name: 'Alert ID',
                    value: `\`A-${passString}\``
                })
            ]
        })
    }

}

async function createCommandPages(commands) {
    const commandEmbeds = []
    let k = 6
    for (let i = 0; i < commands.length; i += 6) {
        const current = commands.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `**User**: <@${item.userId}> (\`${item.userId}\`)\n**Guild**: ${item.guildName} (\`${item.guildId}\`)\n**Command**: \`${item.command}\`\n**Suspicious**: ${item.suspicious === false ? 'No' : 'Yes'}\n**Alert ID**: \`${item.Id}\``).join('\n\n')
        const embed = new EmbedBuilder()
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
        info = current.map(item => `**User**: <@${item.userId}> (\`${item.userId}\`)\n**Guild**: ${item.guildName} (\`${item.guildId}\`)\n**Command**: \`${item.command}\`\n**Suspicious**: ${item.suspicious === false ? 'No' : 'Yes'}\n**Staff Command**: ${item.staffCommand === false ? 'No' : 'Yes'}\n**Command Info**: ${item.commandInfo}\n\**Command Run**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n**Expires**: <t:${Math.round(item.expires.getTime() / 1000)}:R>\n**Alert ID**: \`${item.Id}\``).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Results`)
            .setDescription(info)
        commandEmbeds.push(embed)
    }
    return commandEmbeds
}

async function createStaffPages(staff) {
    const staffEmbeds = []
    let k = 6
    for (let i = 0; i < staff.length; i += 6) {
        const current = staff.slice(i, k)
        let j = i
        k += 6
        let info = ``
        info = current.map(item => `> ${item.developer === true ? '[Developer]' : `${item.botAdmin === true ? '[Bot Admin]' : `${item.botModerator === true ? '[Bot Moderator]' : '[Regular]'}`}`} <@${item.userId}> (\`${item.userId}\`)\n> **About Me**: ${item.bio}`).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Bot Staff`)
            .setDescription(info)
        staffEmbeds.push(embed)
    }
    return staffEmbeds
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

    await profileSchema.findOneAndUpdate({
        userId: userId,
    }, {
        hasUnreadNotif: true
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
        info = current.map(item => `**Notification**: ${item.notification.slice(0, 50)}\n**Notification ID**: \`${item.Id}\``).join('\n\n')
        const embed = new EmbedBuilder()
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
        const embed = new EmbedBuilder()
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

async function genPremiumCode(creatorId, amount, plan, type) {
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
                creatorId: creatorId,
                code: code,
                plan: plan,
                type: type
            });

            codes.push(`${code}`);
        }
    }

    return codes
}

async function genCodePages(codes) {
    const codeEmbeds = []
    let k = 5
    for (let i = 0; i < codes.length; i += 5) {
        const current = codes.slice(i, k)
        let j = i
        k += 5
        let info = ``
        info = current.map(item => `**Code**: \`${item.code}\`\n**Plan**: \`${item.plan}\`\n**Type**: \`${item.type}\``).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Your codes`)
            .setDescription(info)
            codeEmbeds.push(embed)
    }
    return codeEmbeds
}

async function genCodePagesStaff(codes) {
    const codeEmbeds = []
    let k = 5
    for (let i = 0; i < codes.length; i += 5) {
        const current = codes.slice(i, k)
        let j = i
        k += 5
        let info = ``
        info = current.map(item => `**Code**: \`${item.code}\`\n**User**: <@${item.creatorId}> (\`${item.creatorId}\`)\n**Plan**: \`${item.plan}\`\n**Type**: \`${item.type}\``).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Code List`)
            .setDescription(info)
            codeEmbeds.push(embed)
    }
    return codeEmbeds
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
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Inventory`)
            .setDescription(info)
        invEmbeds.push(embed)
    }
    return invEmbeds
}

async function genReportPages(reports) {
    const reportEmbeds = []
    let k = 7
    for (let i = 0; i < reports.length; i += 7) {
        const current = reports.slice(i, k)
        let j = i
        k += 7
        let info = ``
        info = current.map(item => `**ID**: \`${item.reportId}\`\n**Status**: \`${item.status}\`\n**Created**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)`).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Your Reports`)
            .setDescription(info)
        reportEmbeds.push(embed)
    }
    return reportEmbeds
}

async function genStaffReportPages(searchReports) {
    const reportEmbeds = []
    let k = 4
    for (let i = 0; i < searchReports.length; i += 4) {
        const current = searchReports.slice(i, k)
        let j = i
        k += 4
        let info = ``
        info = current.map(item => `**ID**: \`${item.reportId}\`\n**Type**: \`${item.type}\`\n**Status**: \`${item.status}\`\n**Reporter ID**: \`${item.reporterId}\`\n**Suspect ID**: \`${item.suspectId || 'None'}\`\n**Created**: <t:${Math.round(item.createdAt.getTime() / 1000)}> (<t:${Math.round(item.createdAt.getTime() / 1000)}:R>)\n[**Report Message**](${item.messageUrl})`).join('\n\n')
        const embed = new EmbedBuilder()
            .setColor('0xa744f2')
            .setTitle(`Report List`)
            .setDescription(info)
        reportEmbeds.push(embed)
    }
    return reportEmbeds
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
    createStaffPages,
    genReportPages,
    genStaffReportPages,
    genCodePages,
    genCodePagesStaff
}