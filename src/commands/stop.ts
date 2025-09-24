import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
export async function stopPomodoro(client: Client, message: OmitPartialGroupDMChannel<Message>) {
    if (message.author.bot) return;
    if (!message.content.toLowerCase().includes('!pstop')) return
    if (!message.member?.voice.channel) {
        message.reply('¡Debes estar en un canal de voz para usar este comando!');
        return;
    }
    const voiceChannelId = message.member.voice.channel.id;

    const existingPomodoro = client.pomodoro.get(voiceChannelId);
    if (!existingPomodoro) {
        message.reply('❌ No hay un pomodoro activo en este canal.');
        return;
    }
    existingPomodoro.stop();
    client.pomodoro.delete(voiceChannelId);
    message.channel.send('⏹️ Pomodoro detenido.');
    const channel = await message.guild?.channels.fetch(voiceChannelId);
    if (!channel || !channel.isVoiceBased()) {
        return
    }
    for (const [_, member] of channel.members) {
        if (!member.user.bot) {
            await member.voice.setMute(false, 'Desilenciado por pomodoro');
        }
    }
}