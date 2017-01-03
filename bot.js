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
// var lineFile = './Lines/'+month+'/'+day+'.json';
// var lineCounts = JSON.parse(fs.readFileSync(lineFile, 'utf8'));

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
// @@@@@ 
//DATABASE

var mongoose = require("mongoose");


var mongouser = process.env.mongouser;
var mongopass = process.env.mongopass;
var mongouri = process.env.mongouri;


mongoose.connect(mongouri);
var db = mongoose.connection;
var id = 0;

// this is the format of an entry. _id is the server id, rest is self expl
// _id is something mongo always has, and since servers / users are unique, 
// we can just replace it
var entrySchema = mongoose.Schema(
{
    // _id: Number,
    month: Number,
    day: Number,
    servers: 
    [{
        _id: String, //msg.guild.id
        users:
        [{
            _id: String, //msg.author.id
            lineCount: Number,
            wpl: Number
        }]
    }]
});

var Entry = mongoose.model("Entry", entrySchema);

bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.guild == null) return;

    // findOne finds an entry based on the query. 
    // Here it is looking for the _id matching msg.guild.id
    // if it finds something, the "entry" parameter won't be null
    var d = new Date();
    Entry.find(
    {
        month: d.getMonth()+1,
        day: d.getDate()
        
    }, function(e, entry)
    {
        if (e) return handleError(e);
        if (entry.length === 0)
        {
            console.log("making new entry");
            // create a new entry based on the structure
            // basically just JSON
            var ent = new Entry({
                
                month: d.getMonth()+1,
                day: d.getDate(),
                servers: 
                [{
                    _id: msg.guild.id,
                    users:
                    [{
                        _id: msg.author.id,
                        lineCount: 1,
                        wpl: msg.content.split(" ").length
                    }]
                }]
            });
            // save it, callback is just info
            ent.save(function (e, ent)
            {
                if (e) return console.error(e);
                console.log("new entry created");
            });
        }
        else
        {
            console.log("date already exists");
            Entry.find({}, function(e, entry)
            {
                if (e) return handleError(e);
                if (entry === null) {
                    console.log("adding new server");
                    var server = 
                    {
                        _id: msg.guild.id,
                        users:
                        [{
                            _id: msg.author.id,
                            lineCount: 1,
                            wpl: msg.content.split(" ").length
                        }]
                    };
                    Entry.update({month:d.getMonth(),day:d.getDate()},
                        {$push: {servers: server}}, function(e, data) {});
                }
                else {
                    console.log("server already exists");
                    console.log(entry);

                    for (var i = 0; i < entry.servers.length; i++)
                    {
                        console.log(entry.servers[i]);
                    }


                    Entry.findOne({
                        "users._id":msg.author.id
                    }, 
                    function (e, entry) {
                        if (e) return handleError(e);
                        if (entry === null) {
                            console.log("adding new user");
                            var user = {
                                _id: msg.author.id,
                                lineCount:1,
                                wpl: msg.content.split(" ").length
                            };
                            Entry.update({_id:msg.guild.id},
                                {$push: {"servers.users":user}}, function(e, data) {});
                        }
                        else {
                            console.log("user already exists");
                            for (var i = 0; i < entry.users.length; i++) {
                                if (entry.users[i]._id === msg.author.id) {
                                    entry.users[i].linecount += 1;
                                    entry.users[i].wpl = ((entry.users[i].wpl * entry.users[i].lineCount) + (msg.content.split(" ").length)) / (entry.users[i].lineCount);
                                    break;
                                }
                            }
                            entry.save(function(e, ent) {
                                if (e) return console.error(e);
                                console.log("old user updated");
                            });
                        }
                    });
                }
            });
        }
    });
});
/*=========================================================================*/
//LINE AND WPL COUNTER
// bot.on("message", function(msg)
// {
//     if (msg.author.bot) return;
//     if (msg.guild ==null) return;
//     var serverData = lineCounts[msg.guild.id];
//     if (serverData == undefined)
//     {
//         lineCounts[msg.guild.id] = {};
//     }
//     var userData = lineCounts[msg.guild.id][msg.author.id];
//     if (userData == undefined)
//     {
//         lineCounts[msg.guild.id][msg.author.id] = {
//             "lineCount": 0,
//             "wpl": 1
//         };
//         userData = {
//             "lineCount": 0,
//             "wpl": 1
//         };
//     }
//     userData.wpl = ((userData.wpl * userData.lineCount) + (msg.content.split(" ").length)) / (userData.lineCount + 1);
//     userData.lineCount++;
//     lineCounts[msg.guild.id][msg.author.id]["lineCount"] = userData.lineCount;
//     lineCounts[msg.guild.id][msg.author.id]["wpl"] = userData.wpl;
//     fs.writeFile(lineFile, JSON.stringify(lineCounts), console.error);
// });
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
        if ((args[1] == undefined || args[1] > 12 || args[1] < 0)|| args[2] == undefined || args[2] > 31 || args[2] < 0) {
            msg.channel.sendMessage("enter something valid");
            return;
        }
        var filename = './Lines/'+m+'/'+d+'.json';
        var lc = JSON.parse(fs.readFileSync(filename, 'utf8'));
        if (JSON.stringify(lc) == "{}") {
            msg.channel.sendMessage("no data");
            return;
        }
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
        if (args[3] != undefined && args[3] <= array.length) {
            max = Number(args[3]);
        } else if (array.length < 10 || args[3] > array.length)
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
//GETDATA FUNCTION
function getData(msg,list,name) {
    var args = msg.content.split(" ");
    if (list[args[1]] != undefined)
    {
        var thing = list[args[1]];
        var data = "```\n";
        if (name == "Pokemon") {
            data  += thing.species + "\n" + thing.types + "\n";
            var abilities = Object.keys(thing.abilities);
            for (var i = 0; i < abilities.length; i++)
            {
                data  += (thing.abilities[abilities[i]]);
                if (i != abilities.length - 1)
                {
                    data  += " | ";
                }
            }
            data  += "\n";
            var stats = Object.keys(thing.baseStats);
            for (var i = 0; i < 6; i++)
            {
                data  += (stats[i] + ": " + thing.baseStats[stats[i]]);
                if (!(i == 5))
                {
                    data  += " | ";
                }
            }
            data += "```";
            data += "\nAnalysis: ";
            data += "\nhttp://www.smogon.com/dex/sm/pokemon/" + thing.species.toLowerCase() + "/";

            msg.channel.sendFile("http://www.smogon.com/dex/media/sprites/xyicons/" + thing.species.toLowerCase() + ".png", args[1]+".png", data).catch(console.error);
            return;
        } else if (name == "Move") {
            data += thing.name+"\n";
            if (thing.category == "Status") {
                data+=thing.desc+"\nType: "+thing.type+" || BP: "+thing.power+", Acc: "+thing.accuracy+
                      ", Priority: "+thing.priority+" || Category: "+thing.category+"```";
            } else {
                data +="Type: "+thing.type+" || BP: "+thing.power+", Acc: "+thing.accuracy+
                      ", Priority: "+thing.priority+" || Category: "+thing.category+"\n"+thing.desc+"```";
            }
        } else {
            data  += thing.name + "\n" + thing.desc + "\n```";
        }
        msg.channel.sendMessage(data);
    }
    else
    {
        msg.channel.sendMessage("I can't seem to find that " + name + " :box:\nTry writing it without spaces/dashes.");
    }
}
/*=========================================================================*/
//DATA COMMANDS
bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.content.startsWith(act_tok + "ability")) getData(msg, abilityList, "Ability");
    if (msg.content.startsWith(act_tok + "item")) getData(msg, itemList.BattleItems, "Item");
    if (msg.content.startsWith(act_tok + "move")) getData(msg, movesList, "Move");
    if (msg.content.startsWith(act_tok + "pokemon")) getData(msg, pokemonList, "Pokemon");
    if (commands[msg.content]) msg.channel.sendMessage(commands[msg.content]);
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

function stripUsage(str)
{
    return str.replace(/\|/g, "");
}


// check if current year-month gives 404, if it does, go back one month
var base_url = "http://www.smogon.com/stats/2016-11/moveset/"
var valid_ratings = ["0", "1500", "1630", "1760", "1500", "1695", "1825"];
var valid_specs = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
bot.on("message", function(msg)
{

    if (msg.content.startsWith(act_tok + "ustats"))
    {

        // maybe get the date so it's part of the url
        // though not 100% reliable cuz when do stats come up
        var args = msg.content.split(" ");
        // check for argc for possible scrambling or something

        if (args.length === 5 || args.length === 4 || args.length === 6)
        {
            
        }
        else
        {
            return;
        }

        var tier = args[1];
        var rating = args[2];
        var mon = args[3];
        var spec = args[4];
        if (valid_specs.indexOf(spec) === -1)
        {

        }
        if (mon === "Tapu")
        {
            mon = args[3] + " " + args[4];
            spec = args[5];
        }

        

        if (valid_ratings.indexOf(rating) === -1)
        {
            rating = "0";
            mon = args[2];
            spec = args[3];
        }


        // msg.channel.sendMessage(sendStr, {split: true}).catch(console.error);


        var search_mon = " | " + mon;
        // 40 chars
        var diff = 40 - mon.length - 1;
        for (var i = 0; i < diff; i++)
        {
            search_mon += " ";
        }
        search_mon += "| ";

        var url = base_url + tier + "-" + rating + ".txt";
        var request = require("request");

        request(
        {
            url: url,
            json: false
        }, function (e, res, body)
        {
            var startInd = body.indexOf(search_mon);

            if (startInd === -1)
            {

            }
            else
            {
                var endInd = body.indexOf(" | Checks and Counters                    | ", startInd);
                var body = body.substring(startInd, endInd);

                var specStartInd = body.indexOf(spec);
                var specEndInd = body.indexOf(" +----------------------------------------+ ", specStartInd);
                var sendStr = body.substring(specStartInd, specEndInd);
                sendStr = stripUsage(sendStr);

                sendStr = sendStr.split("\n").slice(0, 10).join("\n");

                msg.channel.sendMessage("" + sendStr + "").catch(console.error);
            }




        });
    }
});