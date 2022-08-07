const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js')
const blockSchema = require('../../models/blockedUsers')

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('unblock-user')
    .setDMPermission(false)
    .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'unblock', 3, interaction)
        if (cldn === true) return

        const user = interaction.targetUser
            const check = await blockSchema.findOne({
                blockedUserId: user.id,
                blockedById: interaction.user.id
            })
            if (!check) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Couldn\'t unblock user.')
                    .setDescription(`${user} is not blocked`)
                    .setColor('0xa477fc')
                ]
            })
            check.delete()
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Unblocked user.')
                    .setDescription(`${user} has been unblocked`)
                    .setColor('0xa477fc')
                ]
            })
    }
}