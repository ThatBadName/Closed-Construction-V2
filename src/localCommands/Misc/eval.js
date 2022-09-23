const {
    SlashCommandBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDMPermission(false)
        .setDescription('Evaluate some code'),

    async execute(interaction, client) {
        const checkForDev = await profileSchema.findOne({
            userId: interaction.user.id,
            developer: true
        })
        if (!checkForDev && interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have perms to do this')
                .setColor('0xa477fc')
            ]
        })
        let firstActionRow
        let denyModel = new ModalBuilder()
            .setTitle(`Eval`)
            .setCustomId(`model-deny`);

        const reason_for_deny = new TextInputBuilder()
            .setCustomId('reason_for_deny')
            .setLabel("Code")
            .setPlaceholder('client.token lol')
            .setRequired(true)
            .setStyle('Paragraph')
            .setMaxLength(4000)

        firstActionRow = new ActionRowBuilder().addComponents(reason_for_deny)
        denyModel.addComponents(firstActionRow)

        interaction.showModal(denyModel)
        interaction.awaitModalSubmit({
                time: 120000
            }).catch(() => {
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You took too long to put code')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                }).catch((err) => {})
            })
            .then(async (interact) => {
                if (!interact) return
                let code = interact.fields.getTextInputValue('reason_for_deny')
                let evaled = eval(code)
                if (!typeof evaled == "string") evaled = require("util").inspect(evaled)

                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Result')
                        .setColor('0xa477fc')
                        .setDescription(`\`\`\`js\n${evaled.replaceAll(client.token, '[Redacted]')}\n\`\`\``)
                    ]
                })
                interact.deferUpdate().catch(() => {})
            }).catch((err) => {console.log(err)})

    }
}