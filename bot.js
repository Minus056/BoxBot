//require("env.js");

// var pass = process.ENV.pass; //no idea if i did this right
//===============================
var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require("fs");
bot.login("MjYzODI1MTY1Mzg3ODI1MTUz.C0YAsA.u_eQETAWuHQfMu2ot957ZepDAx8");
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
    lineCount++;
    console.log(lineCount)
    fs.writeFile('lines.json', JSON.stringify(lineCounts), console.error);
});

bot.on("message", msg => {
    if (msg.content.startsWith("ping")) {
        msg.channel.sendMessage("pong!");
    }
});

bot.on('error', e => { console.error(e); });
