const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  WebhookClient,
  ModalBuilder,
  TextInputBuilder,
  StringSelectMenuBuilder
} = require("discord.js")
const {
  colours,
  userReportWebhook,
  supportServerUrl
} = require("../../constants")
const {
  viewProfile
} = require("../main")
const {
  cooldown
} = require("./cooldown")
const {
  createStaffProfileEmbed
} = require("./profile")
const fs = require('fs')
const {
  cityView,
  cityEmbed
} = require("../city/view")
const {
  checkReportBan, checkBotBan
} = require("../blacklist/check")
const { maintenanceCheck } = require("../blacklist/maintenanceCheck")

async function report(interaction, client) {
  if (maintenanceCheck(interaction.user.id, 'Reports') === true) return interaction.reply({
    embeds: [
        new EmbedBuilder()
        .setColor(colours.error)
        .setDescription('The reports module is currently in maintenance. Join the support server for more information')
    ],
    ephemeral: true,
    components: [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setURL(supportServerUrl)
            .setLabel('Support Server')
            .setStyle('Link')
        )
    ]
})
  const botBan = checkBotBan(interaction.user.id)
  if (botBan !== null) {
    if (botBan.type === 'User') return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('You have been banned from using the bot')
        .setColor(colours.blend)
        .setDescription(`Expires: ${botBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(botBan.expires / 1000))}> (<t:${Math.floor(Math.round(botBan.expires / 1000))}:R>)`}\nReason:\n${botBan.reason}`)
        .setFooter({
          text: `You can join the support server to appeal | Case: ${botBan.case}`
        })
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setStyle('Link')
          .setURL(supportServerUrl)
          .setLabel('Support Server')
        )
      ],
      ephemeral: true
    })
    if (botBan.type === 'Guild') return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('This server has been banned from using the bot')
        .setColor(colours.blend)
        .setDescription(`Expires: ${botBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(botBan.expires / 1000))}> (<t:${Math.floor(Math.round(botBan.expires / 1000))}:R>)`}\nReason:\n${botBan.reason}`)
        .setFooter({
          text: `The server owner may join the support server to appeal | Case: ${botBan.case}`
        })
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setStyle('Link')
          .setURL(supportServerUrl)
          .setLabel('Support Server')
        )
      ],
      ephemeral: true
    })
  }
  const reportBan = checkReportBan(interaction.user.id)
  if (reportBan !== null) {
    if (reportBan.type === 'User') return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('You have been banned from using the bot\'s report system')
        .setColor(colours.blend)
        .setDescription(`**You are still able to use commands**\n\nExpires: ${reportBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(reportBan.expires / 1000))}> (<t:${Math.floor(Math.round(reportBan.expires / 1000))}:R>)`}\nReason:\n${reportBan.reason}`)
        .setFooter({
          text: `You can join the support server to appeal | Case: ${reportBan.case}`
        })
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setStyle('Link')
          .setURL(supportServerUrl)
          .setLabel('Support Server')
        )
      ],
      ephemeral: true
    })
    if (reportBan.type === 'Guild') return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('This server has been banned from using the bot\'s report system')
        .setColor(colours.blend)
        .setDescription(`**You are still able to use commands**\n\nExpires: ${reportBan.expires === 'never' ? 'never' : `<t:${Math.floor(Math.round(reportBan.expires / 1000))}> (<t:${Math.floor(Math.round(reportBan.expires / 1000))}:R>)`}\nReason:\n${reportBan.reason}`)
        .setFooter({
          text: `The server owner may join the support server to appeal | Case: ${reportBan.case}`
        })
      ],
      components: [
        new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
          .setStyle('Link')
          .setURL(supportServerUrl)
          .setLabel('Support Server')
        )
      ],
      ephemeral: true
    })
  }
  let id = interaction.customId.replace('report-', '').split('|')[0]
  if (id === interaction.user.id) return interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setDescription(`You can't report yourself....`)
      .setColor(colours.blend)
    ],
    ephemeral: true
  })
  const message = await interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setDescription(`What are you reporting <@${id}> for?`)
      .setColor(colours.blend)
    ],
    components: [
      new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('report-options')
        .setPlaceholder('Choose a report reason')
        .setMinValues(1)
        .setMaxValues(6)
        .addOptions([{
          label: 'Content',
          description: 'Inappropriate bio/city name',
          value: 'Content| - Inappropriate bio/city name'
        }, {
          label: 'Harassment',
          description: 'Targeting, bullying, using the bot to bully someone',
          value: 'Harassment| - Targeting, bullying or using the bot to bully someone'
        }, {
          label: 'Cheating',
          description: 'Using macros, user-bots or automation',
          value: 'Cheating| - Using macros, user-bots or automation'
        }, {
          label: 'Exploits',
          description: 'Sharing or participating in exploits',
          value: 'Exploits| - Sharing or participating in exploits'
        }, {
          label: 'IRL Trading',
          description: 'Trading bot items or coins for real money',
          value: 'IRL Trading| - Trading bot items or coins for real money'
        }, {
          label: 'Other',
          description: 'Use the comment to put the reason for this report',
          value: 'Other| - Use the comment to put the reason for this report'
        }])
      )
    ],
    ephemeral: true,
    fetchReply: true
  })
  const collector = await message.createMessageComponentCollector({
    type: 'Button',
    time: 15000
  })

  let canceled = false
  let reason
  let staffReason
  let proof
  let comment = 'None'
  collector.on('collect', async (int) => {
    if (int.customId !== 'comment') int.deferUpdate()
    collector.resetTimer({
      time: 300000
    })
    if (int.customId === 'report-options') {
      if (int.values) {
        reason = int.values.map(item => `\`${item.split('|')[0]}\`${item.split('|')[1]}`).join('\n')
        staffReason = int.values.map(item => item.split('|')[0]).join('\n')
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription(`You are reporting <@${id}> for:\n${reason}${comment ? `\n\n**Comment**: ${comment}` : ''}`)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setLabel('Send Report')
              .setCustomId('send')
              .setStyle('Success'),

              new ButtonBuilder()
              .setLabel('Change Reason')
              .setCustomId('change')
              .setStyle('Primary'),

              new ButtonBuilder()
              .setLabel('Add Proof')
              .setCustomId('proof')
              .setStyle('Primary'),

              new ButtonBuilder()
              .setLabel('Add Comment')
              .setCustomId('comment')
              .setStyle('Primary'),

              new ButtonBuilder()
              .setLabel('Cancel')
              .setCustomId('cancel')
              .setStyle('Danger')
            )
          ]
        })
      }
    } else if (int.customId === 'send') {
      canceled = true
      collector.stop()
      const cooldownCheck = await cooldown(300, interaction, false)
      if (cooldownCheck === true) return interaction.editReply({
        components: []
      })
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`**Report Sent**\n\nYou reported <@${id}> for:\n${reason}${comment ? `\n\n**Comment**: ${comment}` : ''}`)
        ],
        components: []
      })
      fs.writeFileSync(`./database/users/${id}/admin/trackCommands`, 'economy')

      const webhookClient = new WebhookClient({
        url: userReportWebhook
      })
      const obj = viewProfile(id)
      const cityObj = cityView(id)
      webhookClient.send({
        embeds: [createStaffProfileEmbed(obj), cityEmbed(cityObj), new EmbedBuilder().setDescription(`Reported By: ${interaction.user.tag} (${interaction.user.id})\n\n**Reason**:\n${staffReason}${comment ? `\n\n**Comment**: ${comment}` : ''}`).setColor(colours.blend)],
        files: proof
      })

    } else if (int.customId === 'change') {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setDescription(`What are you reporting <@${id}> for?`)
          .setColor(colours.blend)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
            .setCustomId('report-options')
            .setPlaceholder('Choose a report reason')
            .setMinValues(1)
            .setMaxValues(6)
            .addOptions([{
              label: 'Content',
              description: 'Inappropriate bio/city name',
              value: 'Content| - Inappropriate bio/city name'
            }, {
              label: 'Harassment',
              description: 'Targeting, bullying, using the bot to bully someone',
              value: 'Harassment| - Targeting, bullying or using the bot to bully someone'
            }, {
              label: 'Cheating',
              description: 'Using macros, user-bots or automation',
              value: 'Cheating| - Using macros, user-bots or automation'
            }, {
              label: 'Exploits',
              description: 'Sharing or participating in exploits',
              value: 'Exploits| - Sharing or participating in exploits'
            }, {
              label: 'IRL Trading',
              description: 'Trading bot items or coins for real money',
              value: 'IRL Trading| - Trading bot items or coins for real money'
            }, {
              label: 'Other',
              description: 'Use the comment to put the reason for this report',
              value: 'Other| - Use the comment to put the reason for this report'
            }])
          )
        ],
        ephemeral: true,
        fetchReply: true
      })
    } else if (int.customId === 'proof') {
      let failed = false
      const dm = await int.user.send({
        embeds: [
          new EmbedBuilder()
          .setDescription('Please send an attachment containing the proof')
          .setFooter({
            text: `Type "Cancel" to cancel or "Clear" to clear all proof`
          })
          .setColor(colours.blend)
        ],
        fetchReply: true
      }).catch(() => {
        failed = true
      })
      if (failed === true) return int.followUp({
        embeds: [
          new EmbedBuilder()
          .setDescription('I cannot DM you. Please enable your DMs')
          .setColor(colours.blend)
        ],
        ephemeral: true
      })
      int.followUp({
        embeds: [
          new EmbedBuilder()
          .setDescription(`Please [check your DMs](https://discord.com/channels/@me/${dm.channel.id})`)
          .setColor(colours.blend)
        ],
        ephemeral: true
      })

      const filter = m => m.attachments.size >= 1 || m.content.toLowerCase() === 'cancel' || m.content.toLowerCase() === 'clear'
      const proofCollector = await dm.channel.createMessageCollector({
        filter,
        time: 60000
      })
      let collectedProof = 'no'
      proofCollector.on('collect', async (msg) => {
        if (msg.content.toLowerCase() === 'cancel') {
          collectedProof = 'cancel';
          proofCollector.stop()
        } else if (msg.content.toLowerCase() === 'clear') {
          collectedProof = 'clear';
          proofCollector.stop()
        }
        proof = [...msg.attachments.values()]
        proof = proof.slice(0, 5)
        collectedProof = 'collected'
        proofCollector.stop()
      })
      proofCollector.on('end', () => {
        if (collectedProof === 'collected') dm.channel.send({
          embeds: [
            new EmbedBuilder()
            .setDescription('Thanks for the proof')
            .setColor(colours.blend)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setLabel('Go back to report message')
              .setURL(`https://discord.com/channels/${int.guild.id}/${int.channel.id}/`)
              .setStyle('Link')
            )
          ]
        }).then(() => {
          int.editReply({
            files: proof,
            ephemeral: true
          })
        })
        else if (collectedProof === 'cancel') {
          dm.channel.send({
            embeds: [
              new EmbedBuilder()
              .setDescription('Canceled')
              .setColor(colours.blend)
            ],
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setLabel('Go back to report message')
                .setURL(`https://discord.com/channels/${int.guild.id}/${int.channel.id}/`)
                .setStyle('Link')
              )
            ]
          })
        } else if (collectedProof === 'clear') {
          dm.channel.send({
            embeds: [
              new EmbedBuilder()
              .setDescription('Cleared the report of proof')
              .setColor(colours.blend)
            ],
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setLabel('Go back to report message')
                .setURL(`https://discord.com/channels/${int.guild.id}/${int.channel.id}/`)
                .setStyle('Link')
              )
            ]
          })
          int.editReply({
            files: [],
            ephemeral: true
          })
        } else dm.channel.send({
          embeds: [
            new EmbedBuilder()
            .setDescription('You took too long to respond')
            .setColor(colours.blend)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setLabel('Go back to report message')
              .setURL(`https://discord.com/channels/${int.guild.id}/${int.channel.id}/`)
              .setStyle('Link')
            )
          ]
        })
      })
    } else if (int.customId === 'cancel') {
      canceled = true
      collector.stop()
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`Report Canceled`)
        ],
        components: []
      })
    } else if (int.customId === 'comment') {
      let firstTextBox
      let customPriceModal = new ModalBuilder()
        .setTitle('Add Comment')
        .setCustomId('custom-modal')

      const price = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('What is your comment?')
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true)
        .setStyle('Short')

      firstTextBox = new ActionRowBuilder().addComponents(price)
      customPriceModal.addComponents(firstTextBox)
      int.showModal(customPriceModal)
      await int.awaitModalSubmit({
          time: 60000
        }).catch(() => {
          int.followUp({
            embeds: [
              new EmbedBuilder()
              .setDescription('You took too long to submit the modal')
              .setColor(colours.blend)
            ],
            components: [],
            ephemeral: true
          })
        })
        .then(async (i) => {
          if (!i) return
          i.deferUpdate()
          comment = i.fields.getTextInputValue('message')
        })
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setColor(colours.blend)
          .setDescription(`You are reporting <@${id}> for:\n${reason}${comment ? `\n\n**Comment**: ${comment}` : ''}`)
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setLabel('Send Report')
            .setCustomId('send')
            .setStyle('Success'),

            new ButtonBuilder()
            .setLabel('Change Reason')
            .setCustomId('change')
            .setStyle('Primary'),

            new ButtonBuilder()
            .setLabel('Add Proof')
            .setCustomId('proof')
            .setStyle('Primary'),

            new ButtonBuilder()
            .setLabel('Add Comment')
            .setCustomId('comment')
            .setStyle('Primary'),

            new ButtonBuilder()
            .setLabel('Cancel')
            .setCustomId('cancel')
            .setStyle('Danger')
          )
        ]
      })
    }
  })
  collector.on('end', () => {
    if (canceled === true) return
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`Timed Out`)
      ],
      components: []
    })
  })

}

module.exports = {
  report
}