const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require('dotenv').config();
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
let commandid = 1005208541554032710
rest.delete(Routes.applicationCommand(process.env.CLIENTID, commandid))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);