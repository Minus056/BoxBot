require("env.js");

var user = process.ENV.username; //no idea if i did this right
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

bot.login("MjYzODI1MTY1Mzg3ODI1MTUz.C0Xqqw.g_eqVUMfPm7Vz4BeTx2ikBxHMp8");
