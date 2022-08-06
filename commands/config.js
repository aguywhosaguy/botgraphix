const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const col = client.db("discord").collection("settings");
const settings = [{name: "detectors", default: []}, {name: "bugreportchannel", default: 0}];
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure the bot.')
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('The setting to config.')
                .setRequired(true)
                .setChoices({name: 'Bug Report Channel', value: 'bugreport'}, {name: 'Reaction Detectors', value: 'detectors'})),

    async execute(interaction) {
        let count = 1;
        client.connect(async (err, client) => {
            if (err) interaction.reply("Error connecting to database."), { ephemeral: true };
            let find = await col.findOne({_id: interaction.member.guild.id});
            if (!find) {
                await col.insertOne({_id: interaction.member.guild.id});
                find = await col.findOne({_id: interaction.member.guild.id});
            }
            for (i = 0; i < settings.length; i++) {
                if (!find[settings[i].name]) {
                    let name = settings[i].name;
                    await col.updateOne({_id: interaction.member.guild.id}, {$set: {[name]: settings[i].default}});
                }
            }
            find = await col.findOne({_id: interaction.member.guild.id});
            if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
                switch (interaction.options.getString('setting')) {
                    case 'detectors':
                        if (count == 1) {
                            count += 1;
                            console.log(count);
                            let emoji = ""
                            if (find["detectors"].length == 0) {
                                await interaction.reply("No reaction detectors exist. To add one, run this command in the channel to send detected messages to and react to this message with the emoji to detect."), { ephemeral: true };
                            } else {
                                let msg = "Current reaction detectors:\n"
                                for (let i = 0; i < find.detectors.length; i++) {
                                    msg += `${find.detectors[i].emoji} in ${interaction.member.guild.channels.cache.get(find.detectors[i].channel).toString()}\n`
                                }
                                msg += "To add a reaction detector, run this command in the channel to send detected messages to and react to this message with the emoji to detect.\nTo remove a reaction detector, run this command in the channel of the detector and react with the emoji to delete."
                                await interaction.reply(msg), { ephemeral: true };
                            }
                            let reply = await interaction.fetchReply();
                            reply.createReactionCollector({ time: 360000})
                                .on('collect', (reaction, user) => {
                                    if (user.id === interaction.user.id) {
                                        let notthere = true
                                        emoji = reaction.emoji.name;
                                        for (i = 0; i < find.detectors.length; i++) {
                                            let u = find.detectors[i];
                                            if (u.emoji == emoji && u.channel == reply.channel.id) {
                                                notthere = false
                                            }
                                        }
                                        if (!notthere) {
                                            for (let i = 0, len = find.detectors.length; i < len; i++) {
                                                if (find.detectors[i].emoji == emoji && find.detectors[i].channel == reply.channel.id) {
                                                    find.detectors.splice(i, 1);
                                                    col.updateOne({_id: interaction.member.guild.id}, {$set: {detectors: find.detectors}})
                                                    interaction.followUp(`Removed ${emoji} from ${reply.channel.toString()}`), { ephemeral: true };
                                                }
                                            }

                                        } else {
                                            find.detectors.push({emoji: emoji, channel: reply.channel.id});
                                            col.updateOne({_id: interaction.member.guild.id}, {$set: {detectors: find.detectors}});
                                            interaction.followUp("Reaction detector added."), { ephemeral: true };
                                        }
                                    }
                                })
                                .on('end', (collected) => {
                                    if (emoji == "") {
                                        interaction.reply("Reaction timed out."), { ephemeral: true };
                                    }
                                
                            })
                        }
                        break;
                    case 'bugreport':
                        let collected = false
                        if (count == 1) {
                            count += 1
                            if (find.bugreportchannel == 0) {
                                await interaction.reply("No bug report channel exists. Please send the ID of the channel you wish to set it to.");
                                interaction.channel.createMessageCollector({ time: 360000 })
                                    .on('collect', (message) => {
                                        if (message.author.id === interaction.user.id && !collected) {
                                            let channel = interaction.member.guild.channels.cache.get(message.content);
                                            if (channel) {
                                                col.updateOne({_id: interaction.member.guild.id}, {$set: {bugreportchannel: channel.id}});
                                                interaction.followUp(`Bug report channel set to ${channel.toString()}`), { ephemeral: true };
                                                collected = true;
                                            } else {
                                                interaction.followUp("Invalid channel."), { ephemeral: true };
                                            }
                                        }
                                    })
                            } else {
                                await interaction.reply("Current bug report channel: " + interaction.member.guild.channels.cache.get(find.bugreportchannel).toString() + "\nIn order to set the bug report channel, please send the ID of the channel you wish to set it to."), { ephemeral: true };
                                interaction.channel.createMessageCollector({ time: 360000 })
                                    .on('collect', (message) => {
                                        if (message.author.id === interaction.user.id && !collected) {
                                            let channel = interaction.member.guild.channels.cache.get(message.content);
                                            if (channel) {
                                                if (channel.id != find.bugreportchannel) {
                                                    col.updateOne({_id: interaction.member.guild.id}, {$set: {bugreportchannel: channel.id}});
                                                    interaction.followUp(`Bug report channel set to ${channel.toString()}`), { ephemeral: true };
                                                    collected = true;
                                                } else {
                                                    interaction.followUp("Removed bug report channel."), { ephemeral: true };
                                                    col.updateOne({_id: interaction.member.guild.id}, {$set: {bugreportchannel: 0}});
                                                    collected = true;
                                                }
                                            } else {
                                                interaction.followUp("Invalid channel."), { ephemeral: true };
                                            }
                                        }
                                    })
                            }
                        }
                }
            }
        })
    }
}