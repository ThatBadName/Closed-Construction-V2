const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js')
let items = require('../../items/itemList')
const {
    colours,
    emojis
} = require('../../constants')
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use')
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
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item') {
            list = items.filter(item => item.usable === true)
            const focusedValue = interaction.options.getFocused()
            const choices = list.map(i => `${i.name},${i.id}`).sort()
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
        let itemQuery = interaction.options.getString('item')
        itemQuery = itemQuery.toLowerCase()
        let amount = interaction.options.getInteger('amount') || 1
        if (amount < 1) amount = 1

        const search = !!items.find((value) => value.id === itemQuery)
        if (!search) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription('I could not find that item')
                .setColor('0x' + colours.error)
            ],
            ephemeral: true
        })
        const itemFound = items.find((value) => value.id === itemQuery)
        if (itemFound.usable === false) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription('That item cannot be used')
                .setColor('0x' + colours.error)
            ],
            ephemeral: true
        })

        if (!fs.existsSync(`./database/users/${interaction.user.id}/inventory/${itemFound.fileId}`)) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription('You do not have this item')
                .setColor('0x' + colours.error)
            ],
            ephemeral: true
        })

        const useItem = require(`../../botFunctions/useItems.js/${itemFound.id}`)
        useItem.use(interaction, amount)
    }
}