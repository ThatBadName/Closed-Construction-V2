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
            const message = await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                    .setDescription('The bot is proccessing your request. Please be patient')
                ],
                fetchReply: true
            })
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
                    .setDescription(`**Bio:** ${newProfile.bio}\n**Badges**: None\n**Rank**: Regular`)
                    .setFields({
                        name: 'Level',
                        value: `Bot Level: \`${newProfile.level}\`\nPlanet Level: \`${newProfile.planetLevel}\``,
                        inline: true
                    }, {
                        name: 'XP',
                        value: `Bot XP: \`${newProfile.xp}/${newProfile.requiredXp}\` (\`${Math.round(newProfile.xp / newProfile.requiredXp * 100)}%\`)\nPlanet XP: \`${profile.planetXp}/${profile.requiredPlanetXp}\` (\`${Math.round(profile.planetXp / profile.requiredPlanetXp * 100)}%\`)`,
                        inline: true
                    }, {
                        name: 'Balance',
                        value: `Wallet: \`${newProfile.wallet.toLocaleString()}\`\nBank: \`${newProfile.bank.toLocaleString()}/${newProfile.maxBank.toLocaleString()}\` (\`${newProfile.bank / newProfile.maxBank * 100}%\`)\nMultiplier: \`${newProfile.coinMulti.toLocaleString()}%\`\nXP Boost: \`${newProfile.xpBoost.toLocaleString()}%\`\nCurrent Planet: \`${newProfile.currentPlanet}\``,
                        inline: true
                    })

                message.edit({
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
                .setDescription(`**Bio:** ${profile.bio}\n**Badges:** ${invItems.length === 0 ? 'None' : invItems}\n**Rank**: ${profile.developer === true ? '<:developer:995407005864955924> Developer' : `${profile.botAdmin === true ? '<:botAdmin:996186649191002192> Bot Admin' : `${profile.botModerator === true ? '<:botModerator:996136262064939098> Bot Moderator' : 'Regular'}`}`}`)
                .setFields({
                    name: 'Level',
                    value: `Bot Level: \`${profile.level}\`\nPlanet Level: \`${profile.planetLevel}\``,
                    inline: true
                }, {
                    name: 'XP',
                    value: `Bot XP: \`${profile.xp}/${profile.requiredXp}\` (\`${Math.round(profile.xp / profile.requiredXp * 100)}%\`)\nPlanet XP: \`${profile.planetXp}/${profile.requiredPlanetXp}\` (\`${Math.round(profile.planetXp / profile.requiredPlanetXp * 100)}%\`)`,
                    inline: true
                }, {
                    name: 'Numbers',
                    value: `Wallet: \`${profile.wallet.toLocaleString()}\`\nBank: \`${profile.bank.toLocaleString()}/${profile.maxBank.toLocaleString()}\` (\`${profile.bank / profile.maxBank * 100}%\`)\nMultiplier: \`${profile.coinMulti.toLocaleString()}%\`\nXP Boost: \`${profile.xpBoost.toLocaleString()}%\`\nCurrent Planet: \`${profile.currentPlanet}\``,
                    inline: true
                })

            message.edit({
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
                .setLabel('Planet')
                .setStyle('SECONDARY')
                .setCustomId('planets'),

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
                        .setDescription(`**CAUTION**\nThis will wipe your entire profile from the bot. There is no going back\n\nThis includes badges and other special things you may have. If you want them back, open a ticket in the [support server](https://discord.gg/9jFqS5H43Q) and if provide enough proof and are lucky you may get them back`)

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
                                invSchema.collection.deleteMany({
                                    userId: i.user.id
                                })
                                commandCooldowns.collection.deleteMany({
                                    userId: i.user.id
                                })
                                if (result.developer === true) {
                                    profileSchema.create({
                                        userId: interaction.user.id,
                                        developer: true,
                                    })
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

                } else if (i.customId === 'planets') {
                    i.deferUpdate()
                    let result = await profileSchema.findOne({userId: interaction.user.id})
                    if (!result) userProfile = await profileSchema.create({userId: interaction.user.id})
                    else userProfile = result
                    const returnButton = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Return')
                        .setStyle('PRIMARY')
                        .setCustomId('planet-return')
                    )
                    const planetButtons1 = new MessageActionRow()
                    const planetButtons2 = new MessageActionRow()
                    const planetButtons3 = new MessageActionRow()
                    if (userProfile.planetLevel >= 1 && userProfile.currentPlanet !== 'Earth') planetButtons1.addComponents(new MessageButton().setLabel('Earth').setStyle('SECONDARY').setCustomId('earth'))
                    else planetButtons1.addComponents(new MessageButton().setLabel('Earth').setStyle('SECONDARY').setCustomId('earth').setDisabled(true))

                    if (userProfile.planetLevel >= 2 && userProfile.currentPlanet !== 'Mars') planetButtons1.addComponents(new MessageButton().setLabel('Mars').setStyle('SECONDARY').setCustomId('mars'))
                    else planetButtons1.addComponents(new MessageButton().setLabel('Mars').setStyle('SECONDARY').setCustomId('mars').setDisabled(true))

                    if (userProfile.planetLevel >= 3 && userProfile.currentPlanet !== 'Iversium') planetButtons1.addComponents(new MessageButton().setLabel('Iversium').setStyle('SECONDARY').setCustomId('iversium'))
                    else planetButtons1.addComponents(new MessageButton().setLabel('Iversium').setStyle('SECONDARY').setCustomId('iversium').setDisabled(true))

                    if (userProfile.planetLevel >= 4 && userProfile.currentPlanet !== 'Inversion') planetButtons1.addComponents(new MessageButton().setLabel('Inversion').setStyle('SECONDARY').setCustomId('inversion'))
                    else planetButtons1.addComponents(new MessageButton().setLabel('Inversion').setStyle('SECONDARY').setCustomId('inversion').setDisabled(true))

                    if (userProfile.planetLevel >= 5 && userProfile.currentPlanet !== 'SchlasttTone') planetButtons1.addComponents(new MessageButton().setLabel('SchlasttTone').setStyle('SECONDARY').setCustomId('schlastttone'))
                    else planetButtons1.addComponents(new MessageButton().setLabel('SchlasttTone').setStyle('SECONDARY').setCustomId('schlastttone').setDisabled(true))

                    if (userProfile.planetLevel >= 6 && userProfile.currentPlanet !== 'Polaris') planetButtons2.addComponents(new MessageButton().setLabel('Polaris').setStyle('SECONDARY').setCustomId('polaris'))
                    else planetButtons2.addComponents(new MessageButton().setLabel('Polaris').setStyle('SECONDARY').setCustomId('polaris').setDisabled(true))

                    if (userProfile.planetLevel >= 7 && userProfile.currentPlanet !== 'Cycnus') planetButtons2.addComponents(new MessageButton().setLabel('Cycnus').setStyle('SECONDARY').setCustomId('cycnus'))
                    else planetButtons2.addComponents(new MessageButton().setLabel('Cycnus').setStyle('SECONDARY').setCustomId('cycnus').setDisabled(true))

                    if (userProfile.planetLevel >= 8 && userProfile.currentPlanet !== 'Ascalaphus') planetButtons2.addComponents(new MessageButton().setLabel('Ascalaphus').setStyle('SECONDARY').setCustomId('ascalaphus'))
                    else planetButtons2.addComponents(new MessageButton().setLabel('Ascalaphus').setStyle('SECONDARY').setCustomId('ascalaphus').setDisabled(true))

                    if (userProfile.planetLevel >= 9 && userProfile.currentPlanet !== 'Minerva') planetButtons2.addComponents(new MessageButton().setLabel('Minerva').setStyle('SECONDARY').setCustomId('minerva'))
                    else planetButtons2.addComponents(new MessageButton().setLabel('Minerva').setStyle('SECONDARY').setCustomId('minerva').setDisabled(true))

                    if (userProfile.planetLevel >= 10 && userProfile.currentPlanet !== 'Nestor') planetButtons2.addComponents(new MessageButton().setLabel('Nestor').setStyle('SECONDARY').setCustomId('nestor'))
                    else planetButtons2.addComponents(new MessageButton().setLabel('Nestor').setStyle('SECONDARY').setCustomId('nestor').setDisabled(true))

                    if (userProfile.planetLevel >= 11 && userProfile.currentPlanet !== 'Hesperus') planetButtons3.addComponents(new MessageButton().setLabel('Hesperus').setStyle('SECONDARY').setCustomId('hesperus'))
                    else planetButtons3.addComponents(new MessageButton().setLabel('Hesperus').setStyle('SECONDARY').setCustomId('hesperus').setDisabled(true))

                    if (userProfile.planetLevel >= 12 && userProfile.currentPlanet !== 'Ceyx') planetButtons3.addComponents(new MessageButton().setLabel('Ceyx').setStyle('SECONDARY').setCustomId('ceyx'))
                    else planetButtons3.addComponents(new MessageButton().setLabel('Ceyx').setStyle('SECONDARY').setCustomId('ceyx').setDisabled(true))

                    if (userProfile.planetLevel >= 13 && userProfile.currentPlanet !== 'Vesta') planetButtons3.addComponents(new MessageButton().setLabel('Vesta').setStyle('SECONDARY').setCustomId('vesta'))
                    else planetButtons3.addComponents(new MessageButton().setLabel('Vesta').setStyle('SECONDARY').setCustomId('vesta').setDisabled(true))

                    if (userProfile.planetLevel >= 14 && userProfile.currentPlanet !== 'Pirithous') planetButtons3.addComponents(new MessageButton().setLabel('Pirithous').setStyle('SECONDARY').setCustomId('pirithous'))
                    else planetButtons3.addComponents(new MessageButton().setLabel('Pirithous').setStyle('SECONDARY').setCustomId('pirithous').setDisabled(true))

                    if (userProfile.planetLevel >= 15 && userProfile.currentPlanet !== 'Bad\'s Kingdom') planetButtons3.addComponents(new MessageButton().setLabel('Bad\'s Kingdom').setStyle('SECONDARY').setCustomId('bad-kingdom'))
                    else planetButtons3.addComponents(new MessageButton().setLabel('Bad\'s Kingdom').setStyle('SECONDARY').setCustomId('bad-kingdom').setDisabled(true))
                    
                    const profileUpdatePlanetEmbed = new MessageEmbed()
                    .setTitle('Press the buttons bellow to switch planets')
                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                    .setColor('0xa744fc')
                    editMessage.edit({
                        embeds: [profileUpdatePlanetEmbed],
                        components: [planetButtons1, planetButtons2, planetButtons3, returnButton],
                        fetchReply: true
                    })

                    const planetCollector = await editMessage.createMessageComponentCollector({
                        type: 'BUTTON',
                        time: 10000
                    })

                    let collected = false
                    let onPlanetPage = true
                    planetCollector.on('collect', async(int) => {
                        collected = true
                        int.deferUpdate()
                        planetCollector.resetTimer()
                        collector.resetTimer()
                        if (int.customId === 'earth') {
                            planetButtons1.components[0].setDisabled(true)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Earth'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'mars') {
                            planetButtons1.components[1].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Mars'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'iversium') {
                            planetButtons1.components[2].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Iversium'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'inversion') {
                            planetButtons1.components[3].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Inversion'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'schlastttone') {
                            planetButtons1.components[4].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'SchlasttTone'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'polaris') {
                            planetButtons2.components[0].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Polaris'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'cycnus') {
                            planetButtons2.components[1].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Cycnus'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'ascalaphus') {
                            planetButtons2.components[2].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Ascalaphus'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'minerva') {
                            planetButtons2.components[3].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Minerva'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'nestor') {
                            planetButtons2.components[4].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Nestor'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'hesperus') {
                            planetButtons3.components[0].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Hesperus'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'ceyx') {
                            planetButtons3.components[1].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Ceyx'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'vesta') {
                            planetButtons3.components[2].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Vesta'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'pirithous') {
                            planetButtons3.components[3].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Bad\'s Kingdom') planetButtons3.components[4].setDisabled(false)
                            userProfile.currentPlanet = 'Pirithous'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        } else if (int.customId === 'bad-kingdom') {
                            planetButtons3.components[4].setDisabled(true)
                            if (userProfile.currentPlanet === 'Earth') planetButtons1.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Mars') planetButtons1.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Iversium') planetButtons1.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Inversion') planetButtons1.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'SchlasttTone') planetButtons1.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Polaris') planetButtons2.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Cycnus') planetButtons2.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ascalaphus') planetButtons2.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Minerva') planetButtons2.components[3].setDisabled(false)
                            if (userProfile.currentPlanet === 'Hesperus') planetButtons3.components[0].setDisabled(false)
                            if (userProfile.currentPlanet === 'Ceyx') planetButtons3.components[1].setDisabled(false)
                            if (userProfile.currentPlanet === 'Nestor') planetButtons2.components[4].setDisabled(false)
                            if (userProfile.currentPlanet === 'Vesta') planetButtons3.components[2].setDisabled(false)
                            if (userProfile.currentPlanet === 'Pirithous') planetButtons3.components[3].setDisabled(false)
                            userProfile.currentPlanet = 'Bad\'s Kingdom'
                            userProfile.save()
                            editMessage.edit({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Press the buttons bellow to switch planets')
                                    .setDescription(`**Current Planet**: \`${userProfile.currentPlanet}\`\n**Planet Level**: \`${userProfile.planetLevel}\`\n**Planet XP**: \`${userProfile.planetXp}/${userProfile.requiredPlanetXp}\` (\`${Math.round(userProfile.planetXp / userProfile.requiredPlanetXp * 100)}%\`)`)
                                    .setColor('0xa744fc') 
                                ],
                                components: [planetButtons1, planetButtons2, planetButtons3, returnButton]
                            })
                        }

                        else if (int.customId === 'planet-return') {
                            collected = true
                            onPlanetPage = false
                            collector.resetTimer()
                            planetCollector.stop()
                            editMessage.edit({
                                embeds: [editEmbed],
                                components: [row1]
                            })
                        }
                    })
                    planetCollector.on('end', async() => {
                        if  (onPlanetPage === false) return
                        editMessage.edit({
                            embeds: [editEmbedTimeout],
                            components: []
                        })
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