const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    TextInputBuilder,
    ModalBuilder,
    ActionRow
} = require('discord.js')
const inventorySchema = require('../../models/inventorySchema')
const profileSchema = require('../../models/userProfile')
let allItems = require('../../things/items/allItems')
const xpBoostSchema = require('../../models/xpBoosts')
const activeDevCoinSchema = require('../../models/activeDevCoins')
const robMultiSchema = require('../../models/robMulti')
const items = require('../../things/items/allItems')
const {
    colours,
    emojis
} = require('../../things/constants')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use-item')
        .setDMPermission(false)
        .setDescription('Use an item')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('The item to use')
            .setRequired(true)
            .setAutocomplete(true)
            .setMaxLength(25)
        )

        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of the item to use')
            .setMinValue(1)
            .setRequired(false)
        )

        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to use the item on')
            .setRequired(false)
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item') {
            allItems = allItems.filter(item => item.usable === true)
            const focusedValue = interaction.options.getFocused()
            const choices = allItems.map(i => `${i.name},${i.id}`).sort()
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice.split(',')[0],
                    value: choice.split(',')[1]
                }))
            )
        }
    },

    async execute(interaction) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'use', 5, interaction)
        if (cldn === true) return

        await interaction.deferReply()

        let itemQuery = interaction.options.getString('item')
        itemQuery = itemQuery.toLowerCase()
        let amount = interaction.options.getInteger('amount') || 1
        if (amount < 1) amount = 1

        functions.createRecentCommand(interaction.user.id, 'use', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

        const search = !!allItems.find((value) => value.id === itemQuery)
        if (!search) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('I could not find that item')
                .setColor('0x' + colours.error)
            ]
        })
        const itemFound = allItems.find((value) => value.id === itemQuery)
        if (itemFound.usable === false) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('That item cannot be used')
                .setColor('0x' + colours.error)
            ]
        })

        let userInv = await inventorySchema.findOne({
            userId: interaction.user.id,
            itemId: itemFound.id
        })
        if (!userInv) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You do not have this item')
                .setColor('0x' + colours.error)
            ]
        })
        if (interaction.options.getUser('user')) {
            let user = interaction.options.getUser('user')
            let userProfileOther = await profileSchema.findOne({
                userId: user.id
            })
            if (!userProfileOther) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('This user does not have a bot profile')
                    .setColor('0x' + colours.error)
                ]
            })
        }

        if (amount > userInv.amount) amount = userInv.amount
        if (itemFound.id === 'berries') amount = 1
        if (itemFound.id === 'gift box') amount = 1
        if (itemFound.id !== 'dev coin' && itemFound.id !== 'scout' && itemFound.id !== 'gift box') {
            if (amount === userInv.amount) userInv.delete()
            else userInv.amount -= amount;
            userInv.save()
        }

        let userProfile = await profileSchema.findOne({
            userId: interaction.user.id
        })
        if (!userProfile) userProfile = await profileSchema.create({
            userId: interaction.user.id
        })
        if (itemFound.id === 'cheque') {
            const spaceToAdd = Math.floor(Math.random() * (10000 - 1000) + 1000) * amount
            userProfile.maxBank += spaceToAdd
            userProfile.save()

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Added bank space')
                    .setDescription(`You expanded your bank space from \`${(userProfile.maxBank - spaceToAdd).toLocaleString()}\` to \`${userProfile.maxBank.toLocaleString()}\` (+${spaceToAdd.toLocaleString()})`)
                    .setFooter({
                        text: `You used ${amount === 1 ? `1 Cheque` : `${amount.toLocaleString()} Cheques`}`
                    })
                    .setColor('0x' + colours.blend)
                ]
            })
        } else if (itemFound.id === 'xp coin') {
            const amountToAdd = Math.floor(Math.random() * (75 - 10) + 10) * amount
            userProfile.xpBoost += amountToAdd
            userProfile.save()

            const date = new Date()
            date.setHours(date.getHours() + amount)
            xpBoostSchema.create({
                userId: interaction.user.id,
                expires: date,
                increase: amountToAdd
            })
            expires = date


            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Added XP Boost')
                    .setDescription(`You have gained a \`${amountToAdd.toLocaleString()}%\` XP boost that will expire <t:${Math.round(expires.getTime() / 1000)}:R>. Your total XP boost is now \`${userProfile.xpBoost.toLocaleString()}%\``)
                    .setFooter({
                        text: `You used ${amount === 1 ? `1 Coin` : `${amount.toLocaleString()} Coins`}`
                    })
                    .setColor('0x' + colours.blend)
                ]
            })
        } else if (itemFound.id === 'dev coin') {
            const check = await activeDevCoinSchema.findOne({
                userId: interaction.user.id
            })
            if (check) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You already have a dev coin active')
                    .setColor('0x' + colours.alert)
                ]
            })

            if (amount === userInv.amount) userInv.delete()
            else userInv.amount -= 1;
            userInv.save()

            const date1 = new Date()
            date1.setHours(date1.getHours() + 12)

            activeDevCoinSchema.create({
                userId: interaction.user.id,
                expires: date1
            })

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Activated dev coin')
                    .setDescription('You used a dev coin. Your command cooldowns have been reduced by 50% (There are some exeptions). Its effects wear off in 12 hours')
                    .setColor('0x' + colours.blend)
                ]
            })
        } else if (itemFound.id === 'scout') {
            const find = await robMultiSchema.findOne({
                userId: interaction.user.id
            })
            if (find.increase > 15) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Don\'t be so greedy')
                    .setDescription('You can only have 1 scout active at once')
                    .setColor('0x' + colours.alert)
                ]
            })

            if (amount === userInv.amount) userInv.delete()
            else userInv.amount -= 1;
            userInv.save()

            const date2 = new Date()
            date2.setHours(date2.getHours() + 24)

            robMultiSchema.create({
                userId: interaction.user.id,
                expires: date2,
                increase: 15
            })

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Activated scout')
                    .setDescription('You used a scout. You will now be able to rob 15% more coins than the usual max. Its effects wear off in 24 hours')
                    .setColor('0x' + colours.blend)
                ]
            })
        } else if (itemFound.id === 'berries') {
            const rng = Math.round(Math.random() * (2 - 1) + 1)
            if (rng === 1) {
                const randomGood = Math.round(Math.random() * (3 - 1) + 1)
                if (randomGood === 1) {
                    const amountAdding = Math.round(Math.random() * (15 - 10) + 10)
                    userProfile.xpBoost += amountAdding
                    userProfile.save()

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`You got an XP Booster of \`${amountAdding.toLocaleString()}%\`. Your total XP boost is now \`${userProfile.xpBoost.toLocaleString()}%\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                } else if (randomGood === 2) {
                    const amountAdding = Math.round(Math.random() * (15 - 10) + 10)
                    userProfile.coinMulti += amountAdding
                    userProfile.save()

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`You got a Coin Multi boost of \`${amountAdding.toLocaleString()}%\`. Your total Coin Multi is now \`${userProfile.coinMulti.toLocaleString()}%\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                } else if (randomGood === 3) {
                    const amountAdding = Math.round(Math.random() * (50 - 10) + 10)
                    if (userProfile.xp + amountAdding >= userProfile.requiredXp) {
                        let reward = userProfile.coinMulti === 0 ? 5000 : Math.round(5000 / 100 * userProfile.coinMulti) + 5000
                        userProfile.xp = 0
                        userProfile.level += 1
                        userProfile.wallet += reward
                        userProfile.save()

                        if (result.dmNotifs === true) {
                            try {
                                interaction.user.send({
                                    embeds: [new EmbedBuilder().setColor('0x' + colours.blend).setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${userProfile.level.toLocaleString()}**. As a reward you have been given \`${reward.toLocaleString()}\` coins`)]
                                })
                            } catch (err) {
                                interaction.channel.send({
                                    content: `${interaction.user},`,
                                    embeds: [new EmbedBuilder().setColor('0x' + colours.blend).setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${userProfile.level.toLocaleString()}**. As a reward you have been given \`${reward.toLocaleString()}\` coins`)]
                                })
                            }
                        } else {
                            interaction.channel.send({
                                content: `${interaction.user},`,
                                embeds: [new EmbedBuilder().setColor('0x' + colours.blend).setTitle('Congrats, You leveled up!').setDescription(`You are now **level ${userProfile.level.toLocaleString()}**. As a reward you have been given \`${reward.toLocaleString()}\` coins`)]
                            })
                        }
                        functions.createNewNotif(interaction.user.id, `You are now **level ${userProfile.level.toLocaleString()}**. As a reward you have been given \`${reward.toLocaleString()}\` coins`)
                    }

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`You got some free XP \`${amountAdding.toLocaleString()}XP\`. Your total XP is now \`${userProfile.xp.toLocaleString()}\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                }
            } else {
                const randomBad = Math.round(Math.random() * (3 - 1) + 1)
                if (randomBad === 1) {
                    const amountRemoving = Math.round(Math.random() * (userProfile.wallet / 100 * 40))
                    userProfile.wallet -= amountRemoving
                    userProfile.save()

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`You felt so sick you had to go to the doctor. They charged you \`${amountRemoving.toLocaleString()}\`. Your new balance is \`${userProfile.wallet.toLocaleString()}\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                } else if (randomBad === 2) {
                    const amountRemoving = Math.round(Math.random() * (userProfile.coinMulti / 100 * 40))
                    userProfile.coinMulti -= amountRemoving
                    userProfile.save()

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`Your Coin Multi went down by \`${amountRemoving.toLocaleString()}%\`. Your new Coin Multi is \`${userProfile.coinMulti.toLocaleString()}%\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                } else if (randomBad === 3) {
                    const amountRemoving = Math.round(Math.random() * (userProfile.xpBoost / 100 * 40))
                    userProfile.xpBoost -= amountRemoving
                    userProfile.save()

                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('You ate some berries and...')
                            .setDescription(`Your XP Booster went down by \`${amountRemoving.toLocaleString()}%\`. Your new XP Booster total is \`${userProfile.xpBoost.toLocaleString()}%\``)
                            .setColor('0x' + colours.blend)
                        ]
                    })
                }
            }
        } else if (itemFound.id.includes('box') && itemFound.id !== 'gift box') {
            let boxId
            let boxName
            if (itemFound.id === 'vote box') {
                boxId = 0
                boxName = 'Vote'
            } else if (itemFound.id === 'developer box') {
                boxId = 1
                boxName = 'Developer'
            }
            const crate = await functions.generateCrateLoot(boxId)

            const amountOfCoins = crate.pop()

            let addedItems = []
            if (amountOfCoins > 0) addedItems.push(`${(amountOfCoins * amount).toLocaleString()} coins`)
            for (let i = 0; i < crate.length; ++i) {
                let itemQuery = crate[i].split('|')[0]
                itemQuery = itemQuery.toLowerCase()

                const search = !!allItems.find((value) => value.id === itemQuery)
                if (!search) continue
                const itemFound = allItems.find((value) => value.id === itemQuery)

                const checkInv = await inventorySchema.findOne({
                    userId: interaction.user.id,
                    itemId: itemFound.id
                })
                if (!checkInv) await inventorySchema.create({
                    userId: interaction.user.id,
                    itemId: itemFound.id,
                    item: itemFound.name,
                    amount: crate[i].split('|')[1] * amount,
                    emoji: itemFound.emoji
                })
                else {
                    checkInv.amount += crate[i].split('|')[1];
                    checkInv.save()
                }

                addedItems.push(`\`${crate[i].split('|')[1] * amount}x\` - ${itemFound.emoji}${itemFound.name}`)
            }
            userProfile.wallet += amountOfCoins * amount
            userProfile.save()

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${interaction.user.tag}'s loot haul`)
                    .setColor('0x' + colours.blend)
                    .setFooter({
                        text: `${amount}x ${boxName} Box${amount === 1 ? '' : 's'} opened`
                    })
                    .setDescription(addedItems.join('\n'))
                    .setThumbnail("https://i.imgur.com/ZkskRyn.png")
                ]
            })
        } else if (itemFound.id === 'gift box') {
            if (interaction.options.getUser('user')) {
                let user = interaction.options.getUser('user')
                let currentStuff = []
                let currentStuffIds = []
                let coins
                let fillingEmbed = new EmbedBuilder()
                    .setTitle('First you need to fill this gift')
                    .setDescription(`Press the buttons bellow to fill up this gift\n` +
                        `**Current Content**:\n${coins > 0 ? coins.toLocaleString() + 'coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : 'Nothing'}`)
                    .setColor('0x' + colours.blend)
                    .setFooter({
                        text: `Stage 1/2`
                    })

                let fillingButtons1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('item1')
                        .setLabel('Item 1')
                        .setStyle('Secondary'),

                        new ButtonBuilder()
                        .setCustomId('item2')
                        .setDisabled(true)
                        .setLabel('Item 2')
                        .setStyle('Secondary'),

                        new ButtonBuilder()
                        .setCustomId('item3')
                        .setDisabled(true)
                        .setLabel('Item 3')
                        .setStyle('Secondary'),

                        new ButtonBuilder()
                        .setCustomId('item4')
                        .setDisabled(true)
                        .setLabel('Item 4')
                        .setStyle('Secondary'),

                        new ButtonBuilder()
                        .setCustomId('item5')
                        .setDisabled(true)
                        .setLabel('Item 5')
                        .setStyle('Secondary')
                    )

                let fillingButtons2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('coins')
                        .setLabel('Coins')
                        .setStyle('Secondary'),

                        new ButtonBuilder()
                        .setCustomId('next')
                        .setDisabled(true)
                        .setLabel('Next Step')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle('Danger')
                    )

                const fillEmbedMessage = await interaction.editReply({
                    embeds: [
                        fillingEmbed
                    ],
                    components: [
                        fillingButtons1,
                        fillingButtons2
                    ],
                    fetchReply: true
                })

                const fillCollector = await fillEmbedMessage.createMessageComponentCollector({
                    type: 'Button',
                    time: 45000
                })

                let canceled = false
                fillCollector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id) return int.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0x' + colours.error)
                        ],
                        ephemeral: true
                    })
                    collected = true
                    if (int.customId === 'cancel') {
                        canceled = true
                        fillCollector.stop()
                        fillEmbedMessage.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Canceled')
                                .setColor('0x' + colours.blend)
                            ],
                            components: []
                        })
                    } else if (int.customId === 'coins') {
                        fillCollector.resetTimer()
                        let firstTextBox
                        let customPriceModal = new ModalBuilder()
                            .setTitle('Coins')
                            .setCustomId('coins-modal')

                        const price = new TextInputBuilder()
                            .setCustomId('coins')
                            .setLabel('How many coins are you gifting?')
                            .setMinLength(1)
                            .setMaxLength(10)
                            .setRequired(true)
                            .setStyle('Short')
                        firstTextBox = new ActionRowBuilder().addComponents(price)
                        customPriceModal.addComponents(firstTextBox)
                        int.showModal(customPriceModal)
                        fillingButtons1.components[0].setDisabled(true)
                        fillingButtons1.components[1].setDisabled(true)
                        fillingButtons1.components[2].setDisabled(true)
                        fillingButtons1.components[3].setDisabled(true)
                        fillingButtons1.components[4].setDisabled(true)
                        fillingButtons2.components[0].setDisabled(true)
                        await fillEmbedMessage.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('First you need to fill this gift')
                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                .setColor('0x' + colours.blend)
                                .setFooter({
                                    text: `Stage 1/2`
                                })
                            ],
                            components: [
                                fillingButtons1,
                                fillingButtons2
                            ]
                        })
                        let err = false
                        await int.awaitModalSubmit({
                                time: 15000
                            }).catch(() => {
                                err = true
                                int.followUp({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('You took too long to submit the modal')
                                        .setColor('0x' + colours.blend)
                                    ],
                                    ephemeral: true
                                })
                            })
                            .then(async (i) => {
                                if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                else fillingButtons1.components[0].setDisabled(true)
                                if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                else fillingButtons1.components[1].setDisabled(true)
                                if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                else fillingButtons1.components[2].setDisabled(true)
                                if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                else fillingButtons1.components[3].setDisabled(true)
                                if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                else fillingButtons1.components[4].setDisabled(true)
                                fillingButtons2.components[0].setDisabled(false)
                                if (canceled === true) return
                                await fillEmbedMessage.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('First you need to fill this gift')
                                        .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                            `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                        .setColor('0x' + colours.blend)
                                        .setFooter({
                                            text: `Stage 1/2`
                                        })
                                    ],
                                    components: [
                                        fillingButtons1,
                                        fillingButtons2
                                    ]
                                })
                                if (!i) return
                                if (err === true) return
                                await i.deferUpdate()
                                coins = i.fields.getTextInputValue('coins')
                                if (coins < 0 || !Number.isInteger(Number(coins))) {
                                    if (coins && coins.toLowerCase().includes('k')) {
                                        const value = coins.replace(/k/g, '');
                                        if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                                            if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                            else fillingButtons1.components[0].setDisabled(true)
                                            if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                            else fillingButtons1.components[1].setDisabled(true)
                                            if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                            else fillingButtons1.components[2].setDisabled(true)
                                            if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                            else fillingButtons1.components[3].setDisabled(true)
                                            if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                            else fillingButtons1.components[4].setDisabled(true)
                                            if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                            else fillingButtons2.components[1].setDisabled(true)
                                            await fillEmbedMessage.edit({
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setTitle('First you need to fill this gift')
                                                    .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                        `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                    .setColor('0x' + colours.blend)
                                                    .setFooter({
                                                        text: `Stage 1/2`
                                                    })
                                                ],
                                                components: [
                                                    fillingButtons1,
                                                    fillingButtons2
                                                ]
                                            })
                                            return i.reply({
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setTitle('Payments must be a whole number')
                                                    .setColor('0x' + colours.error)
                                                ],
                                                ephemeral: true
                                            })
                                        } else {
                                            coins = value * 1000;
                                        }
                                    } else if (coins && coins.toLowerCase().includes('m')) {
                                        const value = coins.replace(/m/g, '');
                                        if (!Number.isInteger(Number(value * 1000000)) || isNaN(value * 1000000)) {
                                            if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                            else fillingButtons1.components[0].setDisabled(true)
                                            if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                            else fillingButtons1.components[1].setDisabled(true)
                                            if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                            else fillingButtons1.components[2].setDisabled(true)
                                            if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                            else fillingButtons1.components[3].setDisabled(true)
                                            if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                            else fillingButtons1.components[4].setDisabled(true)
                                            if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                            else fillingButtons2.components[1].setDisabled(true)
                                            await fillEmbedMessage.edit({
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setTitle('First you need to fill this gift')
                                                    .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                        `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                    .setColor('0x' + colours.blend)
                                                    .setFooter({
                                                        text: `Stage 1/2`
                                                    })
                                                ],
                                                components: [
                                                    fillingButtons1,
                                                    fillingButtons2
                                                ]
                                            })
                                            return i.reply({
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setTitle('Payments must be a whole number')
                                                    .setColor('0x' + colours.error)
                                                ],
                                                ephemeral: true
                                            })
                                        } else {
                                            coins = value * 1000000;
                                        }
                                    } else {
                                        if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                        else fillingButtons1.components[0].setDisabled(true)
                                        if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                        else fillingButtons1.components[1].setDisabled(true)
                                        if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                        else fillingButtons1.components[2].setDisabled(true)
                                        if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                        else fillingButtons1.components[3].setDisabled(true)
                                        if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                        else fillingButtons1.components[4].setDisabled(true)
                                        if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                        else fillingButtons2.components[1].setDisabled(true)
                                        await fillEmbedMessage.edit({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('First you need to fill this gift')
                                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                .setColor('0x' + colours.blend)
                                                .setFooter({
                                                    text: `Stage 1/2`
                                                })
                                            ],
                                            components: [
                                                fillingButtons1,
                                                fillingButtons2
                                            ]
                                        })
                                        return i.reply({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('Payments must be a whole number')
                                                .setColor('0x' + colours.error)
                                            ],
                                            ephemeral: true
                                        })
                                    }
                                    if (coins > 100000000) coins = 100000000
                                    if (coins > userProfile.wallet) coins = userProfile.wallet
                                    if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                    else fillingButtons2.components[1].setDisabled(true)
                                }
                            })
                        fillEmbedMessage.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('First you need to fill this gift')
                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                .setColor('0x' + colours.blend)
                                .setFooter({
                                    text: `Stage 1/2`
                                })
                            ],
                            components: [
                                fillingButtons1,
                                fillingButtons2
                            ]
                        })
                    } else if (int.customId.includes('item')) {
                        let buttonId = int.customId.replace('item', '')
                        fillCollector.resetTimer()
                        if (currentStuff[buttonId - 1] !== undefined) {
                            int.deferUpdate()
                            const index = buttonId - 1
                            if (index > -1) {
                                currentStuff.splice(index, 1)
                            }
                            if (index > -1) {
                                currentStuffIds.splice(index, 1)
                            }
                            if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                            else fillingButtons1.components[0].setDisabled(true)
                            if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                            else fillingButtons1.components[1].setDisabled(true)
                            if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                            else fillingButtons1.components[2].setDisabled(true)
                            if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                            else fillingButtons1.components[3].setDisabled(true)
                            if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                            else fillingButtons1.components[4].setDisabled(true)
                            fillingButtons2.components[0].setDisabled(false)
                            if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                            else fillingButtons2.components[1].setDisabled(true)

                            await fillEmbedMessage.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('First you need to fill this gift')
                                    .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                        `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                    .setColor('0x' + colours.blend)
                                    .setFooter({
                                        text: `Stage 1/2`
                                    })
                                ],
                                components: [
                                    fillingButtons1,
                                    fillingButtons2
                                ]
                            })
                        } else {
                            let firstTextBox
                            let secondTextBox
                            let customPriceModal = new ModalBuilder()
                                .setTitle('Item')
                                .setCustomId('item-modal')

                            const item = new TextInputBuilder()
                                .setCustomId('item')
                                .setLabel('Item ID')
                                .setMinLength(1)
                                .setMaxLength(20)
                                .setRequired(true)
                                .setStyle('Short')

                            const price = new TextInputBuilder()
                                .setCustomId('amount')
                                .setLabel('How many of this item?')
                                .setMinLength(1)
                                .setMaxLength(10)
                                .setRequired(true)
                                .setStyle('Short')
                            firstTextBox = new ActionRowBuilder().addComponents(item)
                            secondTextBox = new ActionRowBuilder().addComponents(price)
                            customPriceModal.addComponents(firstTextBox, secondTextBox)
                            int.showModal(customPriceModal)
                            fillingButtons1.components[0].setDisabled(true)
                            fillingButtons1.components[1].setDisabled(true)
                            fillingButtons1.components[2].setDisabled(true)
                            fillingButtons1.components[3].setDisabled(true)
                            fillingButtons1.components[4].setDisabled(true)
                            fillingButtons2.components[0].setDisabled(true)
                            await fillEmbedMessage.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('First you need to fill this gift')
                                    .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                        `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                    .setColor('0x' + colours.blend)
                                    .setFooter({
                                        text: `Stage 1/2`
                                    })
                                ],
                                components: [
                                    fillingButtons1,
                                    fillingButtons2
                                ]
                            })
                            let itemQuery
                            let err = false
                            await int.awaitModalSubmit({
                                    time: 15000
                                }).catch(() => {
                                    err = true
                                    int.followUp({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('You took too long to submit the modal')
                                            .setColor('0x' + colours.blend)
                                        ],
                                        ephemeral: true
                                    })
                                })
                                .then(async (i) => {
                                    if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                    else fillingButtons1.components[0].setDisabled(true)
                                    if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                    else fillingButtons1.components[1].setDisabled(true)
                                    if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                    else fillingButtons1.components[2].setDisabled(true)
                                    if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                    else fillingButtons1.components[3].setDisabled(true)
                                    if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                    else fillingButtons1.components[4].setDisabled(true)
                                    fillingButtons2.components[0].setDisabled(false)
                                    if (canceled === true) return
                                    await fillEmbedMessage.edit({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('First you need to fill this gift')
                                            .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                            .setColor('0x' + colours.blend)
                                            .setFooter({
                                                text: `Stage 1/2`
                                            })
                                        ],
                                        components: [
                                            fillingButtons1,
                                            fillingButtons2
                                        ]
                                    })
                                    if (!i) return
                                    if (err === true) return
                                    await i.deferUpdate()
                                    quantity = i.fields.getTextInputValue('amount')
                                    itemQuery = i.fields.getTextInputValue('item')
                                    if (quantity < 0 || !Number.isInteger(Number(quantity))) {
                                        if (quantity && quantity.toLowerCase().includes('k')) {
                                            const value = quantity.replace(/k/g, '');
                                            if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                                                return i.followUp({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setTitle('Item quantity must be a whole number')
                                                        .setColor('0x' + colours.error)
                                                    ],
                                                    ephemeral: true
                                                })
                                            } else {
                                                quantity = value * 1000;
                                            }
                                        } else {
                                            return i.followUp({
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setTitle('Item quantity must be a whole number')
                                                    .setColor('0x' + colours.error)
                                                ],
                                                ephemeral: true
                                            })
                                        }
                                        if (quantity > 1000) quantity = 1000
                                        if (quantity < 1) quantity = 1
                                        if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                        else fillingButtons2.components[1].setDisabled(true)
                                    }
                                    itemQuery = itemQuery.toLowerCase()

                                    const search = !!items.find((value) => value.id === itemQuery)
                                    if (!search) {
                                        if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                        else fillingButtons1.components[0].setDisabled(true)
                                        if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                        else fillingButtons1.components[1].setDisabled(true)
                                        if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                        else fillingButtons1.components[2].setDisabled(true)
                                        if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                        else fillingButtons1.components[3].setDisabled(true)
                                        if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                        else fillingButtons1.components[4].setDisabled(true)
                                        if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                        else fillingButtons2.components[1].setDisabled(true)
                                        await fillEmbedMessage.edit({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('First you need to fill this gift')
                                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                .setColor('0x' + colours.blend)
                                                .setFooter({
                                                    text: `Stage 1/2`
                                                })
                                            ],
                                            components: [
                                                fillingButtons1,
                                                fillingButtons2
                                            ]
                                        })
                                        return int.followUp({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('I could not find that item')
                                                .setColor('0x' + colours.error)
                                            ],
                                            ephemeral: true
                                        })
                                    }
                                    const itemFound = items.find((value) => value.id === itemQuery)
                                    const checkInv = await inventorySchema.findOne({
                                        userId: interaction.user.id,
                                        itemId: itemFound.id
                                    })
                                    if (!checkInv) {
                                        if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                        else fillingButtons1.components[0].setDisabled(true)
                                        if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                        else fillingButtons1.components[1].setDisabled(true)
                                        if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                        else fillingButtons1.components[2].setDisabled(true)
                                        if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                        else fillingButtons1.components[3].setDisabled(true)
                                        if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                        else fillingButtons1.components[4].setDisabled(true)
                                        if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                        else fillingButtons2.components[1].setDisabled(true)
                                        await fillEmbedMessage.edit({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('First you need to fill this gift')
                                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                .setColor('0x' + colours.blend)
                                                .setFooter({
                                                    text: `Stage 1/2`
                                                })
                                            ],
                                            components: [
                                                fillingButtons1,
                                                fillingButtons2
                                            ]
                                        })
                                        return int.followUp({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('You do not have that item')
                                                .setColor('0x' + colours.error)
                                            ],
                                            ephemeral: true
                                        })
                                    }
                                    if (quantity > checkInv.amount) quantity = checkInv.amount
                                    if (currentStuffIds.includes(`${itemFound.id}`)) {
                                        if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                        else fillingButtons1.components[0].setDisabled(true)
                                        if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                        else fillingButtons1.components[1].setDisabled(true)
                                        if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                        else fillingButtons1.components[2].setDisabled(true)
                                        if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                        else fillingButtons1.components[3].setDisabled(true)
                                        if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                        else fillingButtons1.components[4].setDisabled(true)
                                        if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                        else fillingButtons2.components[1].setDisabled(true)
                                        await fillEmbedMessage.edit({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('First you need to fill this gift')
                                                .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                    `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                                .setColor('0x' + colours.blend)
                                                .setFooter({
                                                    text: `Stage 1/2`
                                                })
                                            ],
                                            components: [
                                                fillingButtons1,
                                                fillingButtons2
                                            ]
                                        })
                                        return int.followUp({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('You have already put this item in the gift')
                                                .setColor('0x' + colours.alert)
                                            ],
                                            ephemeral: true
                                        })
                                    }
                                    currentStuff.push(`${itemFound.emoji}${itemFound.name}|${itemFound.id}|${quantity}`)
                                    currentStuffIds.push(`${itemFound.id}`)
                                    if (currentStuff.length >= 0) fillingButtons1.components[0].setDisabled(false)
                                    else fillingButtons1.components[0].setDisabled(true)
                                    if (currentStuff.length >= 1) fillingButtons1.components[1].setDisabled(false)
                                    else fillingButtons1.components[1].setDisabled(true)
                                    if (currentStuff.length >= 2) fillingButtons1.components[2].setDisabled(false)
                                    else fillingButtons1.components[2].setDisabled(true)
                                    if (currentStuff.length >= 3) fillingButtons1.components[3].setDisabled(false)
                                    else fillingButtons1.components[3].setDisabled(true)
                                    if (currentStuff.length >= 4) fillingButtons1.components[4].setDisabled(false)
                                    else fillingButtons1.components[4].setDisabled(true)
                                    if (coins > 0 || currentStuff.length > 0) fillingButtons2.components[1].setDisabled(false)
                                    else fillingButtons2.components[1].setDisabled(true)
                                    await fillEmbedMessage.edit({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('First you need to fill this gift')
                                            .setDescription(`Press the buttons bellow to fill up this gift\n` +
                                                `**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                            .setColor('0x' + colours.blend)
                                            .setFooter({
                                                text: `Stage 1/2`
                                            })
                                        ],
                                        components: [
                                            fillingButtons1,
                                            fillingButtons2
                                        ]
                                    })
                                })
                        }

                    } else if (int.customId === 'next') {
                        canceled = true
                        let confirmEmbed = new EmbedBuilder()
                            .setTitle('Are you sure this is everything?')
                            .setDescription(`You are sending a gift to ${user} (\`${user.tag}\`)\n\n**Current Content**:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                            .setColor('0x' + colours.blend)
                            .setFooter({
                                text: `Stage 2/2`
                            })
                        let confirmComponents = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId('confirm')
                                .setLabel('Confirm')
                                .setStyle('Success'),

                                new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('Confirm')
                                .setStyle('Danger')
                            )

                        const confirmMessage = await fillEmbedMessage.edit({
                            embeds: [
                                confirmEmbed
                            ],
                            components: [
                                confirmComponents
                            ],
                            fetchReply: true
                        })

                        const confirmCollector = await confirmMessage.createMessageComponentCollector({
                            time: 20000,
                            type: 'Button'
                        })

                        let canceledConfirm = false
                        confirmCollector.on('collect', async (interac) => {
                            if (interac.user.id !== interaction.user.id) return interac.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('This is not for you')
                                    .setColor('0x' + colours.error)
                                ],
                                ephemeral: true
                            })
                            confirmCollector.resetTimer()
                            interac.deferUpdate()
                            if (interac.customId === 'confirm') {
                                for (let i = 0; i < currentStuffIds.length; ++i) {
                                    itemQuery = currentStuffIds[i]

                                    const search = !!items.find((value) => value.id === itemQuery)
                                    if (!search) continue
                                    const itemFound = items.find((value) => value.id === itemQuery)
                                    const checkInvGifter = await inventorySchema.findOne({
                                        userId: interaction.user.id,
                                        itemId: itemFound.id
                                    })
                                    if (checkInvGifter.amount - quantity === 0) checkInvGifter.delete()
                                    else {
                                        checkInvGifter.amount -= quantity
                                        checkInvGifter.save()
                                    }

                                    const checkInvReciever = await inventorySchema.findOne({
                                        userId: user.id,
                                        itemId: itemFound.id
                                    })
                                    if (!checkInvReciever) await inventorySchema.create({
                                        userId: user.id,
                                        item: itemFound.name,
                                        itemId: itemFound.id,
                                        emoji: itemFound.emoji,
                                        amount: quantity
                                    })
                                    else {
                                        checkInvReciever.amount += quantity
                                        checkInvReciever.save()
                                    }
                                }
                                if (coins > 0) {
                                    const walletGifter = await profileSchema.findOne({
                                        userId: interaction.user.id
                                    })
                                    const walletReciever = await profileSchema.findOne({
                                        userId: user.id
                                    })
                                    if (walletGifter.wallet < coins) coins = walletGifter.wallet
                                    walletGifter.wallet -= coins
                                    walletGifter.save()

                                    walletReciever.wallet += coins
                                    walletReciever.save()
                                }
                                const checkInvGifterGift = await inventorySchema.findOne({
                                    userId: interaction.user.id,
                                    itemId: itemFound.id
                                })
                                if (checkInvGifterGift.amount - quantity === 0) checkInvGifterGift.delete()
                                else {
                                    checkInvGifterGift.amount -= 1
                                    checkInvGifterGift.save()
                                }

                                confirmMessage.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('User gifted!')
                                        .setDescription(`You have gifted ${user} (\`${user.tag}\`):\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                                        .setColor('0x' + colours.blend)
                                    ],
                                    components: []
                                })
                                functions.createNewNotif(user.id, `${interaction.user} has gifted you:\n${coins > 0 ? parseInt(coins).toLocaleString() + ' coins\n' : ''}${currentStuff.length > 0 ? currentStuff.map(item => item.split('|')[2] + `x ` + item.split('|')[0]).join('\n') : coins > 0 ? '' : 'Nothing'}`)
                            } else if (interac.customId === 'cancel') {
                                canceledConfirm = true
                                confirmCollector.stop()
                                confirmMessage.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle('Canceled')
                                        .setColor('0x' + colours.blend)
                                    ],
                                    components: []
                                })
                            }
                        })
                        confirmCollector.on('end', () => {
                            if (canceledConfirm === true) return
                            confirmMessage.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('Timed Out')
                                    .setColor('0x' + colours.blend)
                                ],
                                components: []
                            })
                        })
                    }
                })

                fillCollector.on('end', () => {
                    if (canceled === true) return
                    fillEmbedMessage.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Timed Out')
                            .setColor('0x' + colours.blend)
                        ],
                        components: []
                    })
                })


            } else {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('You must provide a user field for this item')
                        .setColor('0x' + colours.alert)
                    ]
                })
            }
        }
    }
}