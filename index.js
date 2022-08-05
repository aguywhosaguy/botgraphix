const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandspath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandspath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filepath = path.join(commandspath, file);
    const command = require(filepath);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand) return;
    const command = client.commands.get(interaction.command);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (err) {
        console.log(err);
        await interaction.reply('Something went wrong!');
    }
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton) return;
    console.log("button pressed");
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit) return;
    console.log("modal submitted");
})

client.login(process.env.TOKEN);