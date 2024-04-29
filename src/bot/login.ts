import {
  ButtonBuilder,
  ButtonStyle,
  type UserResolvable,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ComponentType,
} from "discord.js";
import { client } from "./index";

export async function sendLoginVerifyRequest(discord_id: String) {
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

  const interaction = await user.send({
    content: "Are you trying to log in?",
    components: [row],
  });

  let response;

  try {
    response = await interaction.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });
  } catch (error) {
    await interaction.edit({
      content: "Login request expired.",
      components: [],
    });
    return false;
  }

  if (response.customId === "confirm") {
    await response.update({
      content: "Login request verified.",
      components: [],
    });
    return true;
  }
  await response.update({
    content: "Login request denied.",
    components: [],
  });
  return false;
}
