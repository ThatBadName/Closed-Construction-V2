const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js");
const {
  dmLog
} = require("../../botFunctions/botManagement/dmLogs");
const {
  colours
} = require("../../constants");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDMPermission(false)
    .setDescription('DM a user')
    .addStringOption(option =>
      option.setName('user')
      .setDescription('The ID of the user to DM')
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(25)
    )
    .addAttachmentOption(option =>
      option.setName('attachment')
      .setDescription('Any attachments to send to the user')
    ),

  async execute(interaction, client) {
    const checkForUser = await client.users.fetch(interaction.options.getString('user'))
    if (!checkForUser) return interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('Could not find user')
        .setDescription(`I am not in a server with any user that has the ID: \`${interaction.options.getString('user')}\``)
        .setColor(colours.error)
      ],
      ephemeral: true
    })

    let proof = interaction.options.getAttachment('attachment')
    let firstTextBox
    let customPriceModal = new ModalBuilder()
      .setTitle('Message')
      .setCustomId('custom-modal')

    const price = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('What do you want to send')
      .setMinLength(1)
      .setMaxLength(1000)
      .setRequired(true)
      .setStyle('Paragraph')

    firstTextBox = new ActionRowBuilder().addComponents(price)
    customPriceModal.addComponents(firstTextBox)
    interaction.showModal(customPriceModal)
    await interaction.awaitModalSubmit({
        time: 300000
      }).catch(() => {
        interaction.followUp({
          embeds: [
            new EmbedBuilder()
            .setTitle('You took too long to submit the modal')
          ],
          components: [],
          ephemeral: true
        })
      })
      .then(async (i) => {
        if (!i) return
        let message = i.fields.getTextInputValue('message')

        let failed = false
        let password = [];
        let possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let passString
        let passWordLength = 7
        for (let i = 0; i < passWordLength; i++) {
          password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        passString = password.join('')

        let confirm
        if (interaction.options.getAttachment('attachment')) confirm = await i.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription(`You are sending a message to ${checkForUser.tag} (\`${checkForUser.id}\`)\n\n` + message)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Send')
              .setStyle('Success'),

              new ButtonBuilder()
              .setCustomId('no')
              .setLabel('Cancel')
              .setStyle('Danger')
            )
          ],
          ephemeral: true,
          fetchReply: true,
          files: [proof]
        })
        else confirm = await i.reply({
          embeds: [
            new EmbedBuilder()
            .setColor(colours.blend)
            .setDescription(`You are sending a message to ${checkForUser.tag} (\`${checkForUser.id}\`)\n\n` + message)
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Send')
              .setStyle('Success'),

              new ButtonBuilder()
              .setCustomId('no')
              .setLabel('Cancel')
              .setStyle('Danger')
            )
          ],
          ephemeral: true,
          fetchReply: true
        })

        const collector = await confirm.createMessageComponentCollector({
          type: 'Button',
          time: 60000
        })

        let collected = false
        collector.on('collect', async (int) => {
          if (int.user.id !== interaction.user.id) return int.reply({
            embeds: [
              new EmbedBuilder()
              .setDescription('This is not for you')
              .setColor(colours.blend)
            ],
            ephemeral: true
          })
          await int.deferUpdate()
          if (int.customId === 'yes') {
            if (interaction.options.getAttachment('attachment')) await checkForUser.send({
                embeds: [
                  new EmbedBuilder()
                  .setColor(colours.cpPurple)
                  .setTitle('You have been sent a message')
                  .setDescription(message)
                  .setFooter({
                    text: `This is an official message sent by the staff of ${client.user.username}. If you want to report abuse of this system please do so in the support server (ID: ${passString})`
                  })
                ],
                files: [proof]
              })
              .catch((err) => {
                failed = true
              })
            else await checkForUser.send({
              embeds: [
                new EmbedBuilder()
                .setColor(colours.cpPurple)
                .setTitle('You have been sent a message')
                .setDescription(message)
                .setFooter({
                  text: `This is an official message sent by the staff of ${client.user.username}. If you want to report abuse of this system please do so in the support server (ID: ${passString})`
                })
              ]
            })
            .catch((err) => {
              failed = true
            })
            if (failed === true) return i.editReply({
              embeds: [
                new EmbedBuilder()
                .setTitle('Something went wrong')
                .setDescription(`This user may not have their DMs enabled`)
                .setColor(colours.error)
              ],
              ephemeral: true,
              components: []
            })
            if (interaction.options.getAttachment('attachment')) dmLog(checkForUser, interaction, message, passString, proof)
            else dmLog(checkForUser, interaction, message, passString)
            if (interaction.options.getAttachment('attachment')) i.editReply({
              embeds: [
                new EmbedBuilder()
                .setTitle('Message sent')
                .setDescription(`I have sent a message to \`${checkForUser.tag}\` (\`${checkForUser.id}\`)\n\n${message}`)
                .setColor(colours.success)
              ],
              ephemeral: true,
              components: [],
              files: [proof]
            })
            else i.editReply({
              embeds: [
                new EmbedBuilder()
                .setTitle('Message sent')
                .setDescription(`I have sent a message to \`${checkForUser.tag}\` (\`${checkForUser.id}\`)\n\n${message}`)
                .setColor(colours.success)
              ],
              ephemeral: true,
              components: []
            })
          } else if (int.customId === 'no') {
            collected = true
            collector.stop()
            i.editReply({
              embeds: [
                new EmbedBuilder()
                .setDescription(`**Canceled**\n\n\`${checkForUser.tag}\` (\`${checkForUser.id}\`)\nYour message would have been:\n\n${message}`)
                .setColor(colours.error)
              ],
              ephemeral: true,
              components: []
            })
          }
        })
        collector.on('end', () => {
          if (collected === true) return
          i.editReply({
            embeds: [
              new EmbedBuilder()
              .setDescription(`**Timed Out**\n\n\`${checkForUser.tag}\` (\`${checkForUser.id}\`)\nYour message would have been:\n\n${message}`)
              .setColor(colours.error)
            ],
            ephemeral: true,
            components: []
          })
        })
      })
  }
}