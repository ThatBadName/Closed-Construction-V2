const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dig')
    .setDMPermission(false)
    .setDescription('Go dig in the ground for coins'),

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'dig', 8, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'dig', `None`, interaction)

        const command = require('../../things/commandCode/Earth/digEarth')
        command.digOnEarth(interaction)
    }
}