import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice';
import path from 'path';

export function playAudioInVoiceChannel(message: any, channelId: string, retryCount: number = 0) {
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 20000; // 20 segundos

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(
      path.join(import.meta.dirname, '../../assets/clock.mp3'),
      { inlineVolume: true }
    );
    resource.volume?.setVolume(1.0);
    
    // Timeout para asegurar la desconexión y reintentar
    const disconnectTimeout = setTimeout(() => {
      if (connection) {
        connection.destroy();
        
        // Intentar reconectar si no hemos superado el máximo de intentos
        if (retryCount < MAX_RETRIES) {
          console.log(`Intento de reconexión ${retryCount + 1}/${MAX_RETRIES}`);
          playAudioInVoiceChannel(message, channelId, retryCount + 1);
        } else {
          console.error('Se superó el número máximo de intentos de reconexión');
        }
      }
    }, TIMEOUT_MS);

    player.on(AudioPlayerStatus.Idle, () => {
      clearTimeout(disconnectTimeout);
      connection.destroy();
    });

    player.on('error', (error) => {
      clearTimeout(disconnectTimeout);
      console.error('Error al reproducir:', error);
      connection.destroy();
      
      // Intentar reconectar si hay un error y no hemos superado el máximo de intentos
      if (retryCount < MAX_RETRIES) {
        console.log(`Reintentando después de error (intento ${retryCount + 1}/${MAX_RETRIES})`);
        playAudioInVoiceChannel(message, channelId, retryCount + 1);
      }
    });

    player.play(resource);
    connection.subscribe(player);
}