import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("test command")
  .toJSON();

export async function run(interaction: ChatInputCommandInteraction) {
  interaction.reply("Works");
}
