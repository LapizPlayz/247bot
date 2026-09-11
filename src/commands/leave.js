const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnects the bot from the current voice channel'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ 
                content: 'The bot is not currently connected to any voice channel in this server.', 
                ephemeral: true 
            });
        }

        connection.destroy();
        await interaction.reply('Disconnected from the voice channel.');
    }
};