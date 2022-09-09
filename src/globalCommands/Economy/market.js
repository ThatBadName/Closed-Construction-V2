const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ModalBuilder,
    TextInputBuilder
} = require('discord.js')
const marketSchema = require('../../models/marketplace')
const functions = require('../../commandFunctions')
let allItems = require('../../things/items/allItems')
const inventorySchema = require('../../models/inventorySchema')
const profileSchema = require('../../models/userProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDMPermission(false)
        .setDescription('The bot market')
        .addSubcommand(option =>
            option.setName('view')
            .setDescription('View an item on the market')
            .addStringOption(option =>
                option.setName('item')
                .setDescription('An item that you would like to view')
                .setAutocomplete(true)
                .setRequired(false)
                .setMinLength(1)
                .setMaxLength(30)
            )
        )
        .addSubcommand(option =>
            option.setName('manage')
            .setDescription('Manage your offers on the market')
        )
        .addSubcommand(option =>
            option.setName('sell-offer')
            .setDescription('Add an item listing to the marketplace')
            .addStringOption(option =>
                option.setName('item')
                .setDescription('The item to put on the market')
                .setAutocomplete(true)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(30)
            )

            .addIntegerOption(option =>
                option.setName('quantity')
                .setDescription('The quantity of the item to list')
                .setMinValue(1)
                .setMaxValue(1000000)
            )
        )

        .addSubcommand(option =>
            option.setName('buy-order')
            .setDescription('Create a buy order to be filled')
            .addStringOption(option =>
                option.setName('item')
                .setDescription('The item to buy')
                .setAutocomplete(true)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(30)
            )

            .addIntegerOption(option =>
                option.setName('quantity')
                .setDescription('The quantity of the item to list')
                .setMinValue(1)
                .setMaxValue(1000000)
            )
        )

        .addSubcommand(option =>
            option.setName('buy-instantly')
            .setDescription('Buy items instantly')
            .addStringOption(option =>
                option.setName('item')
                .setDescription('The item to buy')
                .setAutocomplete(true)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(30)
            )

            .addIntegerOption(option =>
                option.setName('quantity')
                .setDescription('The quantity of the item to list')
                .setMinValue(1)
                .setMaxValue(1000000)
            )
        )

        .addSubcommand(option =>
            option.setName('sell-instantly')
            .setDescription('Sell items instantly')
            .addStringOption(option =>
                option.setName('item')
                .setDescription('The item to sell')
                .setAutocomplete(true)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(30)
            )

            .addIntegerOption(option =>
                option.setName('quantity')
                .setDescription('The quantity of the item to list')
                .setMinValue(1)
                .setMaxValue(1000000)
            )
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item') {
            allItems = allItems.filter(item => item.marketable === true)
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
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'market', 5, interaction)
        if (cldn === true) return

        let checkLevel = await profileSchema.findOne({
            userId: interaction.user.id
        })
        if (!checkLevel) checkLevel = await profileSchema.create({
            userId: interaction.user.id
        })

        if (checkLevel.level < 10) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('You must be level 10+ to access the market')
                .setColor('0xa477fc')
            ]
        })

        if (interaction.options.getSubcommand() === 'sell-offer') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            const checkAmountOfOffers = await marketSchema.find({
                userId: interaction.user.id
            })
            if (checkAmountOfOffers.length > 14) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can only have 15 offers active at once')
                    .setColor('0xa477fc')
                ]
            })

            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1


            //functions.createRecentCommand(interaction.user.id, 'market-list', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

            const search = !!allItems.find((value) => value.id === itemQuery)
            if (!search) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that item')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = allItems.find((value) => value.id === itemQuery)
            if (itemFound.marketable === false) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That item cannot be put on the market')
                    .setColor('0xa477fc')
                ]
            })
            const userInv = await inventorySchema.findOne({
                userId: interaction.user.id,
                itemId: itemFound.id
            })
            if (!userInv) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have this item')
                    .setColor('0xa477fc')
                ]
            })
            if (userInv.amount < amount) amount = userInv.amount

            const highestListing = await marketSchema.find({
                itemId: itemFound.id
            }).sort({
                listingPrice: -1
            }).limit(1)
            const lowestListing = await marketSchema.find({
                itemId: itemFound.id
            }).sort({
                listingPrice: 1
            }).limit(1)
            let customPrice
            if (highestListing.length === 0 || lowestListing.length === 0) customPrice = itemFound.tradeValue
            else customPrice = highestListing[0].listingPrice

            const rows = new ActionRowBuilder()
            if (lowestListing.length > 0 && lowestListing[0].listingPrice !== 1) rows.addComponents(
                new ButtonBuilder()
                .setCustomId('lowest-listing')
                .setLabel(`Lowest Listing -1`)
                .setStyle('Primary')
            )
            else rows.addComponents(
                new ButtonBuilder()
                .setCustomId('lowest-listing')
                .setDisabled(true)
                .setLabel(`Lowest Listing -1`)
                .setStyle('Primary')
            )

            rows.addComponents(
                // new ButtonBuilder()
                // .setLabel(`Same as market value (${itemFound.tradeValue.toLocaleString()} per unit)`)
                // .setCustomId('market-value')
                // .setStyle('Primary'),

                new ButtonBuilder()
                .setLabel(`Custom Price`)
                .setCustomId('custom-price')
                .setStyle('Primary')
            )

            const priceEmbed = await wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Please choose a price to list the item${amount > 1 ? 's' : ''} at`)
                    .setDescription(`You are listing ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name}. Please choose a price to list it at bellow`)
                    .setColor('0xa477fc')
                    .setFields({
                            name: 'Lowest listing -1',
                            value: `${lowestListing.length >= 1 ? `${(lowestListing[0].listingPrice - 1).toLocaleString()} coins per unit (Order will be filled first)` : `Not on market`}`,
                            inline: true
                        },
                        // {
                        //     name: 'Market value',
                        //     value: `${itemFound.tradeValue.toLocaleString()} coins per unit`,
                        //     inline: true
                        // },
                        {
                            name: 'Custom Price',
                            value: `Can be priced between ${(Math.round(customPrice - (customPrice / 100 * 40))).toLocaleString()} and ${(Math.round(customPrice + (customPrice / 100 * 35))).toLocaleString()} coins per unit`,
                            inline: false
                        })
                ],
                components: [rows],
                fetchReply: true
            })

            const collectorPrice = await priceEmbed.createMessageComponentCollector({
                type: 'Button',
                time: 30000
            })

            let pricePerUnit
            let collected = false
            collectorPrice.on('collect', async (interact) => {
                if (interact.user.id !== interaction.user.id) return interact.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                collectorPrice.resetTimer()

                if (interact.customId === 'custom-price') {
                    collected = true
                    let firstTextBox
                    let customPriceModal = new ModalBuilder()
                        .setTitle('Custom Price')
                        .setCustomId('custom-modal')

                    const price = new TextInputBuilder()
                        .setCustomId('price')
                        .setLabel('How much will you charge per unit?')
                        .setMinLength(1)
                        .setMaxLength(10)
                        .setRequired(true)
                        .setStyle('Short')

                    firstTextBox = new ActionRowBuilder().addComponents(price)
                    customPriceModal.addComponents(firstTextBox)
                    interact.showModal(customPriceModal)
                    await interact.awaitModalSubmit({
                            time: 60000
                        }).catch(() => {
                            editMessage.edit({
                                embeds: [editEmbedTimeout],
                                components: []
                            })
                        })
                        .then(async (i) => {
                            if (!i) return
                            let listingPrice = i.fields.getTextInputValue('price')
                            if (listingPrice < 1 || !Number.isInteger(Number(listingPrice))) {
                                if (listingPrice && listingPrice.toLowerCase().includes('k')) {
                                    const value = listingPrice.replace(/k/g, '');
                                    if (!Number.isInteger(Number(value * 1000)) || isNaN(value * 1000)) {
                                        return i.reply({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('Item prices must be a whole number')
                                                .setColor('0xa477fc')
                                            ],
                                            ephemeral: true
                                        })
                                    } else {
                                        listingPrice = value * 1000;
                                    }
                                } else if (listingPrice && listingPrice.toLowerCase().includes('m')) {
                                    const value = listingPrice.replace(/m/g, '');
                                    if (!Number.isInteger(Number(value * 1000000)) || isNaN(value * 1000000)) {
                                        return i.reply({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setTitle('Item prices must be a whole number')
                                                .setColor('0xa477fc')
                                            ],
                                            ephemeral: true
                                        })
                                    } else {
                                        listingPrice = value * 1000000;
                                    }
                                } else {
                                    return i.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setTitle('Item prices must be a whole number')
                                            .setColor('0xa477fc')
                                        ],
                                        ephemeral: true
                                    })
                                }
                            }
                            if (listingPrice < Math.round(customPrice - (customPrice / 100 * 40)) || listingPrice > Math.round(customPrice + (customPrice / 100 * 35))) return i.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('Something went wrong')
                                    .setColor('0xa477fc')
                                    .setDescription(`This item can have a custom value between ${(Math.round(customPrice - (customPrice / 100 * 40))).toLocaleString()} and ${(Math.round(customPrice + (customPrice / 100 * 35))).toLocaleString()}`)
                                ],
                                ephemeral: true
                            })
                            pricePerUnit = listingPrice
                            i.deferUpdate()
                        })
                } else if (interact.customId === 'market-value') {
                    collected = true
                    pricePerUnit = itemFound.tradeValue
                    interact.deferUpdate()
                } else if (interact.customId === 'lowest-listing') {
                    collected = true
                    pricePerUnit = lowestListing[0].listingPrice - 1
                    interact.deferUpdate()
                }
                let amountTaxed = Math.round(pricePerUnit / 10 * amount)
                collectorPrice.stop()

                const listingConfirmEmbed = new EmbedBuilder()
                    .setTitle('Confirm listing')
                    .setDescription(`You are listing ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name} for ${pricePerUnit.toLocaleString()} coin${pricePerUnit > 1 ? 's' : ''} per unit`)
                    .setFooter({
                        text: `You will be charged ${amountTaxed.toLocaleString()} coin${amountTaxed === 1 ? '' : 's'} to setup this sell offer`
                    })
                    .setColor('0xa477fc')

                const confirmEmbed = await priceEmbed.edit({
                    embeds: [listingConfirmEmbed],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('sure')
                            .setLabel('List it')
                            .setStyle('Success'),

                            new ButtonBuilder()
                            .setCustomId('no-thanks')
                            .setLabel('No thanks')
                            .setStyle('Danger')
                        )
                    ]
                })

                const confirmCollector = await confirmEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 15000
                })

                let confirmationCollected = false
                confirmCollector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id) return int.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    if (int.customId === 'sure') {
                        confirmationCollected = true
                        confirmCollector.stop()

                        let userProfile = await profileSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (!userProfile) userProfile = await profileSchema.create({
                            userId: interaction.user.id
                        })

                        if (userProfile.wallet < amountTaxed) return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('You do not have enough money to create this offer')
                                .setColor('0xa477fc')
                            ]
                        })

                        if (userInv.amount === amount) userInv.delete()
                        else {
                            userInv.amount -= amount;
                            userInv.save()
                        }

                        userProfile.wallet -= amountTaxed
                        userProfile.save()

                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Listing confirmed')
                                .setDescription(`You have setup an offer for ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name} for ${pricePerUnit.toLocaleString()} coin${pricePerUnit > 1 ? 's' : ''} per unit`)
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })

                        await marketSchema.create({
                            userId: interaction.user.id,
                            item: itemFound.emoji + itemFound.name,
                            itemId: itemFound.id,
                            listingPrice: pricePerUnit,
                            itemsOnSale: amount,
                            itemsFilled: 0,
                            type: 'Sell'
                        })


                    } else if (int.customId === 'no-thanks') {
                        confirmationCollected = true
                        confirmCollector.stop()

                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Canceled')
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })
                    }
                })
                confirmCollector.on('end', () => {
                    if (confirmationCollected === true) return
                    confirmEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Timed out')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                })
            })
            collectorPrice.on('end', () => {
                if (collected === true) return
                priceEmbed.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed out')
                        .setColor('0xa477fc')
                    ],
                    components: []
                })
            })

        } else if (interaction.options.getSubcommand() === 'buy-order') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            const checkAmountOfOffers = await marketSchema.find({
                userId: interaction.user.id
            })
            if (checkAmountOfOffers.length > 14) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You can only have 15 offers active at once')
                    .setColor('0xa477fc')
                ]
            })

            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1


            //functions.createRecentCommand(interaction.user.id, 'market-list', `ITEM: ${itemQuery} | AMOUNT: ${amount}`, interaction)

            const search = !!allItems.find((value) => value.id === itemQuery)
            if (!search) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that item')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = allItems.find((value) => value.id === itemQuery)
            if (itemFound.marketable === false) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That item cannot be put on the market')
                    .setColor('0xa477fc')
                ]
            })

            const highestListing = await marketSchema.find({
                itemId: itemFound.id
            }).sort({
                listingPrice: -1
            }).limit(1)
            const lowestListing = await marketSchema.find({
                itemId: itemFound.id
            }).sort({
                listingPrice: 1
            }).limit(1)
            let customPrice
            if (highestListing.length === 0 || highestListing.length === 0) customPrice = itemFound.tradeValue
            else customPrice = highestListing[0].listingPrice

            const rows = new ActionRowBuilder()
            if (highestListing.length > 0) rows.addComponents(
                new ButtonBuilder()
                .setCustomId('highest-listing')
                .setLabel(`Highest Order +1`)
                .setStyle('Primary')
            )
            else rows.addComponents(
                new ButtonBuilder()
                .setCustomId('highest-listing')
                .setDisabled(true)
                .setLabel(`Highest Order +1`)
                .setStyle('Primary')
            )

            rows.addComponents(
                // new ButtonBuilder()
                // .setLabel(`Same as market value (${itemFound.tradeValue.toLocaleString()} per unit)`)
                // .setCustomId('market-value')
                // .setStyle('Primary'),

                new ButtonBuilder()
                .setLabel(`Custom Amount`)
                .setCustomId('custom-price')
                .setStyle('Primary')
            )

            const priceEmbed = await wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`How much are you willing to pay?`)
                    .setDescription(`You are creating a buy order for ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name}. How much do you want to buy it for?`)
                    .setColor('0xa477fc')
                    .setFields({
                            name: 'Highest order +1',
                            value: `${highestListing.length >= 1 ? `${(highestListing[0].listingPrice + 1).toLocaleString()} coins per unit (Order will be filled first)` : `Not on market`}`,
                            inline: true
                        },
                        // {
                        //     name: 'Market value',
                        //     value: `${itemFound.tradeValue.toLocaleString()} coins per unit (Total: ${(itemFound.tradeValue * amount).toLocaleString()})`,
                        //     inline: true
                        // },
                        {
                            name: 'Custom Price',
                            value: `Can be priced between ${(Math.round(customPrice - (customPrice / 100 * 40))).toLocaleString()} and ${(Math.round(customPrice + (customPrice / 100 * 35))).toLocaleString()} coins per unit`,
                            inline: false
                        })
                ],
                components: [rows],
                fetchReply: true
            })

            const collectorPrice = await priceEmbed.createMessageComponentCollector({
                type: 'Button',
                time: 30000
            })

            let pricePerUnit
            let collected = false
            collectorPrice.on('collect', async (interact) => {
                if (interact.user.id !== interaction.user.id) return interact.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })
                collectorPrice.resetTimer()

                if (interact.customId === 'custom-price') {
                    collected = true
                    let firstTextBox
                    let customPriceModal = new ModalBuilder()
                        .setTitle('Custom Price')
                        .setCustomId('custom-modal')

                    const price = new TextInputBuilder()
                        .setCustomId('price')
                        .setLabel('How much will you charge per unit?')
                        .setMinLength(1)
                        .setMaxLength(10)
                        .setRequired(true)
                        .setStyle('Short')

                    firstTextBox = new ActionRowBuilder().addComponents(price)
                    customPriceModal.addComponents(firstTextBox)
                    interact.showModal(customPriceModal)
                    await interact.awaitModalSubmit({
                            time: 60000
                        }).catch(() => {
                            editMessage.edit({
                                embeds: [editEmbedTimeout],
                                components: []
                            })
                        })
                        .then(async (i) => {
                            if (!i) return
                            let listingPrice = i.fields.getTextInputValue('price')
                            if (listingPrice < 1 || !Number.isInteger(Number(listingPrice))) {
                                if (listingPrice && listingPrice.toLowerCase().includes('k')) {
                                    const value = listingPrice.replace(/k/g, '');
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
                                        listingPrice = value * 1000;
                                    }
                                } else if (listingPrice && listingPrice.toLowerCase().includes('m')) {
                                    const value = listingPrice.replace(/m/g, '');
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
                                        listingPrice = value * 1000000;
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
                            if (listingPrice < Math.round(customPrice - (customPrice / 100 * 40)) || listingPrice > Math.round(customPrice + (customPrice / 100 * 35))) return i.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle('Something went wrong')
                                    .setColor('0xa477fc')
                                    .setDescription(`You can only pay between ${(Math.round(customPrice - (customPrice / 100 * 40))).toLocaleString()} and ${(Math.round(customPrice + (customPrice / 100 * 35))).toLocaleString()}`)
                                ],
                                ephemeral: true
                            })
                            pricePerUnit = listingPrice
                            i.deferUpdate()
                        })
                } else if (interact.customId === 'market-value') {
                    collected = true
                    pricePerUnit = itemFound.tradeValue
                    interact.deferUpdate()
                } else if (interact.customId === 'highest-listing') {
                    collected = true
                    pricePerUnit = highestListing[0].listingPrice + 1
                    interact.deferUpdate()
                }
                let amountTaxed = Math.round(pricePerUnit / 5 * amount)
                collectorPrice.stop()

                const listingConfirmEmbed = new EmbedBuilder()
                    .setTitle('Confirm listing')
                    .setDescription(`You are creating a buy order for ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name}, ${pricePerUnit} coin${pricePerUnit > 1 ? '' : 's'} per unit (Total: ${(pricePerUnit * amount).toLocaleString()})`)
                    .setFooter({
                        text: `You will be charged ${amountTaxed.toLocaleString()} coin${amountTaxed === 1 ? '' : 's'} to setup this buy order`
                    })
                    .setColor('0xa477fc')

                const confirmEmbed = await priceEmbed.edit({
                    embeds: [listingConfirmEmbed],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('sure')
                            .setLabel('Send it')
                            .setStyle('Success'),

                            new ButtonBuilder()
                            .setCustomId('no-thanks')
                            .setLabel('No thanks')
                            .setStyle('Danger')
                        )
                    ]
                })

                const confirmCollector = await confirmEmbed.createMessageComponentCollector({
                    type: 'Button',
                    time: 15000
                })

                let confirmationCollected = false
                confirmCollector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id) return int.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('This is not for you')
                            .setColor('0xa477fc')
                        ],
                        ephemeral: true
                    })

                    if (int.customId === 'sure') {
                        confirmationCollected = true
                        confirmCollector.stop()

                        let userProfile = await profileSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (!userProfile) userProfile = await profileSchema.create({
                            userId: interaction.user.id
                        })

                        if (userProfile.wallet < amountTaxed) return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('You do not have enough money to create this offer')
                                .setColor('0xa477fc')
                            ]
                        })

                        userProfile.wallet -= amountTaxed + pricePerUnit * amount
                        userProfile.save()

                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Order confirmed')
                                .setDescription(`You have started a buy order for ${amount.toLocaleString()}x ${itemFound.emoji}${itemFound.name}, ${pricePerUnit.toLocaleString()} coin${pricePerUnit > 1 ? '' : 's'} per unit (Total: ${(pricePerUnit * amount).toLocaleString()})`)
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })

                        await marketSchema.create({
                            userId: interaction.user.id,
                            item: itemFound.emoji + itemFound.name,
                            itemId: itemFound.id,
                            listingPrice: pricePerUnit,
                            itemsOnSale: amount,
                            itemsFilled: 0,
                            type: 'Buy'
                        })


                    } else if (int.customId === 'no-thanks') {
                        confirmationCollected = true
                        confirmCollector.stop()

                        confirmEmbed.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Canceled')
                                .setColor('0xa477fc')
                            ],
                            components: []
                        })
                    }
                })
                confirmCollector.on('end', () => {
                    if (confirmationCollected === true) return
                    confirmEmbed.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Timed out')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                })
            })
            collectorPrice.on('end', () => {
                if (collected === true) return
                priceEmbed.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed out')
                        .setColor('0xa477fc')
                    ],
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'buy-instantly') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1

            const search = !!allItems.find((value) => value.id === itemQuery)
            if (!search) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that item')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = allItems.find((value) => value.id === itemQuery)
            if (itemFound.marketable === false) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That item cannot be put on the market')
                    .setColor('0xa477fc')
                ]
            })
            const userInv = await inventorySchema.findOne({
                userId: interaction.user.id,
                itemId: itemFound.id
            })

            const lowestListing = await marketSchema.find({
                itemId: itemFound.id,
                type: 'Sell',
                filled: false
            }).sort({
                listingPrice: 1
            })
            let totalRequested = 0

            for (const item of lowestListing) {
                totalRequested = totalRequested + item.itemsOnSale
            }
            if (totalRequested === 0) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('There are not currently any sell offers for this item')
                    .setColor('0xa477fc')
                ]
            })

            let userProfile = await profileSchema.findOne({
                userId: interaction.user.id
            })
            if (!userProfile) userProfile = await profileSchema.create({
                userId: interaction.user.id
            })

            if (amount > totalRequested) amount = totalRequested
            let amountBuying = amount
            let payment = 0

            for (let i = 0; amount > 0; i++) {
                if (lowestListing[i].itemsOnSale <= amount) {
                    payment = payment + lowestListing[i].listingPrice * amount
                    amount = amount - lowestListing[i].itemsOnSale
                } else {
                    payment = payment + lowestListing[i].listingPrice * amount
                    amount = amount - amount
                }
            }

            if (userProfile.wallet - payment <= 0) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have enough to buy this')
                    .setColor('0xa477fc')
                ]
            })

            const confirmSale = await wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please confirm purchace')
                    .setColor('0xa477fc')
                    .setDescription(`You are buying ${amountBuying.toLocaleString()}x ${itemFound.emoji}${itemFound.name} for \`${payment.toLocaleString()}\` coins`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Yep, I\'m sure')
                        .setCustomId('send')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setLabel('No thanks')
                        .setCustomId('cancel')
                        .setStyle('Danger')
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmSale.createMessageComponentCollector({
                time: 10000,
                type: 'Button'
            })

            let collected = false
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setCollor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'send') {
                    collected = true
                    collector.stop()
                    amount = amountBuying
                    payment = 0
                    for (let i = 0; amount > 0; i++) {
                        if (lowestListing[i].itemsOnSale <= amount) {
                            payment = payment + lowestListing[i].listingPrice * amount
                            await marketSchema.findOneAndUpdate({
                                _id: lowestListing[i]._id
                            }, {
                                itemsOnSale: 0,
                                itemsFilled: lowestListing[i].itemsOnSale,
                                itemsClaimable: lowestListing[i].itemsClaimable += (amount * lowestListing[i].listingPrice),
                                filled: true
                            })
                            amount = amount - lowestListing[i].itemsOnSale
                        } else {
                            payment = payment + lowestListing[i].listingPrice * amount
                            await marketSchema.findOneAndUpdate({
                                _id: lowestListing[i]._id
                            }, {
                                itemsOnSale: lowestListing[i].itemsOnSale -= amount,
                                itemsFilled: lowestListing[i].itemsFilled += amount,
                                itemsClaimable: lowestListing[i].itemsClaimable += (amount * lowestListing[i].listingPrice),
                            })
                            amount = amount - amount
                        }
                    }

                    if (!userInv) await inventorySchema.create({
                        userId: interaction.user.id,
                        item: itemFound.name,
                        itemId: itemFound.id,
                        emoji: itemFound.emoji,
                        amount: amountBuying
                    })
                    else {
                        userInv.amount += amountBuying;
                        userInv.save()
                    }

                    userProfile.wallet -= payment
                    userProfile.save()

                    confirmSale.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Purchace confirmed')
                            .setDescription(`You bought ${amountBuying.toLocaleString()}x ${itemFound.emoji}${itemFound.name} and paid \`${payment.toLocaleString()}\` coins`)
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })

                } else if (i.customId === 'cancel') {
                    collected = true
                    collector.stop()

                    confirmSale.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Canceled')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                }
            })
            collector.on('end', () => {
                if (collected === true) return
                confirmSale.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed out')
                        .setColor('0xa477fc')
                    ],
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'sell-instantly') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()
            let amount = interaction.options.getInteger('quantity') || 1
            if (amount < 1) amount = 1

            const search = !!allItems.find((value) => value.id === itemQuery)
            if (!search) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that item')
                    .setColor('0xa744f2')
                ]
            })
            const itemFound = allItems.find((value) => value.id === itemQuery)
            if (itemFound.marketable === false) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('That item cannot be put on the market')
                    .setColor('0xa477fc')
                ]
            })
            const userInv = await inventorySchema.findOne({
                userId: interaction.user.id,
                itemId: itemFound.id
            })
            if (!userInv) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('You do not have this item')
                    .setColor('0xa477fc')
                ]
            })
            if (userInv.amount < amount) amount = userInv.amount

            const highestListing = await marketSchema.find({
                itemId: itemFound.id,
                type: 'Buy',
                filled: false
            }).sort({
                listingPrice: -1
            })
            let totalRequested = 0

            for (const item of highestListing) {
                totalRequested = totalRequested + item.itemsOnSale
            }
            if (totalRequested === 0) return wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('There are not currently any buy offers for this item')
                    .setColor('0xa477fc')
                ]
            })

            if (amount > totalRequested) amount = totalRequested
            let amountSelling = amount
            let payment = 0

            for (let i = 0; amount > 0; i++) {
                if (highestListing[i].itemsOnSale <= amount) {
                    payment = payment + highestListing[i].listingPrice * amount
                    amount = amount - highestListing[i].itemsOnSale
                } else {
                    payment = payment + highestListing[i].listingPrice * amount
                    amount = amount - amount
                }
            }

            const confirmSale = await wait.edit({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please confirm sale')
                    .setColor('0xa477fc')
                    .setDescription(`You are selling ${amountSelling.toLocaleString()}x ${itemFound.emoji}${itemFound.name} and you will get \`${payment.toLocaleString()}\` coins in return`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Yep, I\'m sure')
                        .setCustomId('send')
                        .setStyle('Success'),

                        new ButtonBuilder()
                        .setLabel('No thanks')
                        .setCustomId('cancel')
                        .setStyle('Danger')
                    )
                ],
                fetchReply: true
            })

            const collector = await confirmSale.createMessageComponentCollector({
                time: 10000,
                type: 'Button'
            })

            let collected = false
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setCollor('0xa477fc')
                    ],
                    ephemeral: true
                })
                if (i.customId === 'send') {
                    collected = true
                    collector.stop()
                    amount = amountSelling
                    payment = 0
                    for (let i = 0; amount > 0; i++) {
                        if (highestListing[i].itemsOnSale <= amount) {
                            payment = payment + highestListing[i].listingPrice * amount
                            await marketSchema.findOneAndUpdate({
                                _id: highestListing[i]._id
                            }, {
                                itemsOnSale: 0,
                                itemsFilled: highestListing[i].itemsOnSale,
                                itemsClaimable: highestListing[i].itemsClaimable += highestListing[i].itemsOnSale,
                                filled: true
                            })
                            amount = amount - highestListing[i].itemsOnSale
                        } else {
                            payment = payment + highestListing[i].listingPrice * amount
                            await marketSchema.findOneAndUpdate({
                                _id: highestListing[i]._id
                            }, {
                                itemsOnSale: highestListing[i].itemsOnSale -= amount,
                                itemsFilled: highestListing[i].itemsFilled += amount,
                                itemsClaimable: highestListing[i].itemsClaimable += amount,
                            })
                            amount = amount - amount
                        }
                    }

                    let userProfile = await profileSchema.findOne({
                        userId: interaction.user.id
                    })
                    if (!userProfile) userProfile = await profileSchema.create({
                        userId: interaction.user.id
                    })

                    if (userInv.amount - amountSelling === 0) userInv.delete()
                    else {
                        userInv.amount -= amountSelling;
                        userInv.save()
                    }

                    userProfile.wallet += payment
                    userProfile.save()

                    confirmSale.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Sale confirmed')
                            .setDescription(`You sold ${amountSelling.toLocaleString()}x ${itemFound.emoji}${itemFound.name} and got \`${payment.toLocaleString()}\` coins in return`)
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })

                } else if (i.customId === 'cancel') {
                    collected = true
                    collector.stop()

                    confirmSale.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Canceled')
                            .setColor('0xa477fc')
                        ],
                        components: []
                    })
                }
            })
            collector.on('end', () => {
                if (collected === true) return
                confirmSale.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Timed out')
                        .setColor('0xa477fc')
                    ],
                    components: []
                })
            })
        } else if (interaction.options.getSubcommand() === 'view') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            if (interaction.options.getString('item')) {
                let itemQuery = interaction.options.getString('item')
                itemQuery = itemQuery.toLowerCase()
                let amount = interaction.options.getInteger('quantity') || 1
                if (amount < 1) amount = 1

                const search = !!allItems.find((value) => value.id === itemQuery)
                if (!search) return wait.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('I could not find that item')
                        .setColor('0xa744f2')
                    ]
                })
                const itemFound = allItems.find((value) => value.id === itemQuery)
                if (itemFound.marketable === false) return wait.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('That item cannot be put on the market')
                        .setColor('0xa477fc')
                    ]
                })

                const highestListingBuy = await marketSchema.find({
                    itemId: itemFound.id,
                    type: 'Buy',
                    filled: false
                }).sort({
                    listingPrice: -1
                })

                const lowestListingBuy = await marketSchema.find({
                    itemId: itemFound.id,
                    type: 'Buy',
                    filled: false
                }).sort({
                    listingPrice: 1
                })


                const highestListingSell = await marketSchema.find({
                    itemId: itemFound.id,
                    type: 'Sell',
                    filled: false
                }).sort({
                    listingPrice: -1
                })

                const lowestListingSell = await marketSchema.find({
                    itemId: itemFound.id,
                    type: 'Sell',
                    filled: false
                }).sort({
                    listingPrice: 1
                })

                let totalBuy = 0
                for (const item of highestListingBuy) {
                    totalBuy = totalBuy + item.itemsOnSale
                }
                let totalSell = 0
                for (const item of highestListingSell) {
                    totalSell = totalSell + item.itemsOnSale
                }

                const infoEmbed = new EmbedBuilder()
                    .setTitle(`Market Info on ${itemFound.name}`)
                    .setColor('0xa477fc')
                    .setFields({
                        name: '[Buy] Highest Listing',
                        value: `${highestListingBuy.length > 0 ? `${highestListingBuy[0].listingPrice.toLocaleString()} coins` : 'Not on market'}`,
                        inline: true
                    }, {
                        name: '[Buy] Lowest Listing',
                        value: `${lowestListingBuy.length > 0 ? `${lowestListingBuy[0].listingPrice.toLocaleString()} coins` : 'Not on market'}`,
                        inline: true
                    }, {
                        name: '[Buy] Total on market',
                        value: `${totalBuy.toLocaleString()}`,
                        inline: true
                    }, {
                        name: '[Sell] Highest Listing',
                        value: `${highestListingSell.length > 0 ? `${highestListingSell[0].listingPrice.toLocaleString()} coins` : 'Not on market'}`,
                        inline: true
                    }, {
                        name: '[Sell] Lowest Listing',
                        value: `${lowestListingSell.length > 0 ? `${lowestListingSell[0].listingPrice.toLocaleString()} coins` : 'Not on market'}`,
                        inline: true
                    }, {
                        name: '[Sell] Total on market',
                        value: `${totalSell.toLocaleString()}`,
                        inline: true
                    })
                    .setThumbnail(itemFound.url || null)

                wait.edit({
                    embeds: [infoEmbed]
                })
            } else {
                const newestItems = await marketSchema.find({
                    filled: false
                }).sort({
                    _id: -1
                })

                const embed = new EmbedBuilder()
                .setTitle('Marketplace - Showing the most recent offers')
                .setColor('0xa477fc')

                if (newestItems.length === 0) embed.setDescription(`There is nothing on the market`)
                if (newestItems[0]) embed.addFields({
                    name: `Offer`,
                    value: `${newestItems[0].item}\n**Type**: ${newestItems[0].type}\n**Listing Price**: ${newestItems[0].listingPrice.toLocaleString()}`
                })
                if (newestItems[1]) embed.addFields({
                    name: `Offer`,
                    value: `${newestItems[1].item}\n**Type**: ${newestItems[01].type}\n**Listing Price**: ${newestItems[1].listingPrice.toLocaleString()}`
                })
                if (newestItems[2]) embed.addFields({
                    name: `Offer`,
                    value: `${newestItems[2].item}\n**Type**: ${newestItems[2].type}\n**Listing Price**: ${newestItems[2].listingPrice.toLocaleString()}`
                })

                wait.edit({
                    embeds: [embed]
                })
            }
        } else if (interaction.options.getSubcommand() === 'manage') {
            const wait = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Please wait')
                    .setColor('0xa477fc')
                ],
                fetchReply: true
            })

            const usersOffers = await marketSchema.find({
                userId: interaction.user.id
            })

            let currentPage = 0
            let pages = await createPages(usersOffers)
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('prev')
                    .setDisabled(true)
                    .setLabel('Prev. Offer')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next Offer')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('collect')
                    .setLabel('Collect')
                    .setStyle('Secondary'),

                    new ButtonBuilder()
                    .setCustomId('remove')
                    .setLabel('Remove Offer')
                    .setStyle('Danger')
                )

            const currentOffer = usersOffers[currentPage]

            if (pages.length === 1) {
                buttons.components[1].setDisabled(true)
            }
            if (pages.length === 0) return wait.edit({
                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                fetchReply: true
            })
            if (currentOffer.itemsClaimable === 0) {
                buttons.components[2].setDisabled(true)
            } else {
                buttons.components[2].setDisabled(false)
            }
            const message = await wait.edit({
                embeds: [pages[0].setFooter({
                    text: `Offer ${currentPage + 1}/${pages.length}`
                })],
                components: [buttons],
                fetchReply: true
            }).catch(() => {
                return wait.edit({
                    embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                    fetchReply: true
                })
            })

            const collector = await message.createMessageComponentCollector({
                type: 'Button',
                time: 20000
            })

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('This is not for you')
                        .setColor('0xa477fc')
                    ],
                    ephemeral: true
                })

                if (i.customId === 'prev') {
                    i.deferUpdate()
                    collector.resetTimer()
                        --currentPage
                    const currentOffer = usersOffers[currentPage]
                    if (currentPage === 0) {
                        buttons.components[0].setDisabled(true)
                        buttons.components[1].setDisabled(false)
                    } else {
                        buttons.components[0].setDisabled(false)
                        buttons.components[1].setDisabled(false)
                    }
                    if (currentOffer.itemsClaimable === 0) {
                        buttons.components[2].setDisabled(true)
                    } else {
                        buttons.components[2].setDisabled(false)
                    }
                    wait.edit({
                        embeds: [pages[currentPage].setFooter({
                            text: `Offer ${currentPage + 1}/${pages.length}`
                        })],
                        components: [buttons]
                    })
                } else if (i.customId === 'next') {
                    i.deferUpdate()
                    collector.resetTimer()
                    currentPage++
                    const currentOffer = usersOffers[currentPage]
                    if (currentPage + 1 !== pages.length) {
                        buttons.components[0].setDisabled(false)
                        buttons.components[1].setDisabled(false)
                    } else {
                        buttons.components[0].setDisabled(false)
                        buttons.components[1].setDisabled(true)
                    }
                    if (currentOffer.itemsClaimable === 0) {
                        buttons.components[2].setDisabled(true)
                    } else {
                        buttons.components[2].setDisabled(false)
                    }
                    wait.edit({
                        embeds: [pages[currentPage].setFooter({
                            text: `Offer ${currentPage + 1}/${pages.length}`
                        })],
                        components: [buttons]
                    })
                } else if (i.customId === 'collect') {
                    i.deferUpdate()
                    collector.resetTimer()
                    const currentOffer = usersOffers[currentPage]
                    if (currentOffer.type === 'Buy') {
                        let itemQuery = currentOffer.itemId
                        itemQuery = itemQuery.toLowerCase()

                        const search = !!allItems.find((value) => value.id === itemQuery)
                        if (!search) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa744f2')
                            ]
                        })
                        const itemFound = allItems.find((value) => value.id === itemQuery)
                        if (itemFound.marketable === false) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa477fc')
                            ]
                        })
                        let userInv = await inventorySchema.findOne({
                            userId: interaction.user.id,
                            itemId: currentOffer.itemId
                        })
                        if (!userInv) {
                            await inventorySchema.create({
                                userId: interaction.user.id,
                                item: itemFound.name,
                                itemId: itemFound.id,
                                emoji: itemFound.emoji,
                                amount: currentOffer.itemsClaimable
                            })
                        } else {
                            userInv.amount += currentOffer.itemsClaimable
                            userInv.save()
                        }

                        if (currentOffer.filled === true) await currentOffer.delete()
                        else {
                            currentOffer.itemsClaimable = 0;
                            await currentOffer.save()
                        }

                        const newOffers = await marketSchema.find({
                            userId: interaction.user.id
                        })

                        pages = await createPages(newOffers)
                        if (pages.length === 0) return wait.edit({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                            components: [],
                            fetchReply: true
                        })

                        if (currentPage === 0 && pages.length !== 1) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        } else if (currentPage + 1 !== pages.length) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(false)
                        } else if (pages.length === 1 && currentPage === 0) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        }
                        if (currentOffer.itemsClaimable === 0) {
                            buttons.components[2].setDisabled(true)
                        } else {
                            buttons.components[2].setDisabled(false)
                        }

                        if (currentPage + 1 > pages.length) currentPage = 0

                        wait.edit({
                            embeds: [pages[currentPage].setFooter({
                                text: `Offer ${currentPage + 1}/${pages.length}`
                            })],
                            components: [buttons]
                        }).catch(() => {
                            return wait.edit({
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                                fetchReply: true
                            })
                        })
                    } else if (currentOffer.type === 'Sell') {
                        let userProfile = await profileSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (!userProfile) userProfile = await profileSchema.create({
                            userId: interaction.user.id
                        })
                        userProfile.wallet += currentOffer.itemsClaimable
                        userProfile.save()

                        if (currentOffer.filled === true) await currentOffer.delete()
                        else {
                            currentOffer.itemsClaimable = 0;
                            await currentOffer.save()
                        }

                        const newOffers = await marketSchema.find({
                            userId: interaction.user.id
                        })

                        pages = await createPages(newOffers)
                        if (pages.length === 0) return wait.edit({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                            components: [],
                            fetchReply: true
                        })

                        if (currentPage === 0 && pages.length !== 1) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        } else if (currentPage + 1 !== pages.length) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(false)
                        } else if (pages.length === 1 && currentPage === 0) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        }
                        if (currentOffer.itemsClaimable === 0) {
                            buttons.components[2].setDisabled(true)
                        } else {
                            buttons.components[2].setDisabled(false)
                        }

                        if (currentPage + 1 > pages.length) currentPage = 0

                        wait.edit({
                            embeds: [pages[currentPage].setFooter({
                                text: `Offer ${currentPage + 1}/${pages.length}`
                            })],
                            components: [buttons]
                        }).catch(() => {
                            return wait.edit({
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                                fetchReply: true
                            })
                        })
                    }

                } else if (i.customId === 'remove') {
                    i.deferUpdate()
                    collector.resetTimer()
                    const currentOffer = usersOffers[currentPage]
                    if (currentOffer.type === 'Buy') {
                        let itemQuery = currentOffer.itemId
                        itemQuery = itemQuery.toLowerCase()

                        const search = !!allItems.find((value) => value.id === itemQuery)
                        if (!search) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa744f2')
                            ]
                        })
                        const itemFound = allItems.find((value) => value.id === itemQuery)
                        if (itemFound.marketable === false) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa477fc')
                            ]
                        })
                        let userInv = await inventorySchema.findOne({
                            userId: interaction.user.id,
                            itemId: currentOffer.itemId
                        })
                        if (!userInv) {
                            await inventorySchema.create({
                                userId: interaction.user.id,
                                item: itemFound.name,
                                itemId: itemFound.id,
                                emoji: itemFound.emoji,
                                amount: currentOffer.itemsClaimable
                            })
                        } else {
                            userInv.amount += currentOffer.itemsClaimable
                            userInv.save()
                        }
                        let userProfile = await profileSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (!userProfile) userProfile = await profileSchema.create({
                            userId: interaction.user.id
                        })
                        userProfile.wallet += currentOffer.itemsOnSale * currentOffer.listingPrice
                        userProfile.save()

                        currentOffer.delete()

                        const newOffers = await marketSchema.find({
                            userId: interaction.user.id
                        })

                        pages = await createPages(newOffers)
                        if (pages.length === 0) return wait.edit({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                            components: [],
                            fetchReply: true
                        })

                        if (currentPage === 0 && pages.length !== 1) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        } else if (currentPage + 1 !== pages.length) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(false)
                        } else if (pages.length === 1 && currentPage === 0) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(true)
                        } else {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        }

                        if (currentPage + 1 > pages.length) currentPage = 0

                        wait.edit({
                            embeds: [pages[currentPage].setFooter({
                                text: `Offer ${currentPage + 1}/${pages.length}`
                            })],
                            components: [buttons]
                        }).catch(() => {
                            return wait.edit({
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                                fetchReply: true
                            })
                        })
                    } else if (currentOffer.type === 'Sell') {
                        let itemQuery = currentOffer.itemId
                        itemQuery = itemQuery.toLowerCase()

                        const search = !!allItems.find((value) => value.id === itemQuery)
                        if (!search) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa744f2')
                            ]
                        })
                        const itemFound = allItems.find((value) => value.id === itemQuery)
                        if (itemFound.marketable === false) return wait.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle('Something went wrong')
                                .setColor('0xa477fc')
                            ]
                        })
                        let userProfile = await profileSchema.findOne({
                            userId: interaction.user.id
                        })
                        if (!userProfile) userProfile = await profileSchema.create({
                            userId: interaction.user.id
                        })
                        userProfile.wallet += currentOffer.itemsClaimable
                        userProfile.save()

                        let userInv = await inventorySchema.findOne({
                            userId: interaction.user.id,
                            itemId: currentOffer.itemId
                        })
                        if (!userInv) {
                            await inventorySchema.create({
                                userId: interaction.user.id,
                                item: itemFound.name,
                                itemId: itemFound.id,
                                emoji: itemFound.emoji,
                                amount: currentOffer.itemsOnSale
                            })
                        } else {
                            userInv.amount += currentOffer.itemsOnSale
                            userInv.save()
                        }

                        currentOffer.delete()

                        const newOffers = await marketSchema.find({
                            userId: interaction.user.id
                        })

                        pages = await createPages(newOffers)
                        if (pages.length === 0) return wait.edit({
                            embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                            components: [],
                            fetchReply: true
                        })

                        if (currentPage === 0) {
                            buttons.components[0].setDisabled(true)
                            buttons.components[1].setDisabled(false)
                        } else if (currentPage + 1 !== pages.length) {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(false)
                        } else {
                            buttons.components[0].setDisabled(false)
                            buttons.components[1].setDisabled(true)
                        }

                        if (currentPage + 1 > pages.length) currentPage = 0

                        wait.edit({
                            embeds: [pages[currentPage].setFooter({
                                text: `Offer ${currentPage + 1}/${pages.length}`
                            })],
                            components: [buttons]
                        }).catch(() => {
                            return wait.edit({
                                embeds: [new EmbedBuilder().setColor('0xa744f2').setTitle(`You have no offers active`)],
                                components: [],
                                fetchReply: true
                            })
                        })
                    }
                }
            })

            collector.on('end', async () => {
                message.edit({
                    components: []
                })
            })


            async function createPages(offers) {
                const embeds = []
                let k = 1
                for (let i = 0; i < offers.length; i += 1) {
                    const current = offers.slice(i, k)
                    let j = i
                    k += 1
                    let info = ``
                    info = current.map(item =>
                        `**Type**: ${item.type}\n**Item**: ${item.item}\n**Listing Price**: ${item.listingPrice.toLocaleString()} coins per unit\n` +
                        `**Items on Sale**: ${item.itemsOnSale.toLocaleString()}\n**Items Filled**: ${item.itemsFilled.toLocaleString()}\n` +
                        `**${item.type === 'Buy' ? 'Items' : 'Coins'} Claimable**: ${item.itemsClaimable.toLocaleString()}\n` +
                        `**Filled**: ${item.filled === true ? 'Yes' : 'No'}`
                    ).join('\n\n')
                    const embed = new EmbedBuilder()
                        .setColor('0xa477fc')
                        .setTitle(`Your offers`)
                        .setDescription(info)
                    embeds.push(embed)
                }
                return embeds
            }
        }
    }
}