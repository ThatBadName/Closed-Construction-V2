const blockSchema = require('../models/blockedUsers')
const maintenance = require('../models/mantenance')
const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')
const functions = require('../checks/functions')

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

module.exports = (client) => {
        client.on('interactionCreate', async (interaction) => {
            const checkMain = await maintenance.findOne({
                maintenance: true
            })
            if (checkMain) return
            const checkBlUs = await blacklistedUsers.findOne({
                userId: interaction.user.id
            })
            if (checkBlUs) return

            if (!interaction.isModalSubmit) return
            let ctmId = interaction.customId
            let userFromId = interaction.customId
            try {
                userFromId = userFromId.slice(11, 29)
            } catch {}
            try {
                ctmId = ctmId.slice(0, 10)
            } catch {}
            if (ctmId !== 'text-modal') return
            const userRecieveId = userFromId

            const result = await blockSchema.findOne({
                blockedById: interaction.user.id,
                blockedUserId: userRecieveId
            })
            if (result) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You cannot text this user!')
                    .setDescription(`You have blocked <@${userRecieveId}>`)
                    .setColor('0xff3d15')
                ]
            })
            const result2 = await blockSchema.findOne({
                blockedUserId: interaction.user.id,
                blockedById: userRecieveId
            })
            if (result2) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('You cannot text this user!')
                    .setDescription(`<@${userRecieveId}> has blocked you`)
                    .setColor('0xff3d15')
                ]
            })

            const member = await client.users.fetch(userRecieveId).catch(e => null)
            if (!member) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Cannot text this user')
                    .setDescription('I could not find this user')
                    .setColor('0xff3d15')
                ]
            })

            const textMessage = interaction.fields.getTextInputValue('text-message')
            functions.createRecentCommand(interaction.user.id, 'text-create', `USER: <@${userRecieveId}> | CONTENT: ${textMessage}`, interaction)
            functions.createNewNotif(userRecieveId, `You have recieved a text from ${interaction.user}`)

            const textControls = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(`reply-${interaction.user.id}`)
                    .setLabel(`Reply to ${interaction.user.username}`)
                    .setStyle('PRIMARY'),

                    new MessageButton()
                    .setCustomId(`block-${interaction.user.id}`)
                    .setLabel(`Block ${interaction.user.username}`)
                    .setStyle('DANGER'),
                )

            const textEmbed = new MessageEmbed()
                .setTitle('You have recieved a text!')
                .setDescription(`${interaction.user} (\`${interaction.user.id}\`) has sent you a message:\n${textMessage}`)
                .setColor('0x545dff')
                .setTimestamp()
                .setFooter({
                    text: `You can disable texting in the settings menu`
                })

            const textConfirmEmbed = new MessageEmbed()
                .setTitle('You sent a text!')
                .setDescription(`You sent a text to ${member}. Message:\n${textMessage}`)
                .setColor('0x4ffc05')

            const textFailedEmbed = new MessageEmbed()
                .setTitle('Failed to send text')
                .setDescription(`${member} does not have their DMs enabled`)
                .setColor('0xff3d15')

            let failed = false

            await member.send({
                embeds: [textEmbed],
                components: [textControls]
            }).catch(e => {
                failed = true
                return interaction.reply({
                    embeds: [textFailedEmbed]
                })
            })

            if (failed === false) interaction.reply({
                embeds: [textConfirmEmbed]
            })
        })
    },

    module.exports.config = {
        dbName: 'CREATE TEXT',
        displayName: 'Create Text',
    }