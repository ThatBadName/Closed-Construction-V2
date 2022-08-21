const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    WebhookClient
} = require('discord.js')
const inventorySchema = require('../../models/inventorySchema')
const profileSchema = require('../../models/userProfile')
const awaitVoteAgainNotifSchema = require('../../models/awaitVoteAgainNotif')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testvote')
        .setDMPermission(false)
        .setDescription('test'),

    async execute(interaction, client) {
        await interaction.reply('command recieved')
        const webhookVoter = new WebhookClient({
            url: 'https://discord.com/api/webhooks/1005529556318441482/edN5A8FXmzVsCEhg6H4TCq8kT2X3tkdL6u8v-vnRbJ8Z8ETKNY3_fOUlX8RAAtnkljX4'
        })

        const vote = {
            user: interaction.user.id
        }
        const member = await client.users.fetch(vote.user)
        webhookVoter.send({
            embeds: [
                new EmbedBuilder()
                .setTitle('Thanks for voting!')
                .setDescription(`<@${vote.user}> (\`${vote.user}\`) has just [voted on Top.gg!](https://top.gg/bot/994644001397428335/vote)`)
                .setColor('0xa477fc')
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle('Link')
                    .setLabel('Vote on Top.gg')
                    .setURL('https://top.gg/bot/994644001397428335/vote')
                )
            ]
        })

        const checkForProfile = await profileSchema.findOne({
            userId: vote.user
        })
        const checkInv = await inventorySchema.findOne({
            userId: vote.user,
            itemId: 'cheque'
        })

        const date = new Date()
        date.setHours(date.getHours() + 12)

        await awaitVoteAgainNotifSchema.create({
            userId: vote.user,
            expires: date
        })

        if (checkForProfile) {
            interaction.followUp('Yes profile')
            var today = new Date()
            if (today.getDay() == 6 || today.getDay() == 0) {
                interaction.followUp('weekend')
                checkForProfile.wallet += 40000
                checkForProfile.canVote = false
                checkForProfile.save()

                interaction.followUp('wallet updated')
                if (!checkInv) interaction.followUp('no inv')
                else interaction.followUp('yes inv')

                if (!checkInv) inventorySchema.create({
                    userId: vote.user,
                    itemId: 'cheque',
                    item: 'Cheque',
                    amount: 3,
                    emoji: '<:Cheque:1005448240663117854>'
                })
                else {
                    checkInv.amount += 3;
                    checkInv.save()
                }

                member.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Thanks for voting!')
                        .setDescription(`As a thank you, we have given you \`40,000\` coins and 3 <:Cheque:1005448240663117854>Cheques`)
                        .setColor('0xa477fc')
                        .setFooter({
                            text: `Cause it's the weekend the rewards are better`
                        })
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle('Link')
                            .setLabel('Vote on Top.gg')
                            .setURL('https://top.gg/bot/994644001397428335/vote')
                        )
                    ]
                }).catch(() => {})
                interaction.followUp('message sent')
            } else {
                interaction.followUp('not weekend')
                checkForProfile.wallet += 20000
                checkForProfile.save()
                interaction.followUp('wallet updated')
                if (!checkInv) interaction.followUp('no inv')
                else interaction.followUp('yes inv')

                if (!checkInv) inventorySchema.create({
                    userId: vote.user,
                    itemId: 'cheque',
                    item: 'Cheque',
                    amount: 1,
                    emoji: '<:Cheque:1005448240663117854>'
                })
                else {
                    checkInv.amount += 1;
                    checkInv.save()
                }

                member.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Thanks for voting!')
                        .setDescription(`As a thank you, we have given you \`20,000\` coins and 1 <:Cheque:1005448240663117854>Cheque`)
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle('Link')
                            .setLabel('Vote on Top.gg')
                            .setURL('https://top.gg/bot/994644001397428335/vote')
                        )
                    ]
                }).catch(() => {})
                interaction.followUp('message sent')
            }
        } else {
            interaction.followUp('no profile')
            member.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Thanks for voting!')
                    .setDescription(`If you had a bot profile we would have sent you some gifts`)
                    .setColor('0xa477fc')
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle('Link')
                        .setLabel('Vote on Top.gg')
                        .setURL('https://top.gg/bot/994644001397428335/vote')
                    )
                ]
            }).catch(() => {})
            interaction.followUp('message sent')
        }
    }
}