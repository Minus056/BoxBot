require("./env.js");

var pass = process.env.PASS;

var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require("fs");
bot.login(pass);
var lineCounts = JSON.parse(fs.readFileSync('lines.json', 'utf8'));

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.on("message", msg => {
    if(msg.author.bot) return;
    let lineCount = lineCounts[msg.author.id];
    console.log(lineCount);
    if (!lineCount) {
        lineCount = 0;
        console.log(lineCount);
    }
    lineCounts[msg.author.id] = lineCount++;
    bot.channels.get("263901361127686159").sendMessage(lineCount++, lineCounts[msg.author.id]);
    fs.writeFile('lines.json', JSON.stringify(lineCounts), console.error);
});

bot.on("message", msg => {
    if (msg.content.startsWith("ping")) {
        msg.channel.sendMessage("pong!");
    }
});

bot.on('error', e => { console.error(e); });