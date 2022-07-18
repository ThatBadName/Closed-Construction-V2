module.exports = (client) => {
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return
            if (interaction.customId !== 'dig-again') return

            const functions = require('../checks/functions')
            const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
            if (blks === true) return
            const main = await functions.checkMaintinance(interaction)
            if (main === true) return
            const cldn = await functions.cooldownCheck(interaction.user.id, 'dig', 8, interaction)
            if (cldn === true) return
            functions.createRecentCommand(interaction.user.id, 'dig', `None`, interaction)

            const command = require('../commandCode/Earth/digAgainEarth')
            command.digAgainOnEarth(interaction)
        })
    },

    module.exports.config = {
        dbName: 'DIG BUTTON',
        displayName: 'Dig Button',
    }