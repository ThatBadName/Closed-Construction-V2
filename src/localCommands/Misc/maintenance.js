const maintenance = require('../../models/mantenance')
const {
    EmbedBuilder,
    SlashCommandBuilder
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDMPermission(false)
    .setDescription('Set the maintenance mode')
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Set the reason')
        .setRequired(false)
        .setMaxLength(300)    
    ),

    async execute(
        interaction
    ) {
        const check = await maintenance.findOne()
        if (check) {
            check.delete()
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
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
                    new EmbedBuilder()
                    .setTitle('Enabled maintenance mode')
                    .setDescription(`Reason: \`\`\`fix\n${interaction.options.getString('reason') || 'No reason provided'}\n\`\`\``)
                    .setColor('0xa744f2')
                ]
            })
        }
    }
}