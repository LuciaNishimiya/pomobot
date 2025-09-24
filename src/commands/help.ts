import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";

export async function help(client: Client, message: OmitPartialGroupDMChannel<Message>) {
    if (message.author.bot) return;
    if (!message.content.toLowerCase().includes('!phelp')) return;

    const helpEmbed = {
        color: 0x0099ff,
        title: '🍅 Pomobot - Comandos',
        description: 'Comandos disponibles:',
        fields: [
            {
                name: '!pstart [trabajo] [descanso] [rondas] [shh]',
                value: 'Inicia un nuevo pomodoro.\n' +
                    '- trabajo: Duración del período de trabajo en minutos (por defecto: 30)\n' +
                    '- descanso: Duración del período de descanso en minutos (por defecto: 10)\n' +
                    '- rondas: Número de rondas a realizar (por defecto: 5)\n' +
                    '- shh: Opcional. Activa el modo silencioso\n' +
                    'Ejemplo: !pstart 25 5 4'
            },
            {
                name: '!pstop',
                value: 'Detiene el pomodoro actual y desmutea a todos los participantes.'
            },
            {
                name: '!shh [off]',
                value: 'Desmutea a todos los participantes en el canal de voz.\n' +
                    '- off: Opcional. Desactiva el modo silencioso del pomodoro'
            }
        ]
    };

    await message.channel.send({ embeds: [helpEmbed] });
}