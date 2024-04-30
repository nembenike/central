import {
  ButtonBuilder,
  ButtonStyle,
  type UserResolvable,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { client } from "./index";

export async function sendLoginVerifyRequest(discord_id: string, ip: string) {
  const user = await client.users.fetch(discord_id as UserResolvable);

  const confirm = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Verify Login")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("deny")
    .setLabel("Deny Login")
    .setStyle(ButtonStyle.Danger);

  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      confirm,
      deny,
    );

  const embed = new EmbedBuilder()
    .setColor(0xffd617)
    .setTitle("Login Request")
    .setDescription("Someone is trying to log in to your account.")
    .setTimestamp()
    .addFields(
      { name: "From IP", value: ip }
    )
    .setFooter({ text: new Date().toTimeString().split(" ")[0] });
    

  const interaction = await user.send({
    embeds: [embed],
    components: [row],
  });

  let response;

  try {
    response = await interaction.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });
  } catch (error) {
    embed.setDescription("Login request timed out.");
    embed.setColor(0x404040)
    await interaction.edit({
      embeds: [embed],
      components: [],
    });
    return false;
  }

  if (response.customId === "confirm") {
    embed.setDescription("Login request approved.");
    embed.setColor(0x467A39);
    await response.update({
      embeds: [embed],
      components: [],
    });
    return true;
  }

  embed.setDescription("Login request denied.");
  embed.setColor(0xDA2131);
  await response.update({
    embeds: [embed],
    components: [],
  });
  return false;
}
