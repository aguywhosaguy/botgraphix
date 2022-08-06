const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO;
const mclient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = mclient.db("discord");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent],
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
    if (interaction.customId === "bugreport") {
        let bug = interaction.fields.getTextInputValue("bugname")
        let location = interaction.fields.getTextInputValue("bugwhere")
        let threatlevel = interaction.fields.getTextInputValue("bugthreatlevel")
        let imageurl = interaction.fields.getTextInputValue("bugimage")
        let msg = ""
        console.log(interaction.guildId)
        let find = await db.collection("settings").findOne({_id: interaction.guildId})
        channel = client.channels.cache.get(find.bugreportchannel)
        console.log(channel)
        if (channel) {
            msg += "Bug: " + bug + "\n"
            msg += "Where: " + location + "\n"
            msg += "Threat Level: "
            switch (threatlevel) {
                case "1":
                    msg += "█░░░░"
                    break;
                case "2":
                    msg += "██░░░"
                    break;
                case "3":
                    msg += "███░░"
                    break;
                case "4":
                    msg += "████░"
                    break;
                case "5":
                    msg += "█████"
                    break;
                default:
                    msg += "N/A"
                    break;
            }
            msg += "\n"
            msg += imageurl
            await interaction.reply({ content: "Bug report sent!", ephemeral: true })
            channel.send(msg)
        } else {
            await interaction.reply({ content: 'There is no bug report channel set.', ephemeral: true });
        }

    }
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
    if (reaction.message.author.id == client.user.id) {
        return
    } else {
        console.log(reaction)
        let guild = reaction.message.guildId;
        let find = await db.collection("settings").findOne({_id: guild});
        if (find) {
            for (let i = 0; i < find.detectors.length; i++) {
                let detector = find.detectors[i];
                if (detector.emoji == reaction.emoji.name) {
                    const channel = client.channels.cache.get(detector.channel);
                    if (channel) {
                        console.log(reaction.message.content)
                        await channel.send(reaction.message.content);
                    }
                }
            }
        }
    }
})

client.login(process.env.TOKEN);