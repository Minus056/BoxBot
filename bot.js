require("./env.js");

var pass = process.env.PASS;

var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require("fs");
bot.login(pass);
var console_chan_id = "263901361127686159";
var lineCounts = JSON.parse(fs.readFileSync('lines.json', 'utf8'));


var bot_activation_token_start = "(";
var bot_activation_token_stop = ")";


function double_console(text)
{
    console.log(text);
    bot.channels.get(console_chan_id).sendMessage(text);
}


bot.on('ready', () => {
  double_console('I am ready!');
});

bot.on("message", msg => {
    if(msg.author.bot) return;
    let lineCount = lineCounts[msg.author.id];
    double_console(lineCount);
    if (!lineCount) {
        lineCount = 0;
        double_console(lineCount);
    }

    lineCount++;
    double_console(lineCount)
    fs.writeFile('lines.json', JSON.stringify(lineCounts), console.error);
});

bot.on("message", msg => {
    if (msg.content.startsWith("ping")) {
        msg.channel.sendMessage("pong!");
    }

});

bot.on('error', e => { console.error(e); });