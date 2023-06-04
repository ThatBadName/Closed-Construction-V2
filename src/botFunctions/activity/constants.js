const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { colours } = require("../../constants");

const baseActivityEmbed = new EmbedBuilder()
.setTitle('Activity Menu')
.setColor(colours.blend)

module.exports = {
  baseActivityEmbed,
}