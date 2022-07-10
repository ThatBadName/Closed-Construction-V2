const blockSchema = require('../models/blockedUsers')
const {
   MessageEmbed,
   Modal,
   TextInputComponent,
   MessageActionRow
} = require('discord.js')
const maintenance = require('../models/mantenance')
const blacklistedUsers = require('../models/blacklistUser')
const blacklistedGuilds = require('../models/blacklistGuild')
const functions = require('../checks/functions')

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

         if (!interaction.isButton()) return
         if (interaction.customId.startsWith('block-')) {
            const customId = interaction.customId
            let blockId = customId.replace('block-', '')
            const check = await blockSchema.findOne({
               blockedUserId: blockId,
               blockedById: interaction.user.id
            })
            if (check) return interaction.reply({
               embeds: [
                  new MessageEmbed()
                  .setTitle('Couldn\'t block user.')
                  .setDescription(`<@${blockId}> is already blocked`)
                  .setColor('0xff3d15')
               ]
            })
            await blockSchema.create({
               blockedUserId: blockId,
               blockedById: interaction.user.id
            })
            functions.createRecentCommand(interaction.user.id, 'text-block', `USER: <@${blockId}>`, interaction)
            interaction.reply({
               embeds: [
                  new MessageEmbed()
                  .setTitle('User blocked')
                  .setDescription(`<@${blockId}> has been blocked`)
                  .setColor('0xff3d15')
               ]
            })
            const user = await client.users.fetch(blockId).catch(e => null)
            if (!user) return
            user.send({
               embeds: [
                  new MessageEmbed()
                  .setColor('0xff3d15')
                  .setTitle(`You can no longer text ${interaction.user.tag}`)
                  .setDescription(`You have been blocked by ${interaction.user}`)
                  .setFooter({
                     text: `Please Note: I will not DM you if you are unblocked`
                  })
               ]
            }).catch(err => {})


         } else if (interaction.customId.startsWith('reply-')) {
            const customId = interaction.customId
            let replyId = customId.replace('reply-', '')
            const user = await client.users.fetch(replyId).catch(e => null)
            if (!user) return interaction.reply({
               embeds: [
                  new MessageEmbed()
                  .setTitle('Cannot text this user')
                  .setDescription('I could not find this user')
                  .setColor('0xff3d15')
               ]
            })

            const result = await blockSchema.findOne({
               blockedById: interaction.user.id,
               blockedUserId: replyId
            })
            if (result) return interaction.reply({
               embeds: [
                  new MessageEmbed()
                  .setTitle('You cannot text this user!')
                  .setDescription(`You have blocked <@${replyId}>`)
                  .setColor('0xff3d15')
               ]
            })
            const result2 = await blockSchema.findOne({
               blockedUserId: interaction.user.id,
               blockedById: replyId
            })
            if (result2) return interaction.reply({
               embeds: [
                  new MessageEmbed()
                  .setTitle('You cannot text this user!')
                  .setDescription(`<@${replyId}> has blocked you`)
                  .setColor('0xff3d15')
               ]
            })

            let firstText

            let messageModal = new Modal()
               .setTitle(`Texting ${user.tag}`)
               .setCustomId(`reply-text-modal-${replyId}`)

            const text_message_modal = new TextInputComponent()
               .setMaxLength(150)
               .setCustomId(`text-message`)
               .setLabel('Message')
               .setRequired(true)
               .setPlaceholder(`Hi ${user.username}!`)
               .setStyle('PARAGRAPH')

            firstText = new MessageActionRow().addComponents(text_message_modal)
            messageModal.addComponents(firstText)

            await interaction.showModal(messageModal)
         }
      })
   },

   module.exports.config = {
      dbName: 'TEXT BUTTONS',
      displayName: 'Text Buttons',
   }