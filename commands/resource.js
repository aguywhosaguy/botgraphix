const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resource')
        .setDescription('Sends a BADGRAPHIX related resource.')
        .addStringOption(option =>
            option.setName('resource')
                .setDescription('The resource to send.')
                .setRequired(true)
                .setChoices(
                    { name: 'Orange Key Corkboard', value: 'corkboard' },
                    { name: 'Ivan', value: 'ivan' },
                    { name: 'Orange Key In The Sky', value: 'sky' },
                    { name: 'Castle In The Sky Iceberg', value: 'iceberg' },
                    { name: 'Giant', value: 'giant' },
                    { name: 'Castle In The Sky Map', value: 'citsmap' },
                    { name: 'Sky of Secrets: Everwood Map', value: 'everwoodmap' },
                    { name: "Google Slides Corkboard", value: "gslidescorkboard" },
                    { name: "Sky of Secrets Treasures", value: "treasures" },
                )
        ),
    async execute(interaction) {
        switch (interaction.options.getString('resource')) {
            case 'corkboard':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1005558740939968614/corkboard.png?width=1236&height=594');
                break;
            case 'ivan':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1005558810292785284/ivan.png')
                break;
            case 'sky':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1005558888818540644/cits_facts_11.png')
                break;
            case 'iceberg':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1005558947324899398/iceberg.png?width=340&height=681')
                break;
            case 'giant':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1005559473206739014/giant.png?width=775&height=681')
                break;
            case 'citsmap':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1000541562209579099/centuria-map.png?width=511&height=681')
                break;
            case 'everwoodmap':
                await interaction.reply('https://media.discordapp.net/attachments/476976554254139394/1000541562779996271/everwood-map.png?width=624&height=681')
                break;
            case 'gslidescorkboard':
                await interaction.reply('https://docs.google.com/presentation/d/18qOD0UAJUW9mCpNHe8gDelln14w-BpxHQIvkTnXqMgg/edit?usp=sharing')
                break;
            case 'treasures':
                await interaction.reply('https://docs.google.com/document/d/1CktCkpFDv_9Npuvvd1xLU9Ybzu04zqKHh5tmXOvr2GM/edit?usp=sharing')
                break;
        }
    }
};