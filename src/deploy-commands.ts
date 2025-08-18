// deploy-commands.ts
import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands/";

const commandsData = Object.values(commands).map((command) => {
  const json = command.data.toJSON();
  json.dm_permission = true; // 👈 Force DM usage allowed
  return json;
});

const rest = new REST({ version: "10" }).setToken(config.APP_TOKEN);

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands globally.");

    await rest.put(
      Routes.applicationCommands(config.APP_ID), // Register commands globally
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands globally.");
  } catch (error) {
    console.error(error);
  }
}