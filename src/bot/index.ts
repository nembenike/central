import dotenv from "dotenv";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";
import { handleRegister } from "./register";

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN || "";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";

const rest = new REST({ version: "10" }).setToken(TOKEN);
export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandData = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register your Minecraft account")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Your Minecraft username")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(16),
  );

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "register") {
    handleRegister(interaction);
  }
});

const createBot = async () => {
  client.login(TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [commandData.toJSON()],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};

export default createBot;
