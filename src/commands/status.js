const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Checks the current voice connection status'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ 
                content: 'Status: **Offline / Not in Voice**', 
                ephemeral: true 
            });
        }

        const channelId = connection.joinConfig.channelId;
        await interaction.reply({ 
            content: `Status: **Connected** to voice channel <#${channelId}>.`, 
            ephemeral: true 
        });
    }
};