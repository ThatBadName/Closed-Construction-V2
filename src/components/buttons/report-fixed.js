const profileSchema = require('../../models/userProfile')
const reportSchema = require('../../models/reports')
const {
    EmbedBuilder,
} = require('discord.js')

module.exports = {
    data: {
        name: 'report-fixed'
    },
    async execute(interaction) {
        const checkForDev = await profileSchema.findOne({
            userId: interaction.user.id,
            developer: true
        })
        const checkForAdmin = await profileSchema.findOne({
            userId: interaction.user.id,
            botAdmin: true
        })
        if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have permission to manage reports')
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
        const result = await reportSchema.findOne({
            reportId: interaction.message.embeds[0].footer.text
        })
        if (!result) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Hmm this is strange')
                .setDescription(`I could not find this report in the database`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })

        interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                .setTitle('Report Fixed')
                .setImage(result.proofUrl)
                .setColor('0x007521')
                .setFields({
                    name: 'Reporter',
                    value: `${interaction.message.embeds[0].fields[0].value}`
                }, {
                    name: `${interaction.message.embeds[0].fields[1].name === 'Suspect' ? 'Suspect' : 'Command With Problem'}`,
                    value: `${interaction.message.embeds[0].fields[1].value}`
                }, {
                    name: 'Report ID',
                    value: `${interaction.message.embeds[0].fields[2].value}`,
                    inline: true
                }, {
                    name: 'Report Status',
                    value: `\`Fixed\`\n**Action By**: ${interaction.user} | \`${interaction.user.id}\``
                }, {
                    name: `${interaction.message.embeds[0].fields[4].name === 'Reason For Report' ? 'Reason For Report' : 'Problem'}`,
                    value: `${interaction.message.embeds[0].fields[4].value}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })
                .setFooter({
                    text: `${interaction.message.embeds[0].footer.text}`
                })
            ]
        })
        await result.updateOne({
            status: 'Fixed'
        })

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Marked as fixed')
                .setDescription(`This report has been marked as fixed`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
    }
}