const maintenance = require('../models/mantenance')
const {
    MessageEmbed
} = require('discord.js')

module.exports = {
    name: 'maintenance',
    aliases: [''],
    description: 'Set the maintenance mode',
    category: 'Dev',
    slash: true,
    ownerOnly: true,
    guildOnly: true,
    testOnly: true,
    options: [{
        name: 'reason',
        description: 'Set the reason for maintenance',
        type: 'STRING',
        required: false
    }],

    callback: async ({
        interaction
    }) => {
        const check = await maintenance.findOne()
        if (check) {
            check.delete()
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Disabled maintenance mode')
                    .setColor('0xa744f2')
                ]
            })
        } else {
            maintenance.create({
                maintenance: true,
                maintenanceReason: interaction.options.getString('reason') || 'No reason provided'
            })
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Enabled maintenance mode')
                    .setDescription(`Reason: \`\`\`fix\n${interaction.options.getString('reason') || 'No reason provided'}\n\`\`\``)
                    .setColor('0xa744f2')
                ]
            })
        }
    }
}