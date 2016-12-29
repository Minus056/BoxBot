require("./env.js");

var pass = process.env.PASS;

var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require("fs");
bot.login(pass);

var console_chan_id = "263901361127686159";
var console_chan = bot.channels.get(console_chan_id);

var lineCounts = JSON.parse(fs.readFileSync('./lines.json', 'utf8'));
var commands = JSON.parse(fs.readFileSync('./commands.json', 'utf8'));

var act_tok = "&";
var bot_activation_token_start = "((";
var bot_activation_token_stop = "))";

/*=========================================================================*/
function double_console(text)
{
    console.log(text);
    bot.channels.get(console_chan_id).sendMessage("``` " + text + " ```");
}
/*=========================================================================*/
//BOT READY
bot.on('ready', () => 
{
  double_console('I am ready!');
});
/*=========================================================================*/
//LINE AND WPL COUNTER
bot.on("message", msg => {
    if(msg.author.bot) return;
    
    var userData = lineCounts[msg.author.id];
    if (userData == undefined) {
        lineCounts[msg.author.id] = {"lineCount":0,"wpl":1};
        userData = {"lineCount":0,"wpl":1};
    }
    userData.wpl = ((userData.wpl*userData.lineCount)+(msg.content.split(" ").length))/(userData.lineCount+1);
    userData.lineCount++;
    lineCounts[msg.author.id]["lineCount"] = userData.lineCount;
    lineCounts[msg.author.id]["wpl"] = userData.wpl;
    fs.writeFile('./lines.json', JSON.stringify(lineCounts), console.error);
});
/*=========================================================================*/
//JSON ORGANIZER
var array = [];
bot.on("message", msg => {
     for (var i = 0; i < lineCounts.length; i++) {
         array.push(lineCounts[i], lineCounts[i].lineCount, lineCounts[i].wpl);
     }
     array.sort(function(a,b){
         return b[1] - a[1];
     });
     if (msg.content == "&leaderboard") {
        if (array.length > 10) {
            for (var i = 0; i < 10; i++) {
                console.log(array[i], array[i][1], array[i][2]);
            }
        } else {
            for (var i = 0; i < array.length; i++) {
                console.log(array[i], array[i][1], array[i][2]);
            }
        }
     }
});
/*=========================================================================*/
//COMMAND RESPONSES
bot.on("message", msg => {
     if (commands[msg.content]) {
         msg.channel.sendMessage(commands[msg.content]);
     }
});
/*=========================================================================*/

bot.on('error', e => 
{ 
        console.error(e); 
        console_chan.sendMessage(e);
    });
