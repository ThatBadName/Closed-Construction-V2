module.exports = {
    name: 'dig',
    aliases: [''],
    description: 'Go dig in the soil and see what you get',
    category: 'Economy',
    slash: true,
    ownerOnly: false,
    guildOnly: true,
    testOnly: false,
    options: [],

    callback: async ({
        interaction
    }) => {
        const functions = require('../checks/functions')
        const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
        if (blks === true) return
        const main = await functions.checkMaintinance(interaction)
        if (main === true) return
        const cldn = await functions.cooldownCheck(interaction.user.id, 'dig', 8, interaction)
        if (cldn === true) return
        functions.createRecentCommand(interaction.user.id, 'dig', `None`, interaction)

        const command = require('../commandCode/Earth/digEarth')
        command.digOnEarth(interaction)
    }
}