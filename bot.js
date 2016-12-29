require("./env.js");

<<<<<<< HEAD
var pass = process.ENV.pass;
=======
var pass = process.ENV.pass; //no idea if i did this right
>>>>>>> 7b588c3efc9b4c33859c88a1ef92531a48dc3865
//===============================
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