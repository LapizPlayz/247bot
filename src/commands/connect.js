const { SlashCommandBuilder } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState 
} = require('@discordjs/voice');
const { Readable } = require('stream');

class SilenceStream extends Readable {
    _read(size) {
        this.push(Buffer.alloc(size));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Connects the bot to your current voice channel 24/7'),

    async execute(interaction) {
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!memberVoiceChannel) {
            return interaction.reply({ 
                content: 'You must be in a voice channel to use this command.', 
                ephemeral: true 
            });
        }

        await interaction.deferReply();

        try {
            const connection = joinVoiceChannel({
                channelId: memberVoiceChannel.id,
                guildId: memberVoiceChannel.guild.id,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            const player = createAudioPlayer();
            player.play(createAudioResource(new SilenceStream()));
            connection.subscribe(player);

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                    ]);
                } catch (error) {
                    connection.destroy();
                }
            });

            await interaction.editReply(`Connected to **${memberVoiceChannel.name}**!`);
        } catch (error) {
            console.error('Connection error:', error);
            await interaction.editReply('Failed to connect to the voice channel.');
        }
    }
};