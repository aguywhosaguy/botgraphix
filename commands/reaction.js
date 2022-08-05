const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('node:fs');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const col = client.db("discord").collection("detectors");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reaction')
		.setDescription('Add a reaction detector to the server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to add the reaction detector to.')
                .setRequired(true)
        ),
	async execute(interaction) {
        let detectoradded = false
        if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const channel = interaction.options.getChannel('channel');
            await interaction.reply('Please react to this message with the emoji you want to detect.');
            let msg = await interaction.fetchReply();
            msg.createReactionCollector({ time: 360000})
                .on('collect', (reaction, user) => {
                    if (user.id === interaction.user.id) {
                        client.connect(async (err, client) => {
                            if (err) msg.reply("Error connecting to database."), { ephemeral: true };
                            try {
                                let find = await col.findOne({_id: interaction.member.guild.id});
                                if (!find) {
                                    msg.reply("Detector added.");
                                    await col.insertOne({_id: interaction.member.guild.id, detectors: [{channel: channel.id, emoji: reaction.emoji.name}]});
                                } else {
                                    if (!find.detectors.find(detector => detector.channel === channel.id && detector.emoji === reaction.emoji.name)) {
                                        find.detectors.push({channel: channel.id, emoji: reaction.emoji.name});
                                        await col.updateOne({_id: interaction.member.guild.id}, {$set: {detectors: find.detectors}});
                                    } else {
                                        msg.reply("This reaction detector already exists."), {ephemeral: true};
                                    }
                                }
                            } catch (error) {
                                msg.reply("Error inserting into database."), {ephemeral: true};
                            }
                        detectoradded = true;
                        });
                    }
                })
                .on('end', (collected) => {
                    if (!detectoradded) {
                        msg.reply('No reaction detected.');
                    }
                })
        } else {
            await interaction.reply('You do not have permission to add a reaction detector.'), { ephemeral: true };
            return;
        }
	}
};