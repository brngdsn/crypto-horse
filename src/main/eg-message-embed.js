const { Client: DiscordClient, MessageEmbed } = require('discord.js')

const discordClient = new DiscordClient()
discordClient.login(`ODM0ODg5NDQwMTQ0NTIzMzk2.YIHdYg.j9P3gXSxGzDp5lNzKq8aBUaN9tE`)

discordClient.once('ready', async () => {
  // inside a command, event listener, etc.
  const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Carbon Moon/CARBON')
    // .setURL('https://exchange.pancakeswap.finance/#/swap?outputCurrency=0x75673a95ec6851cf686b9fe8d99e886ca830157e')
    // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription('0x75673a95ec6851cf686b9fe8d99e886ca830157e')
    // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
      { name: '__115 txn__ with __68 addresses__ for 8 decimals @ 10,000,000,000,000 tokens', value: '[poocoin](https://discordjs.guide/) [bogged](https://discordjs.guide/) [token-sniffer](https://discordjs.guide/)' },
      { name: 'Top 5 Holders', value: `\`\`\` 40.0000% ...0000dead
 36.5049% ...dc705b27
 10.0000% ...f002a95e
  2.3478% ...68c442an
  1.2141% ...c62f1ef4\`\`\``}
      // { name: '\u200B', value: '\u200B' },
      // { name: 'Inline field title', value: 'Some value here', inline: true },
      // { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    // .addField('Chart', '[poocoin](https://discordjs.guide/ \'optional hovertext\')', true)
    // .addField('Chart', '[bogged](https://discordjs.guide/ \'optional hovertext\')', true)
    // .setImage('https://i.imgur.com/wSTFkRM.png')
    .setTimestamp()
    // .setFooter('Pancakeswap', 'https://exchange.pancakeswap.finance/#/swap?outputCurrency=0x75673a95ec6851cf686b9fe8d99e886ca830157e');

    const discordChannel = discordClient.channels.cache.find(channel => `${channel.id}` === `835332922235420673`)
    discordChannel.send(exampleEmbed)
})