import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import Timer from "../services/timer";
import { playAudioInVoiceChannel } from "../services/audio";
import { createImage } from "../services/createImage";

export async function startPomodoro(client: Client, message: OmitPartialGroupDMChannel<Message>) {
    if (message.author.bot) return;
  if (!message.content.toLowerCase().includes('!pstart')) return
  if (!message.member?.voice.channel) {
    message.reply('¡Debes estar en un canal de voz para usar este comando!');
    return;
  }
  const voiceChannelId = message.member.voice.channel.id;

  const existingPomodoro = client.pomodoro.get(voiceChannelId);
  if (existingPomodoro) {
    message.reply('❌ Ya hay un pomodoro activo en este canal. Espera a que termine o usa otro canal.');
    return;
  }

  const argv: any = message.content.split(' ');
  const workDuration = parseInt(argv[1], 10) || 30;
  const breakDuration = parseInt(argv[2], 10) || 10;
  const rounds = parseInt(argv[4], 10) || 5;
  let silent = argv.includes('shh');

  const timer:any = new Timer(workDuration, breakDuration, rounds);
  timer.silent = silent;
  client.pomodoro.set(voiceChannelId, timer);
  const sentMessage = await message.channel.send(`⏳ Pomodoro iniciado.
       Trabajo: ${workDuration} minutos, Descanso: ${breakDuration} minutos, Rondas: ${rounds}`);
  timer.start();

  let lastStatus = '';
  let lastUpdateSecond = -1;
  let isUpdating = false;
  timer.subscribe(async (currentTime: { minutes: number; seconds: number, status: string, rounds: number }) => {
    console.log(currentTime);

    const statusFormatted = `${currentTime.status === 'work' ? 'Trabajo' : 'Descanso'}`;
    const timeFormatted = `${currentTime.minutes.toFixed(0).padStart(2, '0')}:${currentTime.seconds.toFixed(0).padStart(2, '0')}`
    if (currentTime.status !== lastStatus) {
      lastStatus = currentTime.status;
      playAudioInVoiceChannel(message, voiceChannelId);
      const channel = await message.guild?.channels.fetch(voiceChannelId);
      if (!channel || !channel.isVoiceBased()) {
        return
      }
      const members = [];
      for (const [_, member] of channel.members) {
        if (!member.user.bot) {
          if (timer.silent) {
            if (currentTime.status === 'work') {
              await member.voice.setMute(true, 'Silenciado por pomodoro');
            } else {
              await member.voice.setMute(false, 'Desilenciado por pomodoro');
            }
          }
          members.push(`<@${member.id}>`);
        }
      } 
      const notificationMsg = await message.channel.send(`${members.join(', ')}\n ${statusFormatted}!`);
      setTimeout(() => notificationMsg.delete().catch(console.error), 3000);
    }

    const currentSecond = Math.floor(currentTime.seconds);
    if (currentSecond % 5 !== 0 && lastUpdateSecond !== currentSecond) {
        return;
    }
    
    // Prevenir múltiples actualizaciones simultáneas
    if (isUpdating && currentTime.status !== 'finished') {
        return;
    }
    
    isUpdating = true;
    lastUpdateSecond = currentSecond;
    
    try {
        const updatedImage = await createImage(
          { width: 500, height: 500 },
          [{ type: 'image', value: `./assets/img/${currentTime.status}.png`, x: 100, y: 50, height: 200, width: 200, z: 2 },
          {
            type: 'text',
            color: '#FFF4E0',
            value: timeFormatted,
            x: 19,
            y: 300,
            height: 150,
            z: 60,
          }]
        );

        await sentMessage.edit({
          content: `# ⏳ ${timeFormatted} Estado: ${statusFormatted}
              Rondas: ${rounds}/${currentTime.rounds}`,
          files: [updatedImage],
        });
    } catch (error) {
        console.error('Error al actualizar el mensaje:', error);
    } finally {
        isUpdating = false;
    }
     if (currentTime.status === 'finished') {
      client.pomodoro.delete(voiceChannelId);
      message.channel.send('✅ Pomodoro completado!');
      return;
    }
  });
}