module.exports = (client) => {
   client.on('interactionCreate', async(interaction) => {
    if (!interaction.isButton()) return
    if (interaction.customId !== 'beg-again') return

    const functions = require('../checks/functions')
    const blks = await functions.blacklistCheck(interaction.user.id, interaction.guild.id, interaction)
    if (blks === true) return
    const main = await functions.checkMaintinance(interaction)
    if (main === true) return
    const cldn = await functions.cooldownCheck(interaction.user.id, 'beg', 8, interaction)
    if (cldn === true) return
    functions.createRecentCommand(interaction.user.id, 'beg', `None`, interaction)

    const command = require('../commandCode/Earth/begAgainEarth')
    command.begAgainEarth(interaction)
})
},

module.exports.config = {
   dbName: 'BEG BUTTON',
   displayName: 'Beg Button',
}