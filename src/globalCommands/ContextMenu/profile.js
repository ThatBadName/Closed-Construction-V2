const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('view-profile')
    .setDMPermission(false)
    .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'profile', 3, interaction)
        if (cldn === true) return

        const message = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Please wait')
                .setColor('0xa477fc')
                .setDescription('The bot is proccessing your request. Please be patient')
            ],
            fetchReply: true
        })

        const userToView = interaction.targetUser
            const profile = await profileSchema.findOne({
                userId: userToView.id
            })
            if (!profile) {
                const noProfileEmbed = new EmbedBuilder()
                    .setColor('0xa744f2')
                    .setThumbnail(userToView.displayAvatarURL({
                        dynamic: true,
                        size: 1024
                    }))
                    .setTitle(`${userToView.username}'s profile`)
                    .setDescription(`This user has no profile`)

                message.edit({
                    embeds: [noProfileEmbed]
                })
                return
            }

            var invArray = profile.badges.map(x => x._id)
            var invItems = createBadges(invArray).join(' ')
            const profileEmbed = new EmbedBuilder()
                .setColor('0xa744f2')
                .setThumbnail(userToView.displayAvatarURL({
                    dynamic: true,
                    size: 1024
                }))
                .setTitle(`${userToView.username}'s profile`)
                .setDescription(`**Bio:** ${profile.bio}\n**Badges:** ${invItems.length === 0 ? 'None' : invItems}\n**Rank**: ${profile.developer === true ? '<:DeveloperBadge:1006817283550761051> Developer' : `${profile.botAdmin === true ? '<:AdminBadge:1006817282061762570> Bot Admin' : `${profile.botModerator === true ? '<:ModeratorBadge:1006817284846792765> Bot Moderator' : 'Regular'}`}`}\n${profile.job !== '' ? `Works as a \`${profile.job}\`\n` : ''}**Commands Run**: ${profile.commandsRun}`)
                .setFields({
                    name: 'Level',
                    value: `Bot Level: \`${profile.level}\`\nPlanet Level: \`${profile.planetLevel}\``,
                    inline: true
                }, {
                    name: 'XP',
                    value: `Bot XP: \`${profile.xp}/${profile.requiredXp}\` (\`${Math.round(profile.xp / profile.requiredXp * 100)}%\`)\nPlanet XP: \`${profile.planetXp}/${profile.requiredPlanetXp}\` (\`${Math.round(profile.planetXp / profile.requiredPlanetXp * 100)}%\`)`,
                    inline: true
                }, {
                    name: 'Numbers',
                    value: `Wallet: \`${profile.wallet.toLocaleString()}\`\nBank: \`${profile.bank.toLocaleString()}/${profile.maxBank.toLocaleString()}\` (\`${Math.round(profile.bank / profile.maxBank * 100)}%\`)\nMultiplier: \`${profile.coinMulti.toLocaleString()}%\`\nXP Boost: \`${profile.xpBoost.toLocaleString()}%\`\nCurrent Planet: \`${profile.currentPlanet}\``,
                    inline: true
                })

            message.edit({
                embeds: [profileEmbed]
            })

            function createBadges(array) {
                let numCount = []
                for (var i = 0; i < array.length; i++) {
                    if (profile.badges.find(badge => badge._id === array[i])) {
                        profile.badges.find(badgeName => {
                            let count = parseInt(badgeName.count)
                            if (badgeName._id === array[i]) {
                                numCount.push(count)
                            }
                        })
                    }
                    continue
                }

                let badgeInv = []
                for (var x = 0; x < array.length; x++) {
                    badgeInv.push(`${array[x]}`)
                }

                return badgeInv
            }
    }
}