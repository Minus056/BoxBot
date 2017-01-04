var Discord = require("discord.js");
var bot = new Discord.Client();
require("./env.js");
var pass = process.env.PASS;
bot.login(pass);

var fs = require("fs");

var commands = JSON.parse(fs.readFileSync('./data/commands.json', 'utf8'));
var pokemonList = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));
var abilityList = JSON.parse(fs.readFileSync('./data/abilities.json', 'utf8'));
var movesList = JSON.parse(fs.readFileSync('./data/moves.json', 'utf8'));
var itemList = require("./data/items.js");
//var lineFile = './Lines/'+month+'/'+day+'.json';
//var lineCounts = JSON.parse(fs.readFileSync(lineFile, 'utf8'));

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
    if (msg.author.id == "97558452473167872" || msg.author.id == "85939885743046656") {
        return true;
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
                for (var i = 0; i < entry[0].servers.length; i++)
                {
                    if (entry[0].servers[i]._id === msg.guild.id)
                    {
                        console.log("server already exists");
                        for (var j = 0; j < entry[0].servers[i].users.length; j++)
                        {
                            if (entry[0].servers[i].users[j]._id === msg.author.id)
                            {
                                console.log("user already exists");
                                
                                var user = entry[0].servers[i].users[j];

                                entry[0].servers[i].users[j].lineCount++;
                                user.wpl = (((user.wpl * (user.lineCount-1)) + (msg.content.split(" ").length)) / (user.lineCount));
                                entry[0].servers[i].users[j].wpl = user.wpl;
                                
                                entry[0].save(function(e, data)
                                {
                                        console.log("lc/wpl updated");
                                        
                                });
                                break;
                            }
                            if (j === entry[0].servers[i].users.length - 1)
                            {
                                console.log("creating new user");
                                var user = {
                                    _id: msg.author.id,
                                    lineCount:1,
                                    wpl: msg.content.split(" ").length
                                };
                                entry[0].servers[i].users.push(user);
                                entry[0].save(function(e, data)
                                {
                                    console.log("new user created");
                                });                                
                                break;
                            }
                        }
                        break;
                    }                    

                    if (i === entry[0].servers.length - 1)
                    {
                        console.log("creating new server");
                        var server = 
                        {
                            _id: msg.guild.id,
                            users:
                            {
                                _id: msg.author.id,
                                lineCount: 1,
                                wpl: msg.content.split(" ").length
                            }
                        };

                        entry[0].servers.push(server);
                        entry[0].save(function(e, data)
                        {
                            console.log("new server added");
                        });
                    }
                }
            });
        }
    });
});
/*=========================================================================*/
//RETRIEVE LEADERBOARD
bot.on("message", function(msg)
{
    if (msg.author.bot) return;
    if (msg.guild == null) return;
    
    var array = [];
    var d = new Date();
    var date, month;
    
    var args = msg.content.split(" ");
    if ((args[1] == undefined || Number(args[1]) > 12 || Number(args[1]) < 1) || (args[2] == undefined || Number(args[2]) > 31 || Number(args[2]) < 1)) {
        date = d.getDate();
        month = d.getMonth()+1;
    } else {
        month = Number(args[1]);
        date = Number(args[2]);
    }
    
    if (msg.content.startsWith(act_tok+"lb") && checkApproved(msg)) {
        Entry.find({}, function(e, entry) {
            if (e) return handleError(e);
            for (var i = 0; i < entry.length; i++) {
                if (entry[i].day == date && entry[i].month == month) {
                    for (var j = 0; j < entry[i].servers.length; j++) {
                        console.log(entry[i].servers[j]._id, msg.guild.id);
                        if (entry[i].servers[j]._id == msg.guild.id) {
                            if (entry[i].servers[j].users.length == 0) {
                                msg.channel.sendMessage("no user data");
                                return;
                            }
                            for (var k = 0; k < entry[i].servers[j].users.length; k++) {
                                var user = entry[i].servers[j].users[k];
                                array.push([user._id,user.lineCount,user.wpl]); 
                                array.sort(function(a,b){
                                    return (b[1]*b[2]) - (a[1]*a[2]);
                                });
                                
                                var lbText = "```name | linecount | words/line\n";
                                lbText += "ordered by number of words\n```";
                                var max = 10;
                                if (array.length < 10) {
                                    max = array.length;
                                }
                                if (args[3] != undefined && args[3] <= array.length) {
                                    max = Number(args[3]);
                                } else if (args[3] > array.length) {
                                    max = array.length;
                                }
                                console.log(max);
                                for (var l = 0; l < max; l++) {
                                    lbText  += bot.users.get(array[l][0]).username + "  |  " + array[l][1] + "  |  " + (Math.round((array[l][2] * 100)) / 100) + "\n";
                                }
                            }
                            msg.channel.sendMessage(lbText);
                            return;
                        }
                        
                    }
                    msg.channel.sendMessage("no server data");
                }
            }
            msg.channel.sendMessage("no data from this day");
        });
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

        
        var sendStr = "";
        if (valid_ratings.indexOf(rating) === -1)
        {
            rating = "1760";
            mon = args[2];
            spec = args[3];
            sendStr += "Using the highest cutoff. \n";
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

            if (res.statusCode === 404)
            {
                url = base_url + tier + "-" + "1825" + ".txt";
                request(
                {
                    url: url,
                    json: false
                }, function(e2, res2, body2)
                {
                    console.log("the highest cutoff is 1825")


                    // @@@@@@@@@@ make this a function
                    var startInd = body2.indexOf(search_mon);



                    if (startInd === -1)
                    {

                    }
                    else
                    {
                        var endInd = body2.indexOf(" | Checks and Counters                    | ", startInd);
                        var body2 = body2.substring(startInd, endInd);

                        var specStartInd = body2.indexOf(spec);
                        var specEndInd = body2.indexOf(" +----------------------------------------+ ", specStartInd);
                        sendStr += body2.substring(specStartInd, specEndInd);
                        sendStr = stripUsage(sendStr);

                        sendStr = sendStr.split("\n").slice(0, 10).join("\n");

                        msg.channel.sendMessage("" + sendStr + "").catch(console.error);
                    }
                })
            }
            else
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
                    sendStr += body.substring(specStartInd, specEndInd);
                    sendStr = stripUsage(sendStr);

                    sendStr = sendStr.split("\n").slice(0, 10).join("\n");

                    msg.channel.sendMessage("" + sendStr + "").catch(console.error);
                }
            }
        });
    }
});