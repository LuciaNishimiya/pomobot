import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { startPomodoro } from './commands/start.js';
import { unMute } from './commands/unmute.js';
import { stopPomodoro } from './commands/stop.js';
import { help } from './commands/help.js';
declare module 'discord.js' {
  interface Client {
    pomodoro: Collection<string, any>;
  }
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.pomodoro = new Collection();
client.once('clientReady', () => {
  if (client.user) {
    console.log(`✅ Iniciado sesión como ${client.user.tag}!`);
  }
});

client.on('messageCreate', async (message) => {
  await startPomodoro(client, message);
  await unMute(client, message);
  await stopPomodoro(client, message);
  await help(client, message);
});

client.login(process.env.DISCORD_BOT_TOKEN); 