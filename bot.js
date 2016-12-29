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
bot.on("message", msg => {
    var array = [];
    var members = Object.keys(lineCounts);
    for (var i = 0; i < members.length; i++) {
        array.push([members[i],lineCounts[members[i]]]);
    }
    array.sort(function(a,b){
        if (b[1].lineCount - a[1].lineCount == 0) { return b[1].wpl - a[1].wpl;}
        else {return b[1].lineCount - a[1].lineCount;}
    });
    if (msg.content == "&leaderboard") {
        var leaderboardText = "```name | linecount | words/line\n```";
        var max = 10;
        if (array.length < 10) {max = array.length;}
        for (var i = 0; i < max; i++) {
            leaderboardText += bot.users.get(array[i][0])+" | "+array[i][1].lineCount+" | "+array[i][1].wpl+"\n";
        }
        msg.channel.sendMessage(leaderboardText);
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