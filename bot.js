require("env.js");

var user = process.ENV.username; //no idea if i did this right
//===============================
var Discord = require('discord.io');
var bot = new Discord.Client({
    token: "MjYzODI1MTY1Mzg3ODI1MTUz.C0Xqqw.g_eqVUMfPm7Vz4BeTx2ikBxHMp8", //shouldn't that be hidden?
    autorun: true
});
 
bot.on('ready', function() { 
    console.log(bot.username + " - (" + bot.id + ")");
});
 
bot.on('message', function(user, userID, channelID, message, event) {
    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }
});
