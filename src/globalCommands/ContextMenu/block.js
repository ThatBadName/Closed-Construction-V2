const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js')
const blockSchema = require('../../models/blockedUsers')

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('block-user')
    .setDMPermission(false)
    .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'block', 3, interaction)
        if (cldn === true) return

        const user = interaction.targetUser
            if (user.id === interaction.user.id) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can\'t block yourself')
                    .setColor('0xa477fc')
                ]
            })
            const check = await blockSchema.findOne({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            if (check) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Couldn\'t block user.')
                    .setDescription(`${user} is already blocked`)
                    .setColor('0xa477fc')
                ]
            })
            blockSchema.create({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('User blocked')
                    .setDescription(`${user} has been blocked`)
                    .setColor('0xa477fc')
                ]
            })
    }
}