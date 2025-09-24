import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.once('clientReady', () => {
  if (client.user) {
    console.log(`✅ Iniciado sesión como ${client.user.tag}!`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.toLowerCase().includes('!shh')) return;

  // Check if the user is in a voice channel
  if (!message.member?.voice.channel) {
    return message.reply('¡Debes estar en un canal de voz para usar este comando!');
  }

  const voiceChannel = message.member.voice.channel;
  
  try {
    // Get all members in the voice channel and mute them
    for (const [_, member] of voiceChannel.members) {
      await member.voice.setMute(false, 'Silenciado por comando !shh');
    }
    
    await message.reply('🤫 ¡Todos los usuarios han sido silenciados!');
  } catch (error) {
    console.error('Error al silenciar usuarios:', error);
    await message.reply('❌ No pude silenciar a algunos usuarios. Asegúrate de que tengo los permisos necesarios.');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);