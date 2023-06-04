const { WebhookClient, EmbedBuilder } = require("discord.js");
const { dmWebhook, colours } = require("../../constants");

async function dmLog(user, interaction, content, id, attachment) {
    const webhookClient = new WebhookClient({url: dmWebhook})
    if (attachment) webhookClient.send({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`Sent by ${interaction.user} (${interaction.user.tag} | \`${interaction.user.id}\`) to ${user} (${user.tag} | \`${user.id}\`)\n\n` + content)
        .setFooter({text: `ID: ` + id})
      ],
      files: [attachment]
    })
    else webhookClient.send({
      embeds: [
        new EmbedBuilder()
        .setColor(colours.blend)
        .setDescription(`Sent by ${interaction.user} (${interaction.user.tag} | \`${interaction.user.id}\`) to ${user} (${user.tag} | \`${user.id}\`)\n\n` + content)
        .setFooter({text: `ID: ` + id})
      ]
    })
}

module.exports = {
  dmLog
}