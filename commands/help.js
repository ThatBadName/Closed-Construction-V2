const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require("discord.js")

module.exports = {
    name: 'help',
    aliases: [''],
    description: 'Stuck? Get some help.',
    category: 'Misc',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [{
        name: 'command',
        description: 'A command to get further info on',
        type: 'STRING',
        required: false
    }, ],
    requireRoles: false,

    callback: async ({
        interaction,
        instance
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'help', 3, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'help', `None`, interaction)

        if (!interaction.options.getString('command')) {
            let textMisc = ''
            let textFun = ''
            let textDev = ''
            let textConfig = ''
            let textEconomy = ''
            instance.commandHandler.commands.forEach((command) => {
                if (command.category === 'Misc') {
                    let commands = command.names
                    textMisc += `\`${commands[0]}\`, `
                }
                if (command.category === 'Fun') {
                    let commands = command.names
                    textFun += `\`${commands[0]}\`, `
                }
                if (command.category === 'Dev') {
                    let commands = command.names
                    textDev += `\`${commands[0]}\`, `
                }
                if (command.category === 'Config') {
                    let commands = command.names
                    textConfig += `\`${commands[0]}\`, `
                }
                if (command.category === 'Economy') {
                    let commands = command.names
                    textEconomy += `\`${commands[0]}\`, `
                }
            })
            const embed = new MessageEmbed()
                .setColor('0xa744f2')
                .setTitle('Command List')
                .setFooter({
                    text: `/help <command> for more info`
                })
            if (interaction.user.id !== '804265795835265034' && interaction.user.id !== '974856016183328789') {
                embed.setFields({
                    name: 'Fun Commands',
                    value: textFun.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Configuration Commands',
                    value: textConfig.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Economy Commands',
                    value: textEconomy.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Misc Commands',
                    value: textMisc.slice(0, -2) || 'No commands for this category'
                })
            } else {
                embed.setFields({
                    name: 'Fun Commands',
                    value: textFun.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Configuration Commands',
                    value: textConfig.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Economy Commands',
                    value: textEconomy.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Misc Commands',
                    value: textMisc.slice(0, -2) || 'No commands for this category'
                }, {
                    name: 'Owner Commands',
                    value: textDev.slice(0, -2) || 'No commands for this category'
                })
            }
            interaction.reply({
                embeds: [embed],
                components: [
                    new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Invite Me!')
                        .setStyle('LINK')
                        .setURL('https://discord.com/api/oauth2/authorize?client_id=994644001397428335&permissions=1644935244887&scope=applications.commands+bot'),
    
                        new MessageButton()
                        .setLabel('Support Server')
                        .setStyle('LINK')
                        .setURL('https://discord.gg/9jFqS5H43Q'),
    
                        new MessageButton()
                        .setLabel('Docs (Coming Soon)')
                        .setStyle('LINK')
                        .setDisabled(true)
                        .setURL('https://soumou.laurens.host'),
                    )
                ]
            })
        } else {
            const lookup = interaction.options.getString('command')
            functions.createRecentCommand(interaction.user.id, 'help', `LOOKUP: ${lookup}`, interaction)
            instance.commandHandler.commands.forEach(async (command) => {
                if (command.names[0] === lookup) {
                    let commandName = command.names[0]
                    let commandDescription = command.description
                    let commandCategory = command.category

                    const embed = new MessageEmbed()
                        .setTitle(`Info on the ${commandName} command`)
                        .setFields({
                            name: `Usage`,
                            value: `\`\`\`/${commandName}\`\`\``,
                            inline: true
                        }, {
                            name: 'Description',
                            value: `\`\`\`${commandDescription}\`\`\``,
                            inline: true
                        }, {
                            name: 'Category',
                            value: `\`\`\`${commandCategory}\`\`\``
                        })
                        .setColor('0xa744f2')

                    interaction.reply({
                        embeds: [embed],
                        components: [
                            new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel('Invite Me!')
                                .setStyle('LINK')
                                .setURL('https://discord.com/api/oauth2/authorize?client_id=994644001397428335&permissions=1644935244887&scope=applications.commands+bot'),
            
                                new MessageButton()
                                .setLabel('Support Server')
                                .setStyle('LINK')
                                .setURL('https://discord.gg/9jFqS5H43Q'),
            
                                new MessageButton()
                                .setLabel('Docs (Coming Soon)')
                                .setStyle('LINK')
                                .setDisabled(true)
                                .setURL('https://soumou.laurens.host'),
                            )
                        ]
                    })
                }
            })
            const embed = new MessageEmbed()
                .setTitle(`The command ${lookup} does not exist`)
                .setColor('0xFF0000')

            interaction.reply({
                embeds: [embed]
            }).catch((err) => {})
        }
    }
}