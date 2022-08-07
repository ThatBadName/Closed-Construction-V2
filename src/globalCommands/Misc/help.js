const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDMPermission(false)
    .setDescription('Need some help?'),
        
    async execute(interaction, client) {
        let economyCommandStr = []
        const economyCommandFiles = fs.readdirSync('./src/globalCommands/Economy/').filter(file => file.endsWith('js'))
        for (const file of economyCommandFiles) {
            const command = require(`../Economy/${file}`)
            economyCommandStr.push(`\`${command.data.name}\``)
        }

        let contextCommandStr = []
        const contextCommandFiles = fs.readdirSync('./src/globalCommands/ContextMenu/').filter(file => file.endsWith('js'))
        for (const file of contextCommandFiles) {
            const command = require(`../ContextMenu/${file}`)
            contextCommandStr.push(`\`${command.data.name}\``)
        }

        let miscCommandStr = []
        const miscCommandFiles = fs.readdirSync('./src/globalCommands/Misc/').filter(file => file.endsWith('js'))
        for (const file of miscCommandFiles) {
            const command = require(`../Misc/${file}`)
            miscCommandStr.push(`\`${command.data.name}\``)
        }
    

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Command List')
                .setColor('0xa477fc')
                .setFields({
                    name: 'Economy Commands',
                    value: `${economyCommandStr.join(', ')}`,
                    inline: false
                }, {
                    name: 'Context Commands',
                    value: `${contextCommandStr.join(', ')}`,
                    inline: false
                }, {
                    name: 'Misc Commands',
                    value: `${miscCommandStr.join(', ')}`,
                    inline: false
                })
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Invite Me!')
                    .setStyle('Link')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=994644001397428335&permissions=412921220161&scope=bot%20applications.commands'),

                    new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle('Link')
                    .setURL('https://discord.gg/9jFqS5H43Q'),

                    new ButtonBuilder()
                    .setLabel('Docs')
                    .setStyle('Link')
                    .setURL('https://thatbadname.gitbook.io/closed-construction/'),
                )
            ]
        })
    }
}