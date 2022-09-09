const {
    SlashCommandBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder
} = require('discord.js')
const profileSchema = require('../../models/userProfile')
const gameSchema = require('../../models/inGame')
const functions = require('../../commandFunctions')

module.exports = {
    id: 'game',
    data: new SlashCommandBuilder()
        .setName('game')
        .setDMPermission(false)
        .setDescription('Play a game for some extra cash')
        .addSubcommand(option =>
            option.setName('rps')
            .setDescription('Play a game of rock, paper, scissors')
            .addStringOption(option =>
                option.setName('bet')
                .setDescription('The amount you are betting')
                .setRequired(true)
            )

            .addUserOption(option =>
                option.setName('user')
                .setDescription('The user to play against')
            )
        )
        .addSubcommand(option =>
            option.setName('snake-eyes')
            .setDescription('Will you get snake eyes?')
            .addStringOption(option =>
                option.setName('bet')
                .setDescription('The amount you are betting')
                .setRequired(true)
            )
        )

        .addSubcommand(option =>
            option.setName('slots')
            .setDescription('Test your luck')
            .addStringOption(option =>
                option.setName('bet')
                .setDescription('The amount you are betting')
                .setRequired(true)
            )
        ),

    async execute(interaction, client) {
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'game', 12, interaction)
        if (cldn === true) return
        const user = interaction.options.getUser('user')
        functions.createRecentCommand(interaction.user.id, 'game', `USER: ${user}`, interaction)

        await interaction.deferReply()

        const check1 = await gameSchema.findOne({
            userId: interaction.user.id
        })
        const check2 = await gameSchema.findOne({
            inGameWithId: interaction.user.id
        })

        if (check1 || check2) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You are in a game already')
                .setColor('0xa477fc')
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Go to')
                    .setStyle('Link')
                    .setURL(`${check1 ? check1.message : check2.message}`)
                )
            ]
        })


        let userProfileUser = await profileSchema.findOne({
            userId: interaction.user.id
        })
        if (!userProfileUser) userProfileUser = await profileSchema.create({
            userId: interaction.user.id
        })

        if (interaction.options.getSubcommand() === 'rps') {
            let userProfileOpponent
            if (user) {
                const check3 = await gameSchema.findOne({
                    userId: user.id
                })
                const check4 = await gameSchema.findOne({
                    inGameWithId: user.id
                })

                if (check3 || check4) return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This user is in a game already')
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Go to')
                            .setStyle('Link')
                            .setURL(`${check3 ? check3.message : check4.message}`)
                        )
                    ]
                })

                userProfileOpponent = await profileSchema.findOne({
                    userId: interaction.user.id
                })
                if (!userProfileOpponent) userProfileOpponent = await profileSchema.create({
                    userId: interaction.user.id
                })
            }
            const choices = ['Rock', 'Paper', 'Scissors']
            let amountBetting = interaction.options.getString('bet')
            amountBetting = amountBetting.replaceAll(',', '')
            if (amountBetting < 1 || !Number.isInteger(Number(amountBetting))) {
                if (amountBetting && amountBetting.toLowerCase().includes('k')) {
                    const value = amountBetting.replace(/k/g, '');
                    if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Bets must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000;
                    }
                } else if (amountBetting && amountBetting.toLowerCase().includes('m')) {
                    const value = amountBetting.replace(/m/g, '');
                    if (!Number.isInteger(Number(value * 1000000)) || isNaN(value * 1000000)) {
                        return i.editReply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Bets must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000000;
                    }
                } else {
                    return i.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Bets must be a whole number')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })
                }
            }
            if (amountBetting < 50000 || amountBetting > 5000000) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Something went wrong')
                    .setDescription(`You can only bet between 50k and 5m coins`)
                    .setColor('0xa477fc')
                ]
            })

            if (userProfileUser.wallet < amountBetting) amountBetting = userProfileUser.wallet

            if (user) {
                if (!userProfileOpponent) return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This user is too poor to play')
                        .setColor('0xa477fc')
                    ]
                })
                if (userProfileOpponent.wallet < amountBetting) return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This user is too poor to play')
                        .setColor('0xa477fc')
                    ]
                })

                let waitingForUsers = []
                waitingForUsers.push(`<@${interaction.user.id}>`)
                waitingForUsers.push(`<@${user.id}>`)

                let choiceEmbed = await interaction.editReply({
                    content: `${waitingForUsers.join(', ')}`,
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('RPS - What would you like to choose')
                        .setDescription(`**You are both betting ${parseInt(amountBetting).toLocaleString()} coins**\nWinner will get ${(parseInt(amountBetting) * 2).toLocaleString()} coins` +
                            `\n\nWaiting for ${waitingForUsers.join(', ')} to choose an option`)
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('rock')
                            .setEmoji('🪨')
                            .setLabel('Rock')
                            .setStyle('Secondary'),

                            new ButtonBuilder()
                            .setCustomId('paper')
                            .setEmoji('📰')
                            .setLabel('Paper')
                            .setStyle('Secondary'),

                            new ButtonBuilder()
                            .setCustomId('scissors')
                            .setEmoji('✂️')
                            .setLabel('Scissors')
                            .setStyle('Secondary'),
                        ),

                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Cancel')
                            .setCustomId('cancel')
                            .setStyle('Danger')
                        )
                    ]
                })

                const game = await gameSchema.create({
                    userId: interaction.user.id,
                    inGameWithId: user.id,
                    message: choiceEmbed.url
                })

                const collector = await choiceEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 20000
                })

                let collected = false
                let userChoice
                let opponentChoice
                collector.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id && i.user.id !== user.id) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    i.deferUpdate()
                    collected = true
                    collector.resetTimer()

                    if (i.user.id === interaction.user.id) {
                        if (i.customId === 'rock') userChoice = 'Rock'
                        else if (i.customId === 'paper') userChoice = 'Paper'
                        else if (i.customId === 'scissors') userChoice = 'Scissors'
                        else if (i.customId === 'cancel') {
                            game.delete()
                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('Canceled')
                                    .setDescription(`${i.user} canceled the game`)
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }

                        const index = waitingForUsers.indexOf(`<@${i.user.id}>`)
                        if (index > -1) {
                            waitingForUsers.splice(index, 1)
                        }

                        if (waitingForUsers.length !== 0) {
                            choiceEmbed = await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - What would you like to choose')
                                    .setDescription(`**You are both betting ${parseInt(amountBetting).toLocaleString()} coins**\nWinner will get ${(parseInt(amountBetting) * 2).toLocaleString()} coins` +
                                        `\n\nWaiting for ${waitingForUsers.join(', ')} to choose an option`)
                                    .setColor('0xa477fc')
                                ],
                            })
                        }
                    }
                    if (i.user.id === user.id) {
                        if (i.customId === 'rock') opponentChoice = 'Rock'
                        else if (i.customId === 'paper') opponentChoice = 'Paper'
                        else if (i.customId === 'scissors') opponentChoice = 'Scissors'
                        else if (i.customId === 'cancel') {
                            game.delete()
                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('Canceled')
                                    .setDescription(`${i.user} canceled the game`)
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }

                        const index = waitingForUsers.indexOf(`<@${i.user.id}>`)
                        if (index > -1) {
                            waitingForUsers.splice(index, 1)
                        }

                        if (waitingForUsers.length !== 0) {
                            choiceEmbed = await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - What would you like to choose')
                                    .setDescription(`**You are both betting ${parseInt(amountBetting).toLocaleString()} coins**\nWinner will get ${(parseInt(amountBetting) * 2).toLocaleString()} coins` +
                                        `\n\nWaiting for ${waitingForUsers.join(', ')} to choose an option`)
                                    .setColor('0xa477fc')
                                ],
                            })
                        }
                    }

                    if (waitingForUsers.length === 0) {
                        if (userChoice === opponentChoice) {
                            game.delete()
                            return await choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - It\'s a tie!')
                                    .setDescription(
                                        `You both chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `You both get to keep your money`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }

                        if (userChoice === 'Rock') {
                            if (opponentChoice === 'Paper') {
                                game.delete()
                                userProfileUser.wallet -= amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet += amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            } else if (botChoice === 'Scissors') {
                                game.delete()
                                userProfileUser.wallet += amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet -= amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${interaction.user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${interaction.user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            }
                        } else if (userChoice === 'Paper') {
                            if (opponentChoice === 'Scissors') {
                                game.delete()
                                userProfileUser.wallet -= amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet += amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            } else if (botChoice === 'Rock') {
                                game.delete()
                                userProfileUser.wallet += amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet -= amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${interaction.user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${interaction.user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            }
                        } else if (userChoice === 'Scissors') {
                            if (opponentChoice === 'Rock') {
                                game.delete()
                                userProfileUser.wallet -= amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet += amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            } else if (opponentChoice === 'Paper') {
                                game.delete()
                                userProfileUser.wallet += amountBetting
                                userProfileUser.save()

                                userProfileOpponent.wallet -= amountBetting
                                userProfileOpponent.save()

                                return await choiceEmbed.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`RPS - ${interaction.user.tag} has won!`)
                                        .setDescription(
                                            `${user} chose ${opponentChoice === 'Rock' ? '🪨' : opponentChoice === 'Paper' ? '📰' : '✂️'}${opponentChoice} and ${interaction.user} chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                            `${interaction.user} has won ${parseInt(amountBetting).toLocaleString()}`
                                        )
                                        .setColor('0xa477fc')
                                    ],
                                    components: []
                                })
                            }
                        }
                    }

                })

                collector.on('end', async () => {
                    if (collected === true) return

                    game.delete()
                    choiceEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Timed out')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                })

            } else {
                let botChoice = choices[Math.floor(Math.random() * choices.length)]

                const choiceEmbed = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('RPS - What would you like to choose')
                        .setDescription(`You are betting ${parseInt(amountBetting).toLocaleString()}`)
                        .setColor('0xa477fc')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('rock')
                            .setEmoji('🪨')
                            .setLabel('Rock')
                            .setStyle('Secondary'),

                            new ButtonBuilder()
                            .setCustomId('paper')
                            .setEmoji('📰')
                            .setLabel('Paper')
                            .setStyle('Secondary'),

                            new ButtonBuilder()
                            .setCustomId('scissors')
                            .setEmoji('✂️')
                            .setLabel('Scissors')
                            .setStyle('Secondary'),
                        ),

                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Cancel')
                            .setCustomId('cancel')
                            .setStyle('Danger')
                        )
                    ]
                })

                const game = await gameSchema.create({
                    userId: interaction.user.id,
                    message: choiceEmbed.url
                })

                const collector = await choiceEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 15000
                })

                let collected = false
                collector.on('collect', async (i) => {
                    if (i.user.id !== interaction.user.id) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    i.deferUpdate()
                    collected = true
                    collector.stop()

                    let userChoice
                    if (i.customId === 'rock') userChoice = 'Rock'
                    else if (i.customId === 'paper') userChoice = 'Paper'
                    else if (i.customId === 'scissors') userChoice = 'Scissors'
                    else if (i.customId === 'cancel') {
                        game.delete()
                        return choiceEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Canceled')
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })
                    }

                    if (userChoice === botChoice) {
                        game.delete()
                        return choiceEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('RPS - It\'s a tie!')
                                .setDescription(
                                    `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you also chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                    `I guess I should let you keep your ${parseInt(amountBetting).toLocaleString()}`
                                )
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })
                    }

                    if (userChoice === 'Rock') {
                        if (botChoice === 'Paper') {
                            game.delete()
                            userProfileUser.wallet -= amountBetting
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - I won')
                                    .setDescription(
                                        `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Thanks for your ${parseInt(amountBetting).toLocaleString()} :)`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        } else if (botChoice === 'Scissors') {
                            game.delete()
                            const amountWon = Math.round((amountBetting / 100) * 75)
                            userProfileUser.wallet += amountWon
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - Aww i lost >:(')
                                    .setDescription(
                                        `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Enjoy your free ${parseInt(amountWon).toLocaleString()}`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }
                    } else if (userChoice === 'Paper') {
                        if (botChoice === 'Scissors') {
                            game.delete()
                            userProfileUser.wallet -= amountBetting
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - I won')
                                    .setDescription(
                                        `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Thanks for your ${parseInt(amountBetting).toLocaleString()} :)`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        } else if (botChoice === 'Rock') {
                            game.delete()
                            const amountWon = Math.round((amountBetting / 100) * 75)
                            userProfileUser.wallet += amountWon
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - Aww i lost >:(')
                                    .setDescription(
                                        `I choice ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Enjoy your free ${parseInt(amountWon).toLocaleString()}`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }
                    } else if (userChoice === 'Scissors') {
                        if (botChoice === 'Rock') {
                            game.delete()
                            userProfileUser.wallet -= amountBetting
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - I won')
                                    .setDescription(
                                        `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Thanks for your ${parseInt(amountBetting).toLocaleString()} :)`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        } else if (botChoice === 'Paper') {
                            game.delete()
                            const amountWon = Math.round((amountBetting / 100) * 75)
                            userProfileUser.wallet += amountWon
                            userProfileUser.save()

                            return choiceEmbed.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('RPS - Aww i lost >:(')
                                    .setDescription(
                                        `I chose ${botChoice === 'Rock' ? '🪨' : botChoice === 'Paper' ? '📰' : '✂️'}${botChoice} and you chose ${userChoice === 'Rock' ? '🪨' : userChoice === 'Paper' ? '📰' : '✂️'}${userChoice}\n` +
                                        `Enjoy your free ${parseInt(amountWon).toLocaleString()}`
                                    )
                                    .setColor('0xa477fc')
                                ],
                                components: []
                            })
                        }
                    }
                })

                collector.on('end', async () => {
                    if (collected === true) return

                    game.delete()
                    choiceEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Timed out')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                })
            }
        } else if (interaction.options.getSubcommand() === 'snake-eyes') {
            let amountBetting = interaction.options.getString('bet')
            amountBetting = amountBetting.replaceAll(',', '')
            if (amountBetting < 1 || !Number.isInteger(Number(amountBetting))) {
                if (amountBetting && amountBetting.toLowerCase().includes('k')) {
                    const value = amountBetting.replace(/k/g, '');
                    if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                        return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Payments must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000;
                    }
                } else if (amountBetting && amountBetting.toLowerCase().includes('m')) {
                    const value = amountBetting.replace(/m/g, '');
                    if (!Number.isInteger(Number(value * 1000000)) || isNaN(value * 1000000)) {
                        return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Payments must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000000;
                    }
                } else {
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Payments must be a whole number')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })
                }
            }
            if (amountBetting < 50000 || amountBetting > 5000000) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Something went wrong')
                    .setDescription(`You can only bet between 50k and 5m coins`)
                    .setColor('0xa477fc')
                ]
            })

            if (userProfileUser.wallet < amountBetting) amountBetting = userProfileUser.wallet

            const die = [
                '<:Dice1:1014256301787861103>',
                '<:Dice2:1014256303163588658>',
                '<:Dice3:1014256307961856040>',
                '<:Dice4:1014256309593460776>',
                '<:Dice5:1014256310713327747>',
                '<:Dice6:1014256312755961856>'
            ]
            const eye1 = Math.floor(Math.random() * (6 - 1) + 1)
            const eye2 = Math.floor(Math.random() * (6 - 1) + 1)

            let totalEyes = 0

            if (eye1 === 1) totalEyes++
            if (eye2 === 1) totalEyes++

            const generating = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Snake Eyes')
                    .setDescription(`<a:DiceAnimated:1014256653073399838> <a:DiceAnimated:1014256653073399838>`)
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })
            setTimeout(() => {
                if (totalEyes === 2) {
                    const amountWon = Math.round((amountBetting / 100) * 75)
                    userProfileUser.wallet += amountWon
                    userProfileUser.save()

                    generating.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Snake Eyes')
                            .setDescription(`${die[eye1 - 1]} - ${die[eye2 - 1]}\nNice work! You got snake eyes. You won ${parseInt(amountWon).toLocaleString()} coins`)
                            .setColor('0xa477fc')
                        ]
                    })
                } else if (totalEyes === 1) {
                    const amountWon = Math.round((amountBetting / 100) * 50)
                    userProfileUser.wallet += amountWon
                    userProfileUser.save()

                    generating.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Snake Eyes')
                            .setDescription(`${die[eye1 - 1]} ${die[eye2 - 1]}\nAlright I guess. You got 1 eye. You won ${parseInt(amountWon).toLocaleString()} coins`)
                            .setColor('0xa477fc')
                        ]
                    })
                } else if (totalEyes === 0) {
                    userProfileUser.wallet -= amountBetting
                    userProfileUser.save()

                    generating.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Snake Eyes')
                            .setDescription(`${die[eye1 - 1]} ${die[eye2 - 1]}\nAww you didn't get any snake eyes. You won nothing and lost ${parseInt(amountBetting).toLocaleString()}`)
                            .setColor('0xa477fc')
                        ]
                    })
                }
            }, 3000)
        } else if (interaction.options.getSubcommand()) {
            let amountBetting = interaction.options.getString('bet')
            amountBetting = amountBetting.replaceAll(',', '')
            if (amountBetting < 1 || !Number.isInteger(Number(amountBetting))) {
                if (amountBetting && amountBetting.toLowerCase().includes('k')) {
                    const value = amountBetting.replace(/k/g, '');
                    if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                        return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Payments must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000;
                    }
                } else if (amountBetting && amountBetting.toLowerCase().includes('m')) {
                    const value = amountBetting.replace(/m/g, '');
                    if (!Number.isInteger(Number(value * 1000000)) || isNaN(value * 1000000)) {
                        return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Payments must be a whole number')
                                .setColor('0xa477fc')
                            ],
                            ephemeral: true
                        })
                    } else {
                        amountBetting = value * 1000000;
                    }
                } else {
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Payments must be a whole number')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })
                }
            }
            if (amountBetting < 50000 || amountBetting > 5000000) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Something went wrong')
                    .setDescription(`You can only bet between 50k and 5m coins`)
                    .setColor('0xa477fc')
                ]
            })

            if (userProfileUser.wallet < amountBetting) amountBetting = userProfileUser.wallet

            const die = [
                ':money_with_wings:',
                ':moneybag:',
                ':gem:',
                ':coin:',
                ':pound:',
            ]
            const d1 = Math.floor(Math.random() * (5 - 1) + 1)
            const d2 = Math.floor(Math.random() * (5 - 1) + 1)
            const d3 = Math.floor(Math.random() * (5 - 1) + 1)

            const playEmbed = new EmbedBuilder()
                .setColor('0xa477fc')
                .setTitle('Slots')
                .setDescription(`<a:AnimatedSlots:1014451431635423233> <a:AnimatedSlots:1014451431635423233> <a:AnimatedSlots:1014451431635423233>`)

            const firstSlot = new EmbedBuilder()
                .setTitle('Slots')
                .setColor('0xa477fc')
                .setDescription(`${die[d1]} <a:AnimatedSlots:1014451431635423233> <a:AnimatedSlots:1014451431635423233>`)

            const secondSlot = new EmbedBuilder()
                .setTitle('Slots')
                .setColor('0xa477fc')
                .setDescription(`${die[d1]} ${die[d2]} <a:AnimatedSlots:1014451431635423233>`)

            const thirdSlot = new EmbedBuilder()
                .setTitle('Slots')
                .setColor('0xa477fc')
                .setDescription(`${die[d1]} ${die[d2]} ${die[d3]}`)

            const spinner = await interaction.editReply({
                embeds: [playEmbed],
                fetchReply: true
            })
            setTimeout(() => {
                spinner.edit({
                    embeds: [firstSlot]
                })
            }, 900)
            setTimeout(() => {
                spinner.edit({
                    embeds: [secondSlot]
                })
            }, 900)

            if (d2 !== d1 && d2 !== d3) {
                userProfileUser.wallet -= amountBetting
                userProfileUser.save()

                thirdSlot.setDescription(`${die[d1]} ${die[d2]} ${die[d3]}\nYou lost. Thanks for that ${parseInt(amountBetting).toLocaleString()}`).setTitle('Slots - You lost!')

                setTimeout(() => {
                    spinner.edit({
                        embeds: [thirdSlot]
                    })
                }, 900)

            } else if (d1 === d2 && d1 === d3) {
                const amountWon = Math.round((amountBetting / 100) * 75)
                userProfileUser.wallet += amountWon
                userProfileUser.save()

                thirdSlot.setDescription(`${die[d1]} ${die[d2]} ${die[d3]}\n Jackpot!. You got won ${parseInt(amountWon).toLocaleString()}`).setTitle('Slots - Jackpot!')

                setTimeout(() => {
                    spinner.edit({
                        embeds: [thirdSlot]
                    })
                }, 900)
            } else {
                const amountWon = Math.round((amountBetting / 100) * 50)
                userProfileUser.wallet += amountWon
                userProfileUser.save()

                thirdSlot.setDescription(`${die[d1]} ${die[d2]} ${die[d3]}\n You kinda won. You got won ${parseInt(amountWon).toLocaleString()}`).setTitle('Slots - You Won!')

                setTimeout(() => {
                    spinner.edit({
                        embeds: [thirdSlot]
                    })
                }, 900)
            }
        }
    }
}