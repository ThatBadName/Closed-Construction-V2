const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Do something for coins')
    .setDMPermission(false)
    .addSubcommand(option =>
        option.setName('fish')
        .setDescription('Fish in a river')    
    )
    .addSubcommand(option =>
        option.setName('dig')
        .setDescription('Dig in the ground')    
    )
    .addSubcommand(option =>
        option.setName('mine')
        .setDescription('Mine in the caves')    
    )
    .addSubcommand(option =>
        option.setName('forage')
        .setDescription('Forage in the woods')    
    )
    .addSubcommand(option =>
        option.setName('hunt')
        .setDescription('Hunt in the woods')    
    )
    .addSubcommand(option =>
        option.setName('beg')
        .setDescription('Beg on the streets')    
    ),

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return

        const cldn = await functions.cooldownCheck(interaction.user.id, interaction.options.getSubcommand(), 8, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, interaction.options.getSubcommand(), `None`, interaction)

        if (interaction.options.getSubcommand() === 'fish') {
            const command = require('../../things/commandCode/Earth/fishEarth')
            command.fishOnEarth(interaction)

        } else if (interaction.options.getSubcommand() === 'dig') {
            const command = require('../../things/commandCode/Earth/digEarth')
            command.digOnEarth(interaction)

        } else if (interaction.options.getSubcommand() === 'mine') {
            const command = require('../../things/commandCode/Earth/mineEarth')
            command.mineOnEarth(interaction)

        } else if (interaction.options.getSubcommand() === 'beg') {
            const command = require('../../things/commandCode/Earth/begEarth')
            command.begOnEarth(interaction)

        } else if (interaction.options.getSubcommand() === 'forage') {
            const command = require('../../things/commandCode/Earth/forageEarth')
            command.forageOnEarth(interaction)

        } else if (interaction.options.getSubcommand() === 'hunt') {
            const command = require('../../things/commandCode/Earth/huntEarth')
            command.huntOnEarth(interaction)

        }
    }
    
}