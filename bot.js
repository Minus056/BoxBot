//require("env.js");

// var pass = process.ENV.pass; //no idea if i did this right
//===============================
var Discord = require("discord.js");
var bot = new Discord.Client();

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.on("message", msg => {
    if (msg.content.startsWith("ping")) {
        msg.channel.sendMessage("pong!");
    }
});

bot.on("message", msg => {
    if (msg.content.startsWith("ping")) {
        msg.channel.sendMessage("pong!");
    }
});

bot.on('error', e => { console.error(e); });

bot.login("MjYzODI1MTY1Mzg3ODI1MTUz.C0YAsA.u_eQETAWuHQfMu2ot957ZepDAx8");
