var Discord = require("discord.js");
var bot = new Discord.Client();
require("./env.js");
var pass = process.env.PASS;
bot.login(pass);

var fs = require("fs");
/*=========================================================================*/
//DETERMINE TIME
var d = new Date();
var day = d.getDate();
var month = d.getMonth()+1;
bot.on("message", function(msg)
{
    day = d.getDate();
    month = d.getMonth()+1;
});
/*=========================================================================*/

var commands = JSON.parse(fs.readFileSync('./data/commands.json', 'utf8'));
var pokemonList = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));
var abilityList = JSON.parse(fs.readFileSync('./data/abilities.json', 'utf8'));
var movesList = JSON.parse(fs.readFileSync('./data/moves.json', 'utf8'));
var itemList = require("./data/items.js");
var lineFile = './Lines/'+month+'/'+day+'.json';
var lineCounts = JSON.parse(fs.readFileSync(lineFile, 'utf8'));

var act_tok = "!";

/*=========================================================================*/
//BOT READY
bot.on('ready', function()
{
    console.log('I am ready!');
});
/*=========================================================================*/
//CHECKAPPROVED FUNCTION
var checkApproved = function(msg) {
    var IDarray = ["225382371627761684","225385390679261184","141243323003174912","179005319370768384"]; //smogon_admin,smogon_SS,mmm_mod,kaushik
    for (var i = 0; i < IDarray.length; i++) {
        if (msg.member.roles.has(IDarray[i])) {
            return true;
        }
    }
    return false;
};
/*=========================================================================*/
//LINE AND WPL COUNTER
bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.guild == null) return;

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
    fs.writeFile(lineFile, JSON.stringify(lineCounts), console.error);
});
/*=========================================================================*/
//LEADERBOARD
bot.on("message", function(msg)
{
    if (msg.content == (act_tok+"leaderboard") && checkApproved(msg))
    {
        var array = [];
        var members = Object.keys(lineCounts[msg.guild.id]);
        for (var i = 0; i < members.length; i++)
        {
            array.push([members[i], lineCounts[msg.guild.id][members[i]]]);
        }

        array.sort(function(a,b){
            return (b[1].lineCount*b[1].wpl) - (a[1].lineCount*a[1].wpl);

        });
        var leaderboardText = "```name | linecount | words/line\n";
        leaderboardText += "ordered by number of words\n```";
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

    if (msg.content == act_tok+"resetlb" && checkApproved(msg)) {

        lineCounts[msg.guild.id] = {};
        fs.writeFile(lineFile, JSON.stringify(lineCounts), console.error);
        msg.channel.sendMessage("leaderboard reset");
    }
});
/*=========================================================================*/
//RETRIEVE LEADERBOARD
bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.content.startsWith(act_tok+"getlb") && checkApproved(msg)) {
        var args = msg.content.split(" ");
        var m = args[1];
        var d = args[2];
        if (args[1] == undefined || args[2] == undefined) {
            return;
        }
        var filename = './Lines/'+m+'/'+d+'.json';
        var lc = JSON.parse(fs.readFileSync(filename, 'utf8'));
        var array = [];
        var members = Object.keys(lc[msg.guild.id]);
        for (var i = 0; i < members.length; i++)
        {
            array.push([members[i], lc[msg.guild.id][members[i]]]);
        }

        array.sort(function(a,b){
            return (b[1].lineCount*b[1].wpl) - (a[1].lineCount*a[1].wpl);

        });
        var leaderboardText = "```name | linecount | words/line\n";
        leaderboardText += "ordered by number of words\n```";
        var max = 10;
        if (args[3] != undefined) {
            max = Number(args[3]);
        } else if (array.length < 10)
        {
            max = array.length;
        }
        for (var i = 0; i < max; i++)
        {
            leaderboardText  += bot.users.get(array[i][0]).username + "  |  " + array[i][1].lineCount + "  |  " + (Math.round((array[i][1].wpl * 100)) / 100) + "\n";
        }
        msg.channel.sendMessage(leaderboardText);
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

            msg.channel.sendFile("http://www.smogon.com/dex/media/sprites/xyicons/" + args[1] + ".png", "bisharp.png", data);
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

// @@@@@@@@ items

bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    
    if (msg.content.startsWith(act_tok + "item"))
    {

        var items = itemList.BattleItems;
        var args = msg.content.split(" ");
        if (!(items[args[1]] == undefined))
        {
            var item = items[args[1]];
            var data = "```\n";
            data  += item.name + "\n" + item.desc + "\n```";
            msg.channel.sendMessage(data);
        }
        else
        {
            msg.channel.sendMessage("I can't seem to find that Item :box:\nTry writing it without spaces.");
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
            data += move.name+"\n";
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
            person2 = "me";
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
bot.on('error', function(e)
{
    console.error(e);
});
/*=========================================================================*/
/*
// var usage_data = require("./data/gen7ou-1825.json");
// double_console(usage_data.data.Weavile.Items);

// var test_url = "http://www.smogon.com/stats/2016-11/moveset/gen7ou-1825.txt";

// var request = require("request");
// request(
// {
//     url: test_url,
//     json: false
// }, function(e, res, body)
// {
//     console.log(body.indexOf("| Weavile                                | "));
// })



var base_url = "http://www.smogon.com/stats/2016-11/moveset/";
bot.on("message", function(msg)
{
    if (msg.content.startsWith(act_tok + "stats"))
    {
        var args = msg.content.split(" ");
        // check for argc
        var tier = args[1];
        var rating = args[2];
        var mon = args[3];

        var search_mon = " | " + mon;
        // 40 chars
        var diff = 40 - mon.length - 1;
        for (var i = 0; i < diff; i++)
        {
            search_mon += " ";
        }
        search_mon += "| ";

        var url = base_url + "gen7" + tier + "-" + rating + ".txt";
        var request = require("request");

        request(
        {
            url: url,
            json: false
        }, function(e, res, body)
        {
            if (!e && res.statusCode === 200)
            {
                var startInd = body.indexOf(search_mon);
                var endInd = body.indexOf(" | Checks and Counters                    | ", startInd);
                var sendStr = body.substring(startInd, endInd);
                msg.channel.sendMessage(sendStr);
                msg.channel.sendMessage("whu");
            }
            
            // double_console(startInd + " " + endInd);
            // double_console(body.substring(startInd, endInd));
        });

    }
});*/