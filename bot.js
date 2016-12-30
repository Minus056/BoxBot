require("./env.js");

var pass = process.env.PASS;

var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require("fs");
bot.login(pass);

var adminRoleID = "225382371627761684";
var SSRoleID = "225385390679261184";

var lineCounts = JSON.parse(fs.readFileSync('./lines.json', 'utf8'));
var commands = JSON.parse(fs.readFileSync('./commands.json', 'utf8'));
var pokemonList = JSON.parse(fs.readFileSync('./pokemon.json', 'utf8'));
var abilityList = JSON.parse(fs.readFileSync('./abilities.json', 'utf8'));
var movesList = JSON.parse(fs.readFileSync('./moves.json', 'utf8'));

var act_tok = "(";

/*=========================================================================*/
function double_console(text)
{
    console.log(text);
}
/*=========================================================================*/
//BOT READY
bot.on('ready', function()
{
    double_console('I am ready!');
});
/*=========================================================================*/
//COMMANDS WITH ARGS
bot.on("message", function(msg)
{
    if (msg.content.startsWith(act_tok + "fx"))
    {
        var args = msg.content.split(" ");
        var person1 = args[1];
        var person2;
        if (args[2] == undefined)
        {
            person2 = "me"
        }
        else
        {
            person2 = args[2];
        }
        msg.channel.sendMessage("hey " + person1 + " can you stop being a fucking asshole every time you talk to "  + 
            person2 + " . fuck you cant talk to " + person2 + " without belittling " + person2  + 
            " for no reason i dont give 2 shits if youre joking. you need to learn your limit asshole");
    }
});
/*=========================================================================*/
//!POKEMON COMMAND
bot.on("message", function(msg)
{
    if (msg.author.bot) return;

    if (msg.content.startsWith(act_tok + "pkmn"))
    {
        var args = msg.content.split(" ");
        if (!(pokemonList[args[1]] == undefined))
        {
            var poke = pokemonList[args[1]];
            var data = "```\n";
            data  += poke.species + "\n" + poke.types + "\n";

            var abilities = Object.keys(poke.abilities);
            for (var i = 0; i < abilities.length; i++)
            {
                data  += (poke.abilities[abilities[i]]);
                if (!(i == abilities.length - 1))
                {
                    data  += " | ";
                }
            }
            data  += "\n";

            var stats = Object.keys(poke.baseStats);
            for (var i = 0; i < 6; i++)
            {
                data  += (stats[i] + ": " + poke.baseStats[stats[i]]);
                if (!(i == 5))
                {
                    data  += " | ";
                }
            }

            data += "```";
            data += "\nAnalysis: ";
            data += "\nhttp://www.smogon.com/dex/sm/pokemon/" + args[1] + "/";
            data += "\nhttp://www.smogon.com/dex/media/sprites/xyicons/" + args[1] + ".png";

            msg.channel.sendMessage(data);
        }
        else
        {
            msg.channel.sendMessage("I can't seem to find that Pokemon :box:\nTry writing it like 'landorustherian' or 'aerodactylmega' instead.");
        }
    }
});
/*=========================================================================*/
//ABILITY COMMAND

bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.content.startsWith(act_tok + "ability"))
    {
        var args = msg.content.split(" ");
        if (!(abilityList[args[1]] == undefined))
        {
            var ability = abilityList[args[1]];
            var data = "```\n";
            data  += ability.name + "\n" + ability.desc + "\n```";
            msg.channel.sendMessage(data);
        }
        else
        {
            msg.channel.sendMessage("I can't seem to find that Ability :box:\nTry writing it without spaces.");
        }
    }
});
/*=========================================================================*/
//MOVES COMMAND
bot.on("message", msg => {
    if(msg.author.bot) return;
    if (msg.content.startsWith(act_tok+"move")) {
        var args = msg.content.split(" ");
        if (!(movesList[args[1]] == undefined)) {
            var move = movesList[args[1]];
            var data = "```\n";
            data += move.name+"\n"
            if (move.category == "Status") {
                data+=move.desc+"\nType: "+move.type+" || BP: "+move.power+", Acc: "+move.accuracy+
                      ", Priority: "+move.priority+" || Category: "+move.category+"```";
            } else {
                data +="Type: "+move.type+" || BP: "+move.power+", Acc: "+move.accuracy+
                      ", Priority: "+move.priority+" || Category: "+move.category+"\n"+move.desc+"```";
            }
            msg.channel.sendMessage(data);
        } else {
            msg.channel.sendMessage("I can't seem to find that Move :box:\nTry writing it without spaces.");
        }
    }
});
/*=========================================================================*/
//LINE AND WPL COUNTER
bot.on("message", function(msg)
{
    if (msg.author.bot) return;

    var serverData = lineCounts[msg.guild.id];
    if (serverData == undefined)
    {
        lineCounts[msg.guild.id] = {};
    }
    var userData = lineCounts[msg.guild.id][msg.author.id];
    if (userData == undefined)
    {
        lineCounts[msg.guild.id][msg.author.id] = {
            "lineCount": 0,
            "wpl": 1
        };
        userData = {
            "lineCount": 0,
            "wpl": 1
        };
    }
    userData.wpl = ((userData.wpl * userData.lineCount) + (msg.content.split(" ").length)) / (userData.lineCount + 1);
    userData.lineCount++;
    lineCounts[msg.guild.id][msg.author.id]["lineCount"] = userData.lineCount;
    lineCounts[msg.guild.id][msg.author.id]["wpl"] = userData.wpl;
    fs.writeFile('./lines.json', JSON.stringify(lineCounts), console.error);
});
/*=========================================================================*/
//LEADERBOARD

bot.on("message", function(msg)
{
    if (msg.content == "&leaderboard")
    { //&& msg.member.roles.has(adminRoleID)
        var array = [];
        var members = Object.keys(lineCounts[msg.guild.id]);
        for (var i = 0; i < members.length; i++)
        {
            array.push([members[i], lineCounts[msg.guild.id][members[i]]]);
        }

        array.sort(function(a,b){
            return (b[1].lineCount*b[1].wpl) - (a[1].lineCount*a[1].wpl);

        });
        var leaderboardText = "```name | linecount | words/line\n```";
        var max = 10;
        if (array.length < 10)
        {
            max = array.length;
        }
        for (var i = 0; i < max; i++)
        {
            leaderboardText  += bot.users.get(array[i][0]).username + "  |  " + array[i][1].lineCount + "  |  " + (Math.round((array[i][1].wpl * 100)) / 100) + "\n";
        }
        msg.channel.sendMessage(leaderboardText);
    }

    if (msg.content == act_tok+"resetlb" && msg.member.roles.has(adminRoleID)) {

        lineCounts[msg.guild.id] = {};
        fs.writeFile('./lines.json', JSON.stringify(lineCounts), console.error);
        msg.channel.sendMessage("leaderboard reset");
    }
});
/*=========================================================================*/
//COMMAND RESPONSES
bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (commands[msg.content])
    {
        msg.channel.sendMessage(commands[msg.content]);
    }
});
/*=========================================================================*/

bot.on('error', function(e)
{
    console.error(e);
});