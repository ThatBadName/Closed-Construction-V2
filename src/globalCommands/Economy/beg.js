const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('beg')
    .setDMPermission(false)
    .setDescription('Beg for coins'),

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'beg', 8, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'beg', `None`, interaction)

        const command = require('../../things/commandCode/Earth/begEarth')
        command.begOnEarth(interaction)
    }
}