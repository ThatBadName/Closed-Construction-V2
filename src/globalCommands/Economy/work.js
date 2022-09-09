const profileSchema = require('../../models/userProfile')
const functions = require('../../commandFunctions')
const allJobs = require('../../things/jobs/allJobs')
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js')
const inventorySchema = require('../../models/inventorySchema')
const {
    indexOf
} = require('../../things/jobs/allJobs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('Work for some extra cash')
        .setDMPermission(false)
        .addSubcommand(option =>
            option.setName('list')
            .setDescription('List available jobs')
        )

        .addSubcommand(option =>
            option.setName('work')
            .setDescription('Work for cash')
        )

        .addSubcommand(option =>
            option.setName('new-job')
            .setDescription('Get a new job')
            .addStringOption(option =>
                option.setName('job')
                .setDescription('The new job to work as')
                .setMaxLength(17)
                .setAutocomplete(true)
                .setRequired(true)
            )
        )

        .addSubcommand(option =>
            option.setName('resign')
            .setDescription('Resign from your job')
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'job') {
            const focusedValue = interaction.options.getFocused()
            const choices = allJobs.map(j => j.name)
            const filtered = choices.filter((choice) =>
                choice.startsWith(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice,
                    value: choice
                }))
            )
        }
    },

    async execute(interaction) {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return

        if (interaction.options.getSubcommand() === 'list') {
            const cldn = await functions.cooldownCheck(interaction.user.id, 'job-list', 5, interaction)
            if (cldn === true) return
            functions.createRecentCommand(interaction.user.id, 'job-list', `None`, interaction)

            const jobList = allJobs.map((value) => `> **${value.name}**\n> \`${value.pay < 250000 ? Math.round(value.pay * 2).toLocaleString() : value.pay > 600000 && value.pay < 1000000 ? Math.round(value.pay / 2).toLocaleString() : value.pay >= 1000000 ? Math.round(value.pay / 6).toLocaleString() : value.pay.toLocaleString()}\` per hour - Requires level \`${value.levelRequired}\``).join('\n\n')

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Available Jobs')
                    .setColor('0xa477fc')
                    .setDescription(jobList)
                ]
            })
        } else if (interaction.options.getSubcommand() === 'new-job') {

            let jobQuery = interaction.options.getString('job')
            jobQuery = jobQuery

            functions.createRecentCommand(interaction.user.id, 'job-new', `JOB: ${jobQuery}`, interaction)

            const search = !!allJobs.find((value) => value.name === jobQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That job does not exist')
                    .setColor('0xa744f2')
                ]
            })
            const jobFound = allJobs.find((value) => value.name === jobQuery)
            let userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                userProfile = await profileSchema.create({userId: interaction.user.id})
            }
            if (userProfile.level < jobFound.levelRequired) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('0xa477fc')
                    .setTitle(`You are not a high enough level to work as a ${jobFound.name}. You must be level ${jobFound.levelRequired} and you are only level ${userProfile.level}`)
                ]
            })
            
            if (userProfile.job === jobFound.name) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You already work as this')
                    .setColor('0xa477fc')
                ]
            })
            const cldn = await functions.cooldownCheck(interaction.user.id, 'job-new', 21600, interaction)
            if (cldn === true) return
            await profileSchema.findOneAndUpdate({
                userId: interaction.user.id
            }, {
                job: jobFound.name,
                $unset: {
                    getsFiresOn: ""
                }
            })
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You got a new job!')
                    .setDescription(`You now work as a ${jobFound.name}`)
                    .setColor('0xa477fc')
                ]
            })

        } else if (interaction.options.getSubcommand() === 'resign') {
            functions.createRecentCommand(interaction.user.id, 'job-resign', `None`, interaction)
            const userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) {
                profileSchema.create({userId: interaction.user.id})
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`You do not have a job`)
                        .setDescription('Get a job with \`/job new-job\`')
                        .setColor('0xa477fc')
                    ]
                })
            }
            if (userProfile.job === '') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`You do not have a job`)
                    .setColor('0xa477fc')
                ]
            })
            userProfile.job = ''
            userProfile.save()
            const cldn = await functions.cooldownCheck(interaction.user.id, 'job-new', 21600, interaction)
            if (cldn === true) return

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You have resigned from your job')
                    .setDescription('You must wait 6 hours before getting a new job')
                    .setColor('0xa477fc')
                ]
            })
        } else if (interaction.options.getSubcommand() === 'work') {
            
            const profile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!profile) {
                profileSchema.create({userId: interaction.user.id})
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`You do not have a job`)
                        .setDescription('Get a job with \`/job new-job\`')
                        .setColor('0xa477fc')
                    ]
                })
            }
            if (profile.job === '') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`You do not have a job`)
                    .setDescription('Get a job with \`/job new-job\`')
                    .setColor('0xa477fc')
                ]
            })
            let jobQuery = profile.job
            jobQuery = jobQuery

            const search = !!allJobs.find((value) => value.name === jobQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That job does not exist')
                    .setColor('0xa744f2')
                ]
            })
            const jobFound = allJobs.find((value) => value.name === jobQuery)
            if (profile.hasBeenFired === true) {
                await profileSchema.findOneAndUpdate({
                    userId: interaction.user.id
                }, {
                    job: '',
                    hasBeenFired: false,
                    $unset: {
                        getsFiresOn: ""
                    }
                })

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You have been fired')
                        .setColor('0xa477fc')
                        .setDescription(`You have not worked for 3 days and so your boss fired you`)
                    ]
                })

                return await functions.cooldownCheck(interaction.user.id, 'job-new', 21600, interaction)
            }
            if (jobFound.pay < 250000) {
                const cldn = await functions.cooldownCheck(interaction.user.id, 'job-work', 1800, interaction)
                if (cldn === true) return
            } else if (jobFound.pay > 600000) {
                const cldn = await functions.cooldownCheck(interaction.user.id, 'job-work', 7200, interaction)
                if (cldn === true) return
            } else if (jobFound.pay >= 1000000) {
                const cldn = await functions.cooldownCheck(interaction.user.id, 'job-work', 21600, interaction)
                if (cldn === true) return
            } else {
                const cldn = await functions.cooldownCheck(interaction.user.id, 'job-work', 3600, interaction)
                if (cldn === true) return
            }

            const date = new Date()
            date.setHours(date.getHours() + 72)

            if (profile.job === 'Cook') {
                const rng = Math.round(Math.random())
                if (rng === 0) {
                    const lookupInv = await inventorySchema.findOne({
                        userId: interaction.user.id,
                        itemId: 'cheese'
                    })
                    if (!lookupInv) inventorySchema.create({
                        userId: interaction.user.id,
                        itemId: 'cheese',
                        item: 'Cheese',
                        amount: 1,
                        emoji: '<:Cheese:1005438383570571294>'
                    })
                    else {
                        lookupInv.amount += 1;
                        lookupInv.save()
                    }

                    const amount = Math.round(jobFound.pay / 100 * profile.coinMulti) + jobFound.pay
                    profile.wallet += amount
                    profile.getsFiresOn = date
                    profile.save()

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You worked as a Cook')
                            .setDescription(`You got \`${jobFound.pay.toLocaleString()}\` coins and 1 <:Cheese:1005438383570571294> Cheese`)
                            .setColor('0xa477fc')
                        ]
                    })
                } else {
                    profile.wallet += jobFound.pay
                    profile.getsFiresOn = date
                    profile.save()

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You worked as a Cook')
                            .setDescription(`You got \`${jobFound.pay.toLocaleString()}\` coins`)
                            .setColor('0xa477fc')
                        ]
                    })
                }
            }

            profile.wallet += jobFound.pay
            profile.getsFiresOn = date
            profile.save()

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`You worked as a ${profile.job}`)
                    .setDescription(`You got \`${jobFound.pay.toLocaleString()}\` coins`)
                    .setColor('0xa477fc')
                ]
            })
        }
    }
}