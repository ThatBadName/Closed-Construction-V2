const {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js')
const items = require('../../things/items/allItems')
const planets = require('../../things/planets/allPlanets')
const boxes = require('../../things/lootBoxes/boxes')
const { colours, emojis } = require('../../things/constants')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('information')
    .setDMPermission(false)
    .setDescription('Get more information on a planet or item')
    .addSubcommand(option =>
        option.setName('item')
        .setDescription('Lookup an item')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('The item to view.')
            .setRequired(true)
            .setAutocomplete(true) 
        )
    )

    .addSubcommand(option =>
        option.setName('planet')
        .setDescription('Lookup a planet')
        .addStringOption(option =>
            option.setName('planet')
            .setDescription('The name or level of the planet to view')
            .setRequired(true)    
            .setAutocomplete(true)
        )   
    ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'item') {
            const focusedValue = interaction.options.getFocused()
            const choices = items.map(i => `${i.name},${i.id}`).sort()
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0, 25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice.split(',')[0],
                    value: choice.split(',')[1]
                }))
            )
        } else if (focusedOption.name === 'planet') {
            const focusedValue = interaction.options.getFocused()
            const choices = planets.map(p => `${p.name},${p.id}`).sort()
            const filtered = choices.filter((choice) =>
                choice.includes(focusedValue)
            ).slice(0,25)
            await interaction.respond(
                filtered.map((choice) => ({
                    name: choice.split(',')[0],
                    value: choice.split(',')[1]
                }))
            )
        }
    },

    

    async execute(
        interaction
    ) {
        const functions = require('../../commandFunctions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'item', 3, interaction)
        if (cldn === true) return
        if (interaction.options.getSubcommand() === 'item') {
            functions.createRecentCommand(interaction.user.id, 'info-item', `LOOKUP: ${interaction.options.getString('item')}`, interaction)

            let itemQuery = interaction.options.getString('item')
            itemQuery = itemQuery.toLowerCase()

            const search = !!items.find((value) => value.id === itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that item')
                    .setColor('0x' + colours.error)
                ]
            })
            const itemFound = items.find((value) => value.id === itemQuery)
            if (itemFound.type !== 'Loot Box') {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0x' + colours.blend)
                        .setTitle(`${itemFound.name}`)
                        .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\`\n**Market Value**: \`${itemFound.tradeValue.toLocaleString()}\``)
                        .setFields({
                            name: 'Type',
                            value: `\`${itemFound.type || 'None'}\``,
                            inline: true
                        }, {
                            name: 'Rarity',
                            value: `\`${itemFound.rarity || 'None'}\``,
                            inline: true
                        })
                        .setThumbnail(itemFound.url || 'https://cdn.discordapp.com/emojis/1005453599800840262.webp?size=96&quality=lossless')
                    ]
                })
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('0x' + colours.blend)
                        .setTitle(`${itemFound.name}`)
                        .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Buy Price**: \`${itemFound.buyPrice === 0 ? 'Cannot be bought' : itemFound.buyPrice.toLocaleString()}\`\n**Sell Price**: \`${itemFound.sellPrice === 0 ? 'Cannot be sold' : itemFound.sellPrice.toLocaleString()}\`\n**Market Value**: \`${itemFound.tradeValue.toLocaleString()}\``)
                        .setFields({
                            name: 'Type',
                            value: `\`${itemFound.type || 'None'}\``,
                            inline: true
                        }, {
                            name: 'Rarity',
                            value: `\`${itemFound.rarity || 'None'}\``,
                            inline: true
                        })
                        .setThumbnail(itemFound.url || 'https://cdn.discordapp.com/emojis/1005453599800840262.webp?size=96&quality=lossless')
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`rewards-${itemFound.id}`)
                            .setLabel('View content')
                            .setStyle('Secondary')
                        )
                    ]
                })
            }
        } else if (interaction.options.getSubcommand() === 'planet') {
            functions.createRecentCommand(interaction.user.id, 'info-planet', `LOOKUP: ${interaction.options.getString('planet')}`, interaction)

            let itemQuery = interaction.options.getString('planet')
            itemQuery = itemQuery.toLowerCase()

            let search
            search = !!planets.find((value) => value.id === itemQuery)
            if (!search) search = !!planets.find((value) => value.level == itemQuery)
            if (!search) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('I could not find that planet')
                    .setColor('0x' + colours.error)
                ]
            })
            itemFound = planets.find((value) => value.id === itemQuery)
            if (!itemFound) itemFound = planets.find((value) => value.level == itemQuery)
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('0x' + colours.blend)
                    .setTitle(`${itemFound.name}`)
                    .setDescription(`**${itemFound.name}** (\`${itemFound.id}\`)\n${itemFound.description}\n\n**Level Required**: \`${itemFound.level}\``)
                    .setThumbnail(itemFound.url || 'https://cdn.discordapp.com/emojis/1005453599800840262.webp?size=96&quality=lossless')
                ]
            })
        }
    }
}