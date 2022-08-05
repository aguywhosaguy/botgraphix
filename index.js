const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO;
const mclient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = mclient.db("discord");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
partials: [Partials.Channel, Partials.Reaction, Partials.Message] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}
client.once('ready', () => {
    console.log('Ready!');
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    console.log("button pressed");
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    console.log("modal submitted");
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    let guild = reaction.message.guildId;
    let find = await db.collection("detectors").findOne({_id: guild});
    if (find) {
        for (const detector of find.detectors) {
            if (detector.emoji == reaction.emoji.name) {
                const channel = client.channels.cache.get(detector.channel);
                if (channel) {
                    await channel.send(reaction.message.content);
                }
            }
        }
    }
})

client.login(process.env.TOKEN);