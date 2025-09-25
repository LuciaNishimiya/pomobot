import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
export async function unMute(client: Client, message: OmitPartialGroupDMChannel<Message>) {
    if (message.author.bot) return;
    if (!message.content.toLowerCase().includes('!shh')) return
    if (!message.member?.voice.channel) {
        message.reply('¡Debes estar en un canal de voz para usar este comando!');
        return;
    }
   const off = message.content.toLowerCase().includes('off');
   const on = message.content.toLowerCase().includes('on');
   const voiceChannelId = message.member.voice.channel.id;

    const existingPomodoro = client.pomodoro.get(voiceChannelId);
    if (existingPomodoro) {
        if (off) {
            console.log('Desactivando modo silencioso');
            existingPomodoro.silent = false;
        } 
        if (on) {
            console.log('Activando modo silencioso');
            existingPomodoro.silent = true;
        }
    }
    const channel = await message.guild?.channels.fetch(voiceChannelId);
    if (!channel || !channel.isVoiceBased()) {
        return
    }
    for (const [_, member] of channel.members) {
        if (!member.user.bot) {
            if (on) {
                await member.voice.setMute(true, 'Silenciado por pomodoro');
            } else {
                await member.voice.setMute(false, 'Desilenciado por pomodoro');
                console.log('Desilenciando a ', member.user.username);
            }
        }
    }
}