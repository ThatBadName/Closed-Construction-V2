const {
    MessageEmbed,
    MessageActionRow,
    Modal,
    TextInputComponent
} = require('discord.js')
const profileSchema = require('../models/userProfile')
const blockSchema = require('../models/blockedUsers')

module.exports = {
    name: 'text',
    aliases: [''],
    description: 'Text a user',
    category: 'Fun',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
        name: 'user',
        description: 'Who do you wanna text?',
        type: 'USER',
        required: true
    }, ],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'text', 5, interaction)
        if (cldn === true) return


        const userRecieve = interaction.options.getUser('user')
        const userSend = interaction.user
        functions.createRecentCommand(interaction.user.id, 'text', `USER: ${userRecieve}`, interaction)

        const block1 = await blockSchema.findOne({
            blockedById: interaction.user.id,
            blockedUserId: userRecieve.id
        })
        const block2 = await blockSchema.findOne({
            blockedUserId: interaction.user.id,
            blockedById: userRecieve.id
        })

        if (block1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You cannot text this user!')
                .setDescription(`You have blocked ${userRecieve}`)
                .setColor('0xff3d15')
            ]
        })

        if (block2) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You cannot text this user!')
                .setDescription(`${userRecieve} has blocked you`)
                .setColor('0xff3d15')
            ]
        })

        if (userRecieve.id === userSend.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You cannot send a message to yourself')
                .setColor('0xff3d15')
            ]
        })

        const checkTextEnabledR = await profileSchema.findOne({
            userId: userRecieve,
            texting: false
        })
        const checkTextEnabledS = await profileSchema.findOne({
            userId: userSend,
            texting: false
        })

        if (checkTextEnabledR) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You cannot text this user!')
                .setDescription(`${userRecieve} has disabled texts`)
                .setColor('0xff3d15')
            ]
        })

        if (checkTextEnabledS) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('You cannot text this user!')
                .setDescription(`You have disabled your texts`)
                .setColor('0xff3d15')
            ]
        })

        let firstText

        let messageModal = new Modal()
            .setTitle(`Texting ${userRecieve.tag}`)
            .setCustomId(`text-modal-${userRecieve.id}-${interaction.guild.id}`)

        const text_message_modal = new TextInputComponent()
            .setMaxLength(150)
            .setCustomId(`text-message`)
            .setLabel('Message')
            .setRequired(true)
            .setPlaceholder(`Hi ${userRecieve.username}! How are you?`)
            .setStyle('PARAGRAPH')

        firstText = new MessageActionRow().addComponents(text_message_modal)
        messageModal.addComponents(firstText)

        await interaction.showModal(messageModal)
    }
}