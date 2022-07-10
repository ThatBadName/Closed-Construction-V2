const profileSchema = require('../models/userProfile')
const commandCooldowns = require('../models/cooldowns')
const invSchema = require('../models/inventorySchema')
const {
    MessageEmbed,
    Modal,
    TextInputComponent,
    MessageActionRow,
    MessageButton
} = require('discord.js')

module.exports = {
    name: 'profile',
    description: 'View and manage your profile',
    category: 'Economy',
    slash: true,
    guildOnly: true,
    options: [{
            name: 'view',
            description: 'View a users profile',
            type: 'SUB_COMMAND',
            options: [{
                name: 'user',
                description: 'The user who\'s profile to view',
                type: 'USER',
                required: false
            }]
        },
        {
            name: 'edit',
            description: 'Edit your profile',
            type: 'SUB_COMMAND',
        }
    ],
    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'profile', 3, interaction)
        if (cldn === true) return

        if (interaction.options.getSubcommand() === 'view') {
            functions.createRecentCommand(interaction.user.id, 'profile-view', `None`, interaction)
            const userToView = interaction.options.getUser('user') || interaction.user
            const profile = await profileSchema.findOne({
                userId: userToView.id
            })
            if (!profile) {
                const newProfile = await profileSchema.create({
                    userId: userToView.id
                })

                const profileEmbed = new MessageEmbed()
                    .setColor('0xa744f2')
                    .setThumbnail(userToView.displayAvatarURL({
                        dynamic: true,
                        size: 1024
                    }))
                    .setTitle(`${userToView.username}'s profile`)
                    .setDescription(`**Bio:** ${newProfile.bio}\n**Badges**: None`)
                    .setFields({
                        name: 'Level',
                        value: `\`${newProfile.level}\``,
                        inline: true
                    }, {
                        name: 'XP',
                        value: `\`${newProfile.xp}/${newProfile.requiredXp}\` (\`${Math.round(newProfile.xp / newProfile.requiredXp * 100)}%\`)`,
                        inline: true
                    }, {
                        name: 'Balance',
                        value: `Wallet: \`${newProfile.wallet.toLocaleString()}\`\nBank: \`${newProfile.bank.toLocaleString()}/${newProfile.maxBank.toLocaleString()}\` (\`${newProfile.bank / newProfile.maxBank * 100}%\`)\nMultiplier: \`${newProfile.coinMulti.toLocaleString()}%\``,
                        inline: true
                    })

                interaction.reply({
                    embeds: [profileEmbed]
                })
                return
            }

            var invArray = profile.badges.map(x => x._id)
            var invItems = createBadges(invArray).join(' ')
            const profileEmbed = new MessageEmbed()
                .setColor('0xa744f2')
                .setThumbnail(userToView.displayAvatarURL({
                    dynamic: true,
                    size: 1024
                }))
                .setTitle(`${userToView.username}'s profile`)
                .setDescription(`**Bio:** ${profile.bio}\n**Badges:** ${invItems.length === 0 ? 'None' : invItems}`)
                .setFields({
                    name: 'Level',
                    value: `\`${profile.level}\``,
                    inline: true
                }, {
                    name: 'XP',
                    value: `\`${profile.xp}/${profile.requiredXp}\` (\`${Math.round(profile.xp / profile.requiredXp * 100)}%\`)`,
                    inline: true
                }, {
                    name: 'Balance',
                    value: `Wallet: \`${profile.wallet.toLocaleString()}\`\nBank: \`${profile.bank.toLocaleString()}/${profile.maxBank.toLocaleString()}\` (\`${profile.bank / profile.maxBank * 100}%\`)\nMultiplier: \`${profile.coinMulti.toLocaleString()}%\``,
                    inline: true
                })

            interaction.reply({
                embeds: [profileEmbed]
            })

            function createBadges(array) {
                let numCount = []
                for (var i = 0; i < array.length; i++) {
                    if (profile.badges.find(badge => badge._id === array[i])) {
                        profile.badges.find(badgeName => {
                            let count = parseInt(badgeName.count)
                            if (badgeName._id === array[i]) {
                                numCount.push(count)
                            }
                        })
                    }
                    continue
                }
    
                let badgeInv = []
                for (var x = 0; x < array.length; x++) {
                    badgeInv.push(`${array[x]}`)
                }
    
                return badgeInv
            }
        } else if (interaction.options.getSubcommand() === 'edit') {
            functions.createRecentCommand(interaction.user.id, 'profile-edit', `None`, interaction)
            const checkForBio = await profileSchema.findOne({
                userId: interaction.user.id
            })
            let placeHolder
            if (!checkForBio) {
                placeHolder = 'This user has no bio'
            } else {
                placeHolder = checkForBio.bio
            }

            let firstActionRow
            let bioModel = new Modal()
                .setTitle(`Update bio`)
                .setCustomId(`model-bio`);

            const new_bio = new TextInputComponent()
                .setCustomId('new_bio')
                .setLabel("What should your new bio be?")
                .setPlaceholder(placeHolder)
                .setRequired(true)
                .setStyle('SHORT')
                .setMaxLength(100)

            firstActionRow = new MessageActionRow().addComponents(new_bio)
            bioModel.addComponents(firstActionRow)

            const row1 = new MessageActionRow()
            row1.addComponents(
                new MessageButton()
                .setLabel('Bio')
                .setStyle('SECONDARY')
                .setCustomId('bio'),

                new MessageButton()
                .setLabel('Reset')
                .setStyle('DANGER')
                .setCustomId('reset-profile')
            )

            const editEmbed = new MessageEmbed()
                .setColor('0xa744f2')
                .setTitle('Edit your profile')
                .setDescription('Choose what you want to customise')
            const editEmbedTimeout = new MessageEmbed()
                .setColor('0xa744f2')
                .setTitle('Edit your profile')
                .setDescription('Timed Out - Please run the command again')

            const editMessage = await interaction.reply({
                embeds: [editEmbed],
                components: [row1],
                fetchReply: true
            })
            const collector = await editMessage.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            })

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id)
                    return i.reply({
                        content: 'You are not owner of this button!',
                        ephemeral: true,
                    })

                if (i.customId === 'bio') {
                    i.showModal(bioModel)
                    i.awaitModalSubmit({
                            time: 60000
                        }).catch(() => {
                            editMessage.edit({
                                embeds: [editEmbedTimeout],
                                components: []
                            })
                        })
                        .then(async (interact) => {
                            if (!interact) return
                            let newBio = interact.fields.getTextInputValue('new_bio')
                            newBio = newBio.slice(0, 100)
                            const result = await profileSchema.findOne({
                                userId: interaction.user.id
                            })
                            if (!result) {
                                profileSchema.create({
                                    userId: interaction.user.id,
                                    bio: newBio
                                })
                                const bioUpdatedEmbed = new MessageEmbed()
                                    .setColor('0xa744f2')
                                    .setTitle('Edit your profile')
                                    .setDescription(`Choose what you want to customise\n\n**Latest Action:**\nUpdated bio to: \`${newBio}\``)
                                editMessage.edit({
                                    embeds: [bioUpdatedEmbed],
                                    components: [row1]
                                })
                                interact.deferUpdate()
                                collector.resetTimer()
                                placeHolder = newBio
                                functions.createRecentCommand(interaction.user.id, `profile-edit-bio`, `NEWBIO: ${newBio}`, interaction)
                            } else {
                                result.bio = newBio
                                result.save()
                                const bioUpdatedEmbed = new MessageEmbed()
                                    .setColor('0xa744f2')
                                    .setTitle('Edit your profile')
                                    .setDescription(`Choose what you want to customise\n\n**Latest Action:**\nUpdated bio to: \`${newBio}\``)
                                editMessage.edit({
                                    embeds: [bioUpdatedEmbed],
                                    components: [row1]
                                })
                                interact.deferUpdate()
                                collector.resetTimer()
                                placeHolder = newBio
                                functions.createRecentCommand(interaction.user.id, `profile-edit-bio NEWBIO: ${newBio}`, interaction)
                            }
                        })
                } else if (i.customId === 'reset-profile') {
                    const confirmEmbed = new MessageEmbed()
                        .setColor('0xff0000')
                        .setTitle('Are you sure you want to do this?')
                        .setDescription(`**CAUTION**\nThis will wipe your entire profile from the bot. There is no going back`)

                    const confirmRow = new MessageActionRow()
                    confirmRow.addComponents(
                        new MessageButton()
                        .setCustomId('confirm-delete')
                        .setLabel('Confirm')
                        .setStyle('DANGER'),

                        new MessageButton()
                        .setCustomId('cancel-reset')
                        .setLabel('Cancel')
                        .setStyle('SUCCESS')
                    )

                    const areYouSure = await i.reply({
                        embeds: [confirmEmbed],
                        components: [confirmRow],
                        fetchReply: true
                    })
                    const confirmCollector = await areYouSure.createMessageComponentCollector({
                        type: 'BUTTON',
                        time: 10000
                    })
                    confirmCollector.on('collect', async (i) => {
                        if (i.user.id !== interaction.user.id)
                            return i.reply({
                                content: 'You are not owner of this button!',
                                ephemeral: true,
                            })

                        if (i.customId === 'confirm-delete') {
                            const result = await profileSchema.findOne({
                                userId: i.user.id,
                            })
                            
                            if (!result) {
                                const profileUpdatedEmbed = new MessageEmbed()
                                    .setColor('0xa744f2')
                                    .setTitle('Edit your profile')
                                    .setDescription(`Choose what you want to customise\n\n**Latest Action:**\nFailed to delete profile - User is not in the database`)
                                editMessage.edit({
                                    embeds: [profileUpdatedEmbed],
                                    components: [row1]
                                })
                                areYouSure.delete()
                                functions.createRecentCommand(interaction.user.id, `profile-edit-reset`, `None`, interaction)
                            } else {
                                const profileUpdatedEmbed = new MessageEmbed()
                                    .setColor('0xa744f2')
                                    .setTitle('Edit your profile')
                                    .setDescription(`Choose what you want to customise\n\n**Latest Action:**\nWiped you from the database. There is no going back`)
                                editMessage.edit({
                                    embeds: [profileUpdatedEmbed],
                                    components: [row1]
                                })
                                areYouSure.delete()
                                result.delete()
                                invSchema.collection.deleteMany({userId: i.user.id})
                                commandCooldowns.collection.deleteMany({userId: i.user.id})
                                if (result.developer === true) {
                                    profileSchema.create({userId: interaction.user.id, developer: true, badges: [{_id: "<:developer:995407005864955924>"}]})
                                }
                                placeHolder = 'This user has no bio'
                            }
                        } else if (i.customId === 'cancel-reset') {
                            const profileUpdatedEmbed = new MessageEmbed()
                                .setColor('0xa744f2')
                                .setTitle('Edit your profile')
                                .setDescription(`Choose what you want to customise\n\n**Latest Action:**\nCanceled profile deletion`)
                            editMessage.edit({
                                embeds: [profileUpdatedEmbed],
                                components: [row1]
                            })
                            areYouSure.delete()
                        }
                    })

                }
            })

            collector.on('end', () => {
                editMessage.edit({
                    components: [],
                    embeds: [editEmbedTimeout]
                })
            })
        }
    }
}