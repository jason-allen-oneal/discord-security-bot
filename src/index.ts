// index.ts
import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("ready", async () => {
  await deployCommands();
  console.log("🔒 Security Bot is online and ready for professional use!");
});

client.on("guildCreate", async (guild) => {
  await deployCommands();
});

client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  // Check if the interaction is in a DM
  if (interaction.channel?.type === "DM") {
    console.log(`Command "${commandName}" used in DMs by ${interaction.user.tag}`);
  }

  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.APP_TOKEN);