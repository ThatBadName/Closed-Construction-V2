const profileSchema = require('../../models/userProfile')
const reportSchema = require('../../models/reports')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder
} = require('discord.js')

module.exports = {
    data: {
        name: 'report-deny'
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

        let firstActionRow
        let denyModel = new ModalBuilder()
            .setTitle(`Reason`)
            .setCustomId(`model-deny`);

        const reason_for_deny = new TextInputBuilder()
            .setCustomId('reason_for_deny')
            .setLabel("Why are you denying this report?")
            .setPlaceholder('Invalid proof')
            .setRequired(true)
            .setStyle('Short')
            .setMaxLength(200)

        firstActionRow = new ActionRowBuilder().addComponents(reason_for_deny)
        denyModel.addComponents(firstActionRow)

        interaction.showModal(denyModel)
        interaction.awaitModalSubmit({
                time: 60000
            }).catch(() => {
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You took too long to put a reason')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                }).catch((err) => {})
            })
            .then(async (interact) => {
                if (!interact) return
                const reason = interact.fields.getTextInputValue('reason_for_deny')
                interaction.message.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Report Denied')
                        .setImage(result.proofUrl)
                        .setColor('0x9e0008')
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
                            value: `\`Denied\`\n**Denied By**: ${interaction.user} | \`${interaction.user.id}\`\n**Reason**: ${reason}`
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
                    status: 'Denied'
                })
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Marked as denied')
                        .setDescription(`This report has been denied\n**Reason**: ${reason}`)
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                }).catch((err) => {})
                interact.deferUpdate()
            })
    }
}