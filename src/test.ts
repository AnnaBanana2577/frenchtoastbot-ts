import { BotClient } from "./bot/BotClient";
import { ActivityType } from "discord.js";

const options = {
  botToken:
    "OTQwMzQyMjU3MTgwMDg2Mjcy.GK6aau.UiFBSoveRalWKhXwttmuKGrfjgxE-ZpEqDRz24",
  applicationId: "940342257180086272",
  guildId: "942262237513543771",
  commandsDirectory: "dist/commands",
  activity: "Ninja.io",
  activityType: ActivityType.Competing,
};

const bot = new BotClient(options);

bot.start();
