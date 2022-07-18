const { MessageEmbed, TextInputComponent, Modal, MessageActionRow } = require('discord.js')
const reportSchema = require('../models/reports')
const profileSchema = require('../models/userProfile')

module.exports = (client) => {
   client.on('interactionCreate', async(interaction) => {
    if (!interaction.isButton()) return
    const checkForDev = await profileSchema.findOne({userId: interaction.user.id, developer: true})
    const checkForAdmin = await profileSchema.findOne({userId: interaction.user.id, botAdmin: true})
    if (!checkForDev && !checkForAdmin && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
        embeds: [
            new MessageEmbed()
            .setTitle('You do not have permission to manage reports')
            .setColor('0xa477fc')
        ],
        ephemeral: true
    })

    if (interaction.customId === 'report-approve') {
        const result = await reportSchema.findOne({
            reportId: interaction.message.embeds[0].footer.text
        })
        if (!result) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Hmm this is strange')
                .setDescription(`I could not find this report in the database`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
        interaction.message.edit({
            embeds: [
                new MessageEmbed()
                .setTitle('Report Approved')
                .setImage(result.proofUrl)
                .setColor('0xa477fc')
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
                    value: `\`Approved\`\n**Approved By**: ${interaction.user} | \`${interaction.user.id}\``
                }, {
                    name: `${interaction.message.embeds[0].fields[4].name === 'Reason For Report' ? 'Reason For Report' : 'Problem'}`,
                    value: `${interaction.message.embeds[0].fields[4].value}`
                }, {
                    name: 'Proof',
                    value: 'Displayed bellow'
                })
                .setFooter({text: `${interaction.message.embeds[0].footer.text}`})
            ]
        })
        await result.updateOne({
            status: 'Approved'
        })

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Marked as approved')
                .setDescription(`This report has been approved`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })


    } else if (interaction.customId === 'report-deny') {
        const result = await reportSchema.findOne({
            reportId: interaction.message.embeds[0].footer.text
        })
        if (!result) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Hmm this is strange')
                .setDescription(`I could not find this report in the database`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })

        let firstActionRow
        let denyModel = new Modal()
            .setTitle(`Reason`)
            .setCustomId(`model-deny`);

        const reason_for_deny = new TextInputComponent()
            .setCustomId('reason_for_deny')
            .setLabel("Why are you denying this report?")
            .setPlaceholder('Invalid proof')
            .setRequired(true)
            .setStyle('SHORT')
            .setMaxLength(200)

        firstActionRow = new MessageActionRow().addComponents(reason_for_deny)
        denyModel.addComponents(firstActionRow)

        interaction.showModal(denyModel)
        interaction.awaitModalSubmit({
            time: 10000
        }).catch(() => {
            interaction.followUp({
                embeds: [
                    new MessageEmbed()
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
                    new MessageEmbed()
                    .setTitle('Report Denied')
                    .setImage(result.proofUrl)
                    .setColor('0xa477fc')
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
                        value: 'Displayed bellow'
                    })
                    .setFooter({text: `${interaction.message.embeds[0].footer.text}`})
                ]
            })
            await result.updateOne({
                status: 'Denied'
            })
            interaction.followUp({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Marked as denied')
                    .setDescription(`This report has been denied\n**Reason**: ${reason}`)
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            }).catch((err) => {})
            interact.deferUpdate()
        })
    } else if (interaction.customId === 'report-seen') {
        const result = await reportSchema.findOne({
            reportId: interaction.message.embeds[0].footer.text
        })
        if (!result) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Hmm this is strange')
                .setDescription(`I could not find this report in the database`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })

        interaction.message.edit({
            embeds: [
                new MessageEmbed()
                .setTitle('Report Under Review')
                .setImage(result.proofUrl)
                .setColor('0xa477fc')
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
                    value: `\`Under Review\`\n**Action By**: ${interaction.user} | \`${interaction.user.id}\``
                }, {
                    name: `${interaction.message.embeds[0].fields[4].name === 'Reason For Report' ? 'Reason For Report' : 'Problem'}`,
                    value: `${interaction.message.embeds[0].fields[4].value}`
                }, {
                    name: 'Proof',
                    value: 'Displayed bellow'
                })
                .setFooter({text: `${interaction.message.embeds[0].footer.text}`})
            ]
        })
        await result.updateOne({
            status: 'Under Review'
        })

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle('Marked as under review')
                .setDescription(`This report has been marked as under review`)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })
    }
})
},

module.exports.config = {
   dbName: 'REPORT STAFF BUTTONS',
   displayName: 'Staff Report Buttons',
}