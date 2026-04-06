import {Client, Events, GatewayIntentBits} from "discord.js";
import { getLogger } from './utils/logger.ts';
import { processEntityDiscovered } from "./game/parser/entityParser.ts";

const client =new Client({
  intents:
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages
});

const logger = getLogger("Bot Client", true);


client.on(Events.ClientReady, (rClient)=>{
  logger.log('info', "Successfully logged on!");
})


client.login(process.env.DISCORD_TOKEN)