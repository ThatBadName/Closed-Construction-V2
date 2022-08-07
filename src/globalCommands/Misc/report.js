const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ComponentType } = require('discord.js')
const reportSchema = require('../../models/reports')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('report')
    .setDMPermission(false)
    .setDescription('Report something to the bot developers')
    .addSubcommand(option => 
        option.setName('user')
        .setDescription('Report a user')
        .addStringOption(option => 
            option.setName('user-id')
            .setDescription('The ID of the user to report')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason you are reporting this user (Max 500 characters)')
            .setMaxLength(500)
            .setRequired(true)
        )

        .addAttachmentOption(option => 
            option.setName('proof')
            .setDescription('Proof that the user has done something (Must be jpg or png)')
            .setRequired(true)
        )
    )

    .addSubcommand(option => 
        option.setName('bug')
        .setDescription('Report a bug')
        .addStringOption(option => 
            option.setName('command')
            .setDescription('The command/area that the bug is in')
            .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('description')
            .setDescription('A description of the bug')
            .setMaxLength(500)
            .setRequired(true)
        )

        .addAttachmentOption(option => 
            option.setName('proof')
            .setDescription('Proof of the bug (Must be jpg or png)')
            .setRequired(true)
        )
    ),

async execute(interaction, client) {
    const functions = require('../../commandFunctions')
    const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
    if (blks === true) return
    const main = await functions.checkMaintinance(interaction)
    if (main === true) return
    
    if (interaction.options.getSubcommand() === 'user') {
        const cldn = await functions.cooldownCheck(interaction.user.id, 'report', 30, interaction)
        if (cldn === true) return
        const checkForUser = await client.users.fetch(interaction.options.getString('user-id'))
        if (!checkForUser) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Could not find user')
                .setDescription(`I am not in a server with any user that has the ID: \`${interaction.options.getString('user-id')}\``)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })

        if (interaction.user.id === interaction.options.getString('user-id')) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Uhh')
                .setColor('0xa477fc')
                .setDescription(`Why would you try to report yourself`)
            ],
            ephemeral: true
        })

        let reason = interaction.options.getString('reason')
        reason = reason.slice(0, 500)

        let proof = interaction.options.getAttachment('proof')
        if (proof.contentType !== 'image/png' && proof.contentType !== 'image/jpeg') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Proof must be an image as a jpeg or png')
                .setColor('0xa477fc')
            ]
        })
        let failed = false
        let confirmReportMessage
        try {
            confirmReportMessage = await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please confirm that all this info is correct')
                    .setImage(proof.url)
                    .setColor('0xa477fc')
                    .setFields({
                        name: 'User You Are Reporting',
                        value: `${checkForUser} | \`${checkForUser.tag}\` | \`${checkForUser.id}\``
                    }, {
                        name: 'Reason For Report',
                        value: `${reason}`
                    }, {
                        name: 'Proof',
                        value: 'Displayed below'
                    })
                    .setFooter({text: `Submitting fake/prank reports will only get you blacklisted`})
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('report-send')
                        .setLabel('Confirm')
                        .setStyle('Success'),
        
                        new ButtonBuilder()
                        .setCustomId('report-cancel')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )
                ],
                fetchReply: true
            })
        } catch {
            failed = true
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please enable your DMs')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        }
        if (failed === false) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I have sent you a DM')
                    .setDescription(`Please check your DMs to continue with the report`)
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        } 

        const collector = await confirmReportMessage.createMessageComponentCollector({
            ComponentType: 'Button',
            time: 60000
        })
        let collected = false
        collector.on('collect', async(i) => {
            if (i.customId === 'report-send') {
                i.deferUpdate()
                collected = true
                functions.createRecentCommand(interaction.user.id, 'report', `USERID: ${interaction.options.getString('user-id')} | REASON: ${reason} | PROOF: ${proof.url}`, interaction)
                const guild = await client.guilds.fetch('994642021425877112')
                if (!guild) return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                const channel = guild.channels.cache.get('997574796562931816')
                if (!channel) return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                let password = [];
                let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                let passString
                let passWordLength = 7
                for (let i = 0; i < passWordLength; i++) {
                    password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
                }
                passString = password.join('')

                const staffMessage = await channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('New User Report')
                        .setImage(proof.url)
                        .setColor('0xa477fc')
                        .setFields({
                            name: 'Reporter',
                            value: `${interaction.user} | \`${interaction.user.tag}\` | \`${interaction.user.id}\``
                        }, {
                            name: 'Suspect',
                            value: `${checkForUser} | \`${checkForUser.tag}\` | \`${checkForUser.id}\``
                        }, {
                            name: 'Report ID',
                            value: `\`R-${passString}\``,
                            inline: true
                        }, {
                            name: 'Report Status',
                            value: `\`Processing\``
                        }, {
                            name: 'Reason For Report',
                            value: `${reason}`
                        }, {
                            name: 'Proof',
                            value: 'Displayed below'
                        })
                        .setFooter({text: `R-${passString}`})
                    ],
                    content: `<@&997575639047614605>,`,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('report-approve')
                            .setLabel('Approve')
                            .setStyle('Success'),

                            new ButtonBuilder()
                            .setCustomId('report-deny')
                            .setLabel('Deny')
                            .setStyle('Danger'),

                            new ButtonBuilder()
                            .setCustomId('report-seen')
                            .setLabel('Mark as under review')
                            .setStyle('Secondary'),
                        )
                    ]
                })
                staffMessage.startThread({
                    name: `${interaction.user.tag}'s report`,
                    reason: 'Automated Action',
                })
                const reportSentEmbedBug = new EmbedBuilder()
                .setTitle('Report Sent')
                .setImage(proof.url)
                .setFooter({text: 'This report has been sent. Thanks for keeping the bot a safe place to be!'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Suspect',
                    value: `${checkForUser} | \`${checkForUser.tag}\` | \`${checkForUser.id}\``
                }, {
                    name: 'Report ID',
                    value: `\`R-${passString}\``
                }, {
                    name: 'Reason For Report',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportSentEmbedBug],
                    components: []
                })


                await reportSchema.create({reporterId: i.user.id, suspectId: interaction.options.getString('user-id'), type: 'User Report', reason: `${reason}`, proofUrl: proof.url, messageUrl: staffMessage.url, reportId: `R-${passString}`})

            } else if (i.customId === 'report-cancel') {
                collected = true
                const reportCanceledEmbedBug = new EmbedBuilder()
                .setTitle('Report Canceled')
                .setImage(proof.url)
                .setFooter({text: 'You were idle too long | This report has not been sent'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Suspect',
                    value: `${checkForUser} | \`${checkForUser.tag}\` | \`${checkForUser.id}\``
                }, {
                    name: 'Report ID',
                    value: `\`R-${passString}\``
                }, {
                    name: 'Reason For Report',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportCanceledEmbedBug],
                    components: []
                })
            }
        })

        collector.on('end', () => {
            if (collected === true) return
            const reportCanceledEmbedBug = new EmbedBuilder()
                .setTitle('Report Canceled')
                .setImage(proof.url)
                .setFooter({text: 'You were idle too long | This report has not been sent'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Suspect',
                    value: `${checkForUser} | \`${checkForUser.tag}\` | \`${checkForUser.id}\``
                }, {
                    name: 'Report ID',
                    value: `\`R-${passString}\``
                }, {
                    name: 'Reason For Report',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportCanceledEmbedBug],
                    components: []
                })
        })
    } else if (interaction.options.getSubcommand() === 'bug') {
        const cldn = await functions.cooldownCheck(interaction.user.id, 'report', 30, interaction)
        if (cldn === true) return

        let reason = interaction.options.getString('description')
        reason = reason.slice(0, 500)

        let proof = interaction.options.getAttachment('proof')
        if (proof.contentType !== 'image/png' && proof.contentType !== 'image/jpeg') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Proof must be an image as a jpeg or png')
                .setColor('0xa477fc')
            ]
        })
        let failed = false
        let confirmReportMessage
        try {
            confirmReportMessage = await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please confirm that all this info is correct')
                    .setImage(proof.url)
                    .setColor('0xa477fc')
                    .setFields({
                        name: 'Command with the problem',
                        value: `${interaction.options.getString('command')}`
                    }, {
                        name: 'Problem',
                        value: `${reason}`
                    }, {
                        name: 'Proof',
                        value: 'Displayed below'
                    })
                    .setFooter({text: `Submitting fake/prank reports will only get you blacklisted`})
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('report-send')
                        .setLabel('Confirm')
                        .setStyle('Success'),
        
                        new ButtonBuilder()
                        .setCustomId('report-cancel')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )
                ]
            })
        } catch {
            failed = true
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please enable your DMs')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        }
        if (failed === false) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I have sent you a DM')
                    .setDescription(`Please check your DMs to continue with the report`)
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        } 

        const collector = await confirmReportMessage.createMessageComponentCollector({
            ComponentType: 'Button',
            time: 60000
        })
        let collected = false
        collector.on('collect', async(i) => {
            
            if (i.customId === 'report-send') {
                i.deferUpdate()
                collected = true
                functions.createRecentCommand(interaction.user.id, 'report', `COMMAND: ${interaction.options.getString('command')} | PROBLEM: ${reason} | PROOF: ${proof.url}`, interaction)
                const guild = await client.guilds.fetch('994642021425877112')
                if (!guild) return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                const channel = guild.channels.cache.get('997875400950677544')
                if (!channel) return i.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                let password = [];
                let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                let passString
                let passWordLength = 7
                for (let i = 0; i < passWordLength; i++) {
                    password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
                }
                passString = password.join('')

                const staffMessage = await channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('New Bug Report')
                        .setImage(proof.url)
                        .setColor('0xa477fc')
                        .setFields({
                            name: 'Reporter',
                            value: `${interaction.user} | \`${interaction.user.tag}\` | \`${interaction.user.id}\``
                        }, {
                            name: 'Command With Problem',
                            value: `${interaction.options.getString('command')}`
                        }, {
                            name: 'Report ID',
                            value: `\`R-${passString}\``,
                            inline: true
                        }, {
                            name: 'Report Status',
                            value: `\`Processing\``
                        }, {
                            name: 'Problem',
                            value: `${reason}`
                        }, {
                            name: 'Proof',
                            value: 'Displayed below'
                        })
                        .setFooter({text: `R-${passString}`})
                    ],
                    content: `<@&997875668970901645>,`,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('report-approve')
                            .setLabel('Approve')
                            .setStyle('Success'),

                            new ButtonBuilder()
                            .setCustomId('report-deny')
                            .setLabel('Deny')
                            .setStyle('Danger'),

                            new ButtonBuilder()
                            .setCustomId('report-seen')
                            .setLabel('Mark as under review')
                            .setStyle('Secondary'),

                            new ButtonBuilder()
                            .setCustomId('report-fixed')
                            .setLabel('Mark as fixed')
                            .setStyle('Primary'),
                        )
                    ]
                })
                staffMessage.startThread({
                    name: `${interaction.user.tag}'s report`,
                    reason: 'Automated Action',
                })

                const reportSentEmbedBug = new EmbedBuilder()
                .setTitle('Report Sent')
                .setImage(proof.url)
                .setFooter({text: 'This report has been sent. Thanks for reporting this problem, we hope to get it fixed soon'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Command',
                    value: `${interaction.options.getString('command')}`
                }, {
                    name: 'Report ID',
                    value: `\`R-${passString}\``
                }, {
                    name: 'Problem',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportSentEmbedBug],
                    components: []
                })


                await reportSchema.create({reporterId: i.user.id, type: 'Bug Report', reason: `${reason}`, proofUrl: proof.url, messageUrl: staffMessage.url, reportId: `R-${passString}`})

            } else if (i.customId === 'report-cancel') {
                collected = true
                const reportCanceledEmbedBug = new EmbedBuilder()
                .setTitle('Report Canceled')
                .setImage(proof.url)
                .setFooter({text: 'This report has not been sent'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Command',
                    value: `${interaction.options.getString('command')}`
                }, {
                    name: 'Problem',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportCanceledEmbedBug],
                    components: []
                })
            }
        })

        collector.on('end', () => {
            if (collected === true) return
            const reportCanceledEmbedBug = new EmbedBuilder()
                .setTitle('Report Canceled')
                .setImage(proof.url)
                .setFooter({text: 'You were idle too long | This report has not been sent'})
                .setColor('0xa477fc')
                .setFields({
                    name: 'Command',
                    value: `${interaction.options.getString('command')}`
                }, {
                    name: 'Problem',
                    value: `${reason}`
                }, {
                    name: 'Proof',
                    value: 'Displayed below'
                })

                confirmReportMessage.edit({
                    embeds: [reportCanceledEmbedBug],
                    components: []
                })
        })
    }
}
}