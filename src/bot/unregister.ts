import { ChatInputCommandInteraction } from 'discord.js';
import prisma from '../db';

export const handleUnregister = async (interaction: ChatInputCommandInteraction) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      discord_id: interaction.user.id,
    },
  });

  if (!existingUser) {
    await interaction.reply('You have not registered a Minecraft account.');
    return;
  }

  await prisma.user.delete({
    where: {
      discord_id: interaction.user.id,
    },
  });

  await interaction.reply('Minecraft account unregistered successfully!');
};