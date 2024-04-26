import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN || '';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';

import prisma from '../db';
import { REST, Routes, SlashCommandBuilder, UserResolvable, ButtonBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle, ComponentType } from 'discord.js';

const commandData = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register your Minecraft account')
  .addStringOption(option =>
    option.setName('username')
      .setDescription('Your Minecraft username')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(16)
  );

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [commandData.toJSON()] });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'register') {
    const username = interaction.options.getString('username');
    if (!username) return;

    const existingMinecraftUser = await prisma.user.findFirst({
      where: {
        mc_username: username
      }
    });

    if (existingMinecraftUser) {
      await interaction.reply('This Minecraft username is already registered.');
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        discord_id: interaction.user.id
      }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          discord_id: interaction.user.id,
          mc_username: username,
        }
      });
      await interaction.reply('Minecraft account registered successfully!');
    } else {
      await interaction.reply('You have already registered a Minecraft account.');
    }
  }
});

export async function sendLoginVerifyRequest(discord_id: String) {
  const user = await client.users.fetch(discord_id as UserResolvable);
  
  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Verify Login')
    .setStyle(ButtonStyle.Success)
  
  const deny = new ButtonBuilder()
    .setCustomId('deny')
    .setLabel('Deny Login')
    .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents(confirm, deny)

  const interaction = await user.send({
    content: 'Are you trying to log in?',
    components: [row]
  });

  const response = await interaction.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000
  });

  if (response.customId === 'confirm') {
    await interaction.reply('Login verified!');
    return true;
  }
  await interaction.reply('Login denied!');
  return false;
}

const createBot = () => {
  client.login(TOKEN);
}

export default createBot;