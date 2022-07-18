const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const reportSchema = require('../models/reports')

module.exports = {
name: 'report',
aliases: [''],
description: 'Report a user',
category: 'Misc',
slash: true,
ownerOnly: false,
guildOnly: true,
testOnly: false,
options: [
    {
    name: 'user',
    description: 'Report problem',
    type: 'SUB_COMMAND',
    options: [
        {
            name: 'user-id',
            description: 'The ID of the user to report',
            type: 'STRING',
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason you are reporting this user (Max 500 characters)',
            type: 'STRING',
            required: true
        },
        {
            name: 'proof',
            description: 'Proof that the user has done something (Must be jpg or png)',
            type: 'ATTACHMENT',
            required: true
        }]
    },
    {
        name: 'bug',
        description: 'Report a bug',
        type: 'SUB_COMMAND',
        options: [
            {
                name: 'command',
                description: 'The command/area that the bug is in',
                type: 'STRING',
                required: true,
            },
            {
                name: 'description',
                description: 'A description of the bug',
                type: 'STRING',
                required: true
            },
            {
                name: 'proof',
                description: 'Proof of the bug (Must be jpg or png)',
                type: 'ATTACHMENT',
                required: true
            }
        ]
    }
],

callback: async({interaction, client}) => {
    const functions = require('../checks/functions')
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
                new MessageEmbed()
                .setTitle('Could not find user')
                .setDescription(`I am not in a server with any user that has the ID: \`${interaction.options.getString('user-id')}\``)
                .setColor('0xa477fc')
            ],
            ephemeral: true
        })

        if (interaction.user.id === interaction.options.getString('user-id')) return interaction.reply({
            embeds: [
                new MessageEmbed()
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
                new MessageEmbed()
                .setTitle('Proof must be an image as a jpeg or png')
                .setColor('0xa477fc')
            ]
        })
        let failed = false
        let confirmReportMessage
        try {
            confirmReportMessage = await interaction.user.send({
                embeds: [
                    new MessageEmbed()
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
                        value: 'Displayed bellow'
                    })
                    .setFooter({text: `Submitting fake/prank reports will only get you blacklisted`})
                ],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setCustomId('report-send')
                        .setLabel('Confirm')
                        .setStyle('SUCCESS'),
        
                        new MessageButton()
                        .setCustomId('report-cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
                    )
                ]
            })
        } catch {
            failed = true
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please enable your DMs')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        }
        if (failed === false) {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I have sent you a DM')
                    .setDescription(`Please check your DMs to continue with the report`)
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        } 

        const collector = await confirmReportMessage.createMessageComponentCollector({
            componentType: 'BUTTON',
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
                        new MessageEmbed()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                const channel = guild.channels.cache.get('997574796562931816')
                if (!channel) return i.reply({
                    embeds: [
                        new MessageEmbed()
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
                        new MessageEmbed()
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
                            value: 'Displayed bellow'
                        })
                        .setFooter({text: `R-${passString}`})
                    ],
                    content: `<@&997575639047614605>,`,
                    components: [
                        new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setCustomId('report-approve')
                            .setLabel('Approve')
                            .setStyle('SUCCESS'),

                            new MessageButton()
                            .setCustomId('report-deny')
                            .setLabel('Deny')
                            .setStyle('DANGER'),

                            new MessageButton()
                            .setCustomId('report-seen')
                            .setLabel('Mark as under review')
                            .setStyle('SECONDARY'),
                        )
                    ]
                })
                staffMessage.startThread({
                    name: `${interaction.user.tag}'s report`,
                    reason: 'Automated Action',
                })
                confirmReportMessage.embeds[0].setFooter({text: 'This report has been sent. Please note that for privacy reason we will not be able to share the result of this report'})
                confirmReportMessage.embeds[0].setTitle('Report Sent')
                confirmReportMessage.embeds[0].setFields({
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
                    value: 'Displayed bellow'
                })

                confirmReportMessage.edit({
                    embeds: [confirmReportMessage.embeds[0]],
                    components: []
                })


                await reportSchema.create({reporterId: i.user.id, suspectId: interaction.options.getString('user-id'), type: 'User Report', reason: `${reason}`, proofUrl: proof.url, messageUrl: staffMessage.url, reportId: `R-${passString}`})

            } else if (i.customId === 'report-cancel') {
                collected = true
                confirmReportMessage.embeds[0].setFooter({text: 'Report Canceled'})
                confirmReportMessage.embeds[0].setTitle('This report has not been sent')
                confirmReportMessage.edit({
                    embeds: [confirmReportMessage.embeds[0]],
                    components: []
                })
            }
        })

        collector.on('end', () => {
            if (collected === true) return
            confirmReportMessage.embeds[0].setFooter({text: 'This report message has timed out'})
            confirmReportMessage.edit({
                embeds: [confirmReportMessage.embeds[0]],
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
                new MessageEmbed()
                .setTitle('Proof must be an image as a jpeg or png')
                .setColor('0xa477fc')
            ]
        })
        let failed = false
        let confirmReportMessage
        try {
            confirmReportMessage = await interaction.user.send({
                embeds: [
                    new MessageEmbed()
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
                        value: 'Displayed bellow'
                    })
                    .setFooter({text: `Submitting fake/prank reports will only get you blacklisted`})
                ],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setCustomId('report-send')
                        .setLabel('Confirm')
                        .setStyle('SUCCESS'),
        
                        new MessageButton()
                        .setCustomId('report-cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
                    )
                ]
            })
        } catch {
            failed = true
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please enable your DMs')
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        }
        if (failed === false) {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('I have sent you a DM')
                    .setDescription(`Please check your DMs to continue with the report`)
                    .setColor('0xa477fc')
                ],
                ephemeral: true
            })
        } 

        const collector = await confirmReportMessage.createMessageComponentCollector({
            componentType: 'BUTTON',
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
                        new MessageEmbed()
                        .setTitle('An internal error occured')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                const channel = guild.channels.cache.get('997875400950677544')
                if (!channel) return i.reply({
                    embeds: [
                        new MessageEmbed()
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
                        new MessageEmbed()
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
                            value: 'Displayed bellow'
                        })
                        .setFooter({text: `R-${passString}`})
                    ],
                    content: `<@&997875668970901645>,`,
                    components: [
                        new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setCustomId('report-approve')
                            .setLabel('Approve')
                            .setStyle('SUCCESS'),

                            new MessageButton()
                            .setCustomId('report-deny')
                            .setLabel('Deny')
                            .setStyle('DANGER'),

                            new MessageButton()
                            .setCustomId('report-seen')
                            .setLabel('Mark as under review')
                            .setStyle('SECONDARY'),
                        )
                    ]
                })
                staffMessage.startThread({
                    name: `${interaction.user.tag}'s report`,
                    reason: 'Automated Action',
                })
                confirmReportMessage.embeds[0].setFooter({text: 'This report has been sent. Thanks for reporting this problem, we hope to get it fixed soon'})
                confirmReportMessage.embeds[0].setTitle('Report Sent')
                confirmReportMessage.embeds[0].setFields({
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
                    value: 'Displayed bellow'
                })

                confirmReportMessage.edit({
                    embeds: [confirmReportMessage.embeds[0]],
                    components: []
                })


                await reportSchema.create({reporterId: i.user.id, type: 'Bug Report', reason: `${reason}`, proofUrl: proof.url, messageUrl: staffMessage.url, reportId: `R-${passString}`})

            } else if (i.customId === 'report-cancel') {
                collected = true
                confirmReportMessage.embeds[0].setFooter({text: 'Report Canceled'})
                confirmReportMessage.embeds[0].setTitle('This report has not been sent')
                confirmReportMessage.edit({
                    embeds: [confirmReportMessage.embeds[0]],
                    components: []
                })
            }
        })

        collector.on('end', () => {
            if (collected === true) return
            confirmReportMessage.embeds[0].setFooter({text: 'This report message has timed out'})
            confirmReportMessage.edit({
                embeds: [confirmReportMessage.embeds[0]],
                components: []
            })
        })
    }
}
}