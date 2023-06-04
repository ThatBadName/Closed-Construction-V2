const { WebhookClient, EmbedBuilder } = require("discord.js");
const { blacklistWebhook, colours } = require("../../constants");
const { dmAddBlacklist, dmRemoveBlacklist } = require("../blacklist/dmSystem");

async function blacklistLog(interaction, id, expires, reason, caseId, blacklist, type, client, action, active) {
  if (action === 'add') {
    const webhookClient = new WebhookClient({url: blacklistWebhook})

    const informationEmbed = new EmbedBuilder()
    .setTitle(`Blacklist Update - ${type} added to the blacklist`)
    .setColor(colours.error)
    .setDescription(
      `ID: ${id}\nCase: ${caseId}\nBlacklist:\n${blacklist.includes('a') ? '- Main bot\n- Economy commands\n- Report system\n' : `${blacklist.includes('b') ? '- Main bot\n' : ''} ${blacklist.includes('e') ? '- Economy commands\n' : ''} ${blacklist.includes('r') ? '- Report system\n' : ''}`}` +
      `Date Added: <t:${caseId}> (<t:${caseId}:R>)\nExpires: ${expires === 'never' ? 'Never' : `<t:${Math.floor(Math.round(expires / 1000))}> (<t:${Math.floor(Math.round(expires / 1000))}:R>)`}\n` +
      `Reason:\n\`\`\`\n${reason}\n\`\`\``
    )

    const dm = await dmAddBlacklist(interaction, id, expires, reason, caseId, blacklist, type, client)
    let dmStatusEmbed = new EmbedBuilder()
    if (dm.status === 'Failed') dmStatusEmbed.setTitle('DM Failed').setColor(colours.warn).setDescription(`${dm.reason}`)
    else dmStatusEmbed.setTitle('DM Sent').setColor(colours.success).setDescription(`I have successfully DMed the user`)

    webhookClient.send({embeds: [informationEmbed, dmStatusEmbed]})
  } else {
    const webhookClient = new WebhookClient({url: blacklistWebhook})

    const informationEmbed = new EmbedBuilder()
    .setTitle(`Blacklist Update - ${type} removed from the blacklist`)
    .setColor(colours.success)
    .setDescription(
      `ID: ${id}\nCase: ${caseId}\nBlacklist removed:\n${blacklist.includes('a') ? '- Main bot\n- Economy commands\n- Report system\n' : `${blacklist.includes('b') ? '- Main bot\n' : ''} ${blacklist.includes('e') ? '- Economy commands\n' : ''} ${blacklist.includes('r') ? '- Report system\n' : ''}`}` +
      `Date Added: <t:${caseId}> (<t:${caseId}:R>)\n` +
      `Active: ${active}\nReason:\n\`\`\`\n${reason}\n\`\`\``
    )

    const dm = await dmRemoveBlacklist(interaction, id, expires, reason, caseId, blacklist, type, client)
    let dmStatusEmbed = new EmbedBuilder()
    if (dm.status === 'Failed') dmStatusEmbed.setTitle('DM Failed').setColor(colours.warn).setDescription(`${dm.reason}`)
    else dmStatusEmbed.setTitle('DM Sent').setColor(colours.success).setDescription(`I have successfully DMed the user`)

    webhookClient.send({embeds: [informationEmbed, dmStatusEmbed]})
  }
}

module.exports = {
  blacklistLog
}