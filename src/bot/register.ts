import { ChatInputCommandInteraction } from 'discord.js';
import prisma from '../db';


export const handleRegister = async (interaction: ChatInputCommandInteraction) => {
  const username = interaction.options.getString('username');
  if (!username) return;

  const existingMinecraftUser = await prisma.user.findFirst({
    where: {
      mc_username: username,
    },
  });

  if (existingMinecraftUser) {
    await interaction.reply('This Minecraft username is already registered.');
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      discord_id: interaction.user.id,
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        discord_id: interaction.user.id,
        mc_username: username,
      },
    });
    await interaction.reply('Minecraft account registered successfully!');
  } else {
    await interaction.reply(
      'You have already registered a Minecraft account.',
    );
  }
};