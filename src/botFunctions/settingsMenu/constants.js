const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder
} = require("discord.js");
const {
  colours, settings
} = require('../../constants');
const { checkSettings } = require("../main");

function settingComponents(id, current) {
  if (!current) current = 'nothing'
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`profile-settings|${id}`)
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder('Choose a setting to edit')
  
  for (const setting in settings) {
    if (settings[setting].dev === false && settings[setting].id !== 'home') {
      if (current === setting) {
        menu.addOptions({
          label: settings[setting].name,
          description: settings[setting].description,
          value: setting,
          default: true
        })
      } else {
        menu.addOptions({
          label: settings[setting].name,
          description: settings[setting].description,
          value: setting,
          default: false
        })
      }
    }
  }

  const enable = new ButtonBuilder()
    .setCustomId(`settings-Be|${settings[current].file}|${id}`)
    .setLabel('Enable')
    .setStyle('Success')

  const disable = new ButtonBuilder()
    .setCustomId(`settings-Bd|${settings[current].file}|${id}`)
    .setLabel('Disable')
    .setStyle('Danger')

  const settingsCheck = checkSettings(id)
  if (settingsCheck[settings[current].file] === true) {
    disable.setDisabled(false)
    enable.setDisabled(true)
  } else {
    disable.setDisabled(true)
    enable.setDisabled(false)
  }
  if (current !== 'nothing' && current !== 'home') {
    const components = [new ActionRowBuilder()
      .addComponents(menu),
      new ActionRowBuilder()
      .addComponents(enable, disable)
    ]
    return components
  } else {
    const components = [new ActionRowBuilder()
      .addComponents(menu)
    ]
    return components
  }

}

function settingEmbed(current) {
  const embed = new EmbedBuilder()
    .setTitle(`Settings - ${settings[current].name}`)
    .setDescription(`${settings[current].description}\n`)
    .setColor(colours.blend)
  return embed
}

module.exports = {
  settingComponents,
  settingEmbed
}