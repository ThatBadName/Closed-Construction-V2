const { MessageEmbed } = require('discord.js')
const profileSchema = require('../models/userProfile')

module.exports = (client) => {
    client.on('guildMemberUpdate', async(oldMember, newMember) => {
        if (oldMember.guild.id !== '994642021425877112') return
 
        const oldRoles1 = oldMember.roles.cache, newRoles1 = newMember.roles.cache
        const oldHas1 = oldRoles1.has('997240519027605654'), newHas1 = newRoles1.has('997240519027605654')
        if (!oldHas1 && newHas1) {
            const userProfile = await profileSchema.findOne({userId: newMember.id})
            if (!userProfile) return

            userProfile.wallet += 5000
            userProfile.save()

            newMember.send({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Thanks for voting!')
                    .setDescription(`Thanks for voting for ${client.user.username}. You have been given \`5,000\` coins`)
                    .setFooter({text: 'You only get this reward if you are in the support server'})
                    .setColor('0xa477fc')
                ]
            }).catch(() => {}) 
        }
             
    })
}

module.exports.config = {
    dbName: 'VOTE REWARDS',
    displayName: 'Vote Rewards',
 }