import {
  Client,
  SlashCommandBuilder,
  Collection,
  GatewayIntentBits,
  Interaction,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";

interface BotClientConfig {
  botToken: string;
  applicationId: string;
  guildId: string;
  commandsDirectory: string;
  activity: string;
  activityType: number;
  debug?: boolean;
}

export class BotClient extends Client {
  private commands: Array<SlashCommandBuilder> = [];
  private commandHandlers: Collection<string, Function> = new Collection();

  constructor(private readonly config: BotClientConfig) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
      ],
    });

    this.once("ready", async () => {
      console.log(`Logged in as ${this.user?.tag}`);
      this.user?.setActivity(this.config.activity, {
        type: this.config.activityType,
      });
      await this.loadCommands();
    });
    this.on("interactionCreate", this.handleCommand);
  }

  public start() {
    this.login(this.config.botToken);
  }

  private async loadCommands() {
    const absoulteDirectory =
      process.cwd() + "/" + this.config.commandsDirectory;
    if (!fs.existsSync(absoulteDirectory))
      throw new Error(`Directory ${absoulteDirectory} doesn't exist.`);
    const files = fs
      .readdirSync(absoulteDirectory)
      .filter(f => f.endsWith(".js"));
    if (files.length == 0) {
      console.log(
        `No command files found in provided directory: ${absoulteDirectory}`
      );
      return;
    }

    await this.scanCommands(absoulteDirectory);
    await this.registerCommands();
  }

  private async scanCommands(directory: string) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const path = `${directory}/${file}`;
      if (fs.lstatSync(path).isDirectory()) await this.scanCommands(path);
      if (!path.endsWith(".js")) continue;
      const module = await import(path);
      if (!module.data) continue;
      this.commands.push(module.data);
      console.log(`Loaded ${file}`);
      if (module.run) this.commandHandlers.set(module.data.name, module.run);
    }
  }

  private async registerCommands() {
    const rest = new REST({ version: "10" }).setToken(this.config.botToken);
    await rest.put(
      Routes.applicationGuildCommands(
        this.config.applicationId,
        this.config.guildId
      ),
      { body: this.commands }
    );
    console.log("Slash commands registered");
  }

  private async handleCommand(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    const commandName = interaction.commandName;
    const commandHandler = this.commandHandlers.get(commandName);

    if (commandHandler)
      await commandHandler(interaction).catch((error: any) => {
        if (this.config.debug) throw error;
        console.log(`Error executing ${commandName}: ${error}`);
      });
    else
      interaction.reply({
        content: `No command handler found for /${commandName}.`,
        ephemeral: true,
      });
  }
}
