const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const modal = new ModalBuilder()
.setCustomId('bugreport')
.setTitle('Bug Report')
const BugName = new TextInputBuilder()
.setCustomId('bugname')
.setLabel('Bug')
.setStyle(TextInputStyle.Short);

const BugWhere = new TextInputBuilder()
.setCustomId('bugwhere')
.setLabel('Where')
.setStyle(TextInputStyle.Short);

const BugThreatLevel = new TextInputBuilder()
.setCustomId('bugthreatlevel')
.setLabel('Threat Level (Must be a number between 1-5)')
.setStyle(TextInputStyle.Short)

const BugImageRaw = new TextInputBuilder()
.setCustomId('bugimage')
.setLabel('Image: (Must be a raw image URL)')
.setStyle(TextInputStyle.Short);
modal.addComponents(new ActionRowBuilder().addComponents(BugName), new ActionRowBuilder().addComponents(BugWhere), new ActionRowBuilder().addComponents(BugThreatLevel), new ActionRowBuilder().addComponents(BugImageRaw));
module.exports = {
    data: new SlashCommandBuilder()
        .setName('bugreport')
        .setDescription('Report a bug.'),
    async execute(interaction) {
        await interaction.showModal(modal);
    }


}