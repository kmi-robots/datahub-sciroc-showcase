;;
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
//
var Teams = [
	{id: "uc3m", robot: "uc3m", color: "EE7633"},
	{id: "socrob", robot: "socrob" , color: "FBCEAE"},
	{id: "gentlebots", robot: "gentlebots", color: "55AAAA"},
	// {id: "matrix", robot: "matrix", color: "09545F", episodes: ["E03", "E12"]},
	{id: "hearts", robot: "hearts", color: "DBEEF1"},
	{id: "entity", robot: "entity", color: "77AB39"},
	{id: "leedsasr", robot: "leedsasr", color: "7BCDD7"},
	{id: "bitbots", robot: "bitbots", color: "2C5B62"},
	{id: "catie", robot: "catie", color: "84BFCB"},
	{id: "homer", robot: "homer", color: "029EB1"},
	{id: "a3t", robot: "a3t", color: "003F49"},
	{id: "bathdrones", robot: "bathdrones", color: ""},
	// {id: "spqr", robot: "spqr", color: "17A09B", episodes: ["E03", "E12"]},
	{id: "uweaero", robot: "uweaero", color: "E1EFF2"}
];
var Episodes = {
	"E03": "EPISODE3",
	"E04": "EPISODE4",
	"E07": "EPISODE7",
	"E10": "EPISODE10",
	"E12": "EPISODE12",
	"keyOf": function(v){
		var obj = this;
		for ( var prop in obj ) {
			// console.log(prop, v.toUpperCase());
			if ( obj[prop] === v.toUpperCase() ) {
				return prop;
			}
		}
		return false;
	},
	"valueOf": function(k){
		if ( this[k.toUpperCase()] ) {
			return this[k];
		}else{
			return false;
		}
	},
	"keys": function(){
		return ["E03", "E04", "E07", "E10", "E12"];
	}
};
//
//
var Status={};
Status.messages={
	"E03": {last: 0, items: [], limit: 10, episode: "EPISODE3", robot: "Tiny"},
	"E04": {last: 0, items: [], limit: 10, episode: "EPISODE4", robot: "Social"},
	"E07": {last: 0, items: [], limit: 10, episode: "EPISODE7", robot: "Rover"},
	"E10": {last: 0, items: [], limit: 10, episode: "EPISODE10", robot: "Arm"},
	"E12": {last: 0, items: [], limit: 10, episode: "EPISODE12", robot: "Drone"}
};
Status.busy=false;
Status.ready=false;
Status.update=function(episode){
	// Loads the latest messages from the teams
	// console.log(team + " starts!", Status.busy);
	Status.busy=true;
	// Launch for each episode of team
	var epi = Episodes[episode];
	var jqxhr = $.getJSON( "status.php?episode=" + epi, function() {
		
	})
	.done(function(_data) {
		// console.log("episode", Status.messages[episode]);
		Status.messages[episode].items = [];
		for ( ix in _data ){
			var m = _data[ix];
			var _timestamp = parseInt(m["_timestamp"]);
			// If it is a new message
			m.moment = moment.unix(_timestamp).fromNow();
			Status.messages[episode].items.push(m);
		}
	})
	.always(function() {
		Status.busy = false;
	});
};
Status.refresh = async function(interval = 1000){
	var elist = Episodes.keys();
	for ( var x in elist){
		var epi = elist[x];
		// Reset episodes
		while (Status.busy) {
			await sleep(500);
		}
		Status.update ( epi );
		sleep ( interval );
	}
	Status.ready = true;
};
Status.refreshMessages = async function(){
	var episode = $("body h1").data("episode");
	if (!episode) return;
	var data = Status.messages[episode];
	// console.log("Refresh messages", data);
	var output = Mustache.render($("#messages-tmpl").html(), data);
	// console.log("Html", output);
	$("body .status-target").html(output);
}
//
//
//
var Showcase={};
//
//
// Present content
Showcase.present = async function(){
	//
	// Hide everything
	var template = arguments[0];
	var target = arguments[1];
	var data = arguments[2] || {};
	var speed = arguments[3] || 0;
	var callback = arguments[4] || function(){};
	
	await Showcase.control();
	// console.log("data", data);
	//
	await $("body").fadeOut(speed/2, async function(){
		// await sleep(1000);
		var output = Mustache.render($("#"+template).html(), data);
		$("#"+target).html(output);
		// await sleep(1000);
		$("body").fadeIn(speed/2, callback);
	});

	//
	return this;
}
Showcase.control = async function(){
	var hash = window.location.hash;
	while(hash == '#stop') {
		await sleep(1000);
		hash = window.location.hash;
	}
}
//
//
//
//
var Banner = async function(keep, fade){
	await Showcase.present("banner-tmpl","slide", {}, fade);
	await sleep(keep);
}
var Static = async function(template, keep, fade){
	await Showcase.present(template + '-tmpl',"slide", {}, fade);
	await sleep(keep);
}
var Episode = async function(episode, keep, fade){
	// console.log("episode",episode);
	$.getJSON( "data/" + episode + ".json")
		.done(function(_data) {
			_data.robot = Status.messages[episode].robot;
			Showcase.present("episode-tmpl", "slide", _data, fade);
		})
		.fail(function() {
			throw "Cannot get data for " + episode ;
		});
	await sleep(keep);
}
var Info = async function(text, keep, fade){
	// 
	var o = {};
	o.text = text;
	await Showcase.present('info-tmpl',"slide", o, fade);
	await sleep(keep);
}
var RobotMessage = async function(episode, keep, fade){
	while(!Status.ready){
		await sleep(500);
	}
	var myArray = Object.keys(Status.messages);
	var message = false;
	var team = false;
	// console.log(Status.messages);
	if ( Status.messages[episode].items.length > 0 ){
		message = Status.messages[episode].items[Status.messages[episode].items.length - 1];
	}else{
		// skip 
		return true;
	}
	// console.log(message);
	var o = {};
	o.message = message;
	o.message.team = o.message.team.toUpperCase();
	o.episode = episode;
	o.image = Status.messages[episode].robot;
	// console.log(o);
	await Showcase.present('robot-tmpl',"slide", o, fade);
	await sleep(keep);
}
var InfoTeams = async function(keep, fade){
	// 
	var o = {};
	o.teams = Teams;
	await Showcase.present('teams-tmpl',"slide", o, fade);
	await sleep(keep);
}
var Monitor = async function(episode, keep, fade){
	while(!Status.ready){
		await sleep(500);
	}
	// console.log("monitor",episode);
	$.getJSON( "data/" + episode + ".json")
		.done(async function(_data) {
			var o = Status.messages[episode];
			// These needs to be sorted and cut to the latest 10
			o.items.sort(function(a, b){
			    var keyA = a._timestamp,
			        keyB = b._timestamp;
			    // Compare the 2 timestamps reverse
			    if(keyA < keyB) return 1;
			    if(keyA > keyB) return -1;
			    return 0;
			});
			o.items = o.items.slice(0,10);
			_data.messages = o;
			// console.log('---->',Episodes[episode]);
			_data.robot = Status.messages[episode].robot;
			// console.log("messages", _data);
			await Showcase.present("monitor-tmpl", "slide", _data, fade, async function(){
				var ifr = $('body iframe.monitor');
				while(ifr.length == 0){
					ifr = $('body iframe.monitor');
					await sleep(300);
				}
				var src = ifr.data('src');
				var height = ifr.height() - 2;
				var width = ifr.width() - 2;
				// console.log('height', height);
				// console.log('width', width);
				src = src + "?episode=" + _data.episode + '&width=' + width + '&height=' + height;
				ifr.attr('src', src);	
			});
		})
		.fail(function() {
			throw "Cannot get data for " + episode ;
		});
	await sleep(keep);
}
//
//
//
var Controller={};
Controller.waitFor = 10000;
Controller.fade = 5000;
Controller.loop = async function(callback, interval = 0){
	while(true){
		await callback();
		await sleep(interval);
	}
}
Controller.sequence = function(s){
	var sa = s.split(',');

	async function slide(p){
		p = p.trim();
		// console.log(p);
		var waitFor = Controller.waitFor;
		var fade = Controller.fade;
		// Set custom waitFor
		if ( p.indexOf('/') > -1 ){
			var ps = p.split('/');
			p = ps[0];
			waitFor = parseInt(ps[1]) * 1000;
			// console.log("waitForCustom", waitFor)
		}
		if ( p.startsWith('robot') && p.indexOf(':') > -1){
			var ep = p.split(':')[1];
			if(['E03','E04','E07','E10','E12'].indexOf(ep) > -1){
				await RobotMessage(ep, waitFor, fade);
			}
		} else if ( p.startsWith('monitor') && p.indexOf(':') > -1){
			var ep = p.split(':')[1];
			if(['E03','E04','E07','E10','E12'].indexOf(ep) > -1){
				await Monitor(ep, waitFor, fade);
			}
		} else {
			switch (p){
				case 'teams':
					await InfoTeams(waitFor, fade);
					break;
				case 'info1':
					await Info("SciRoc is a EU-H2020 funded project supporting the European Robotics League (ERL), whose aim is to bring robot tournaments in the context of Smart Cities.", waitFor, fade);
					break;
				case 'info2':
					await Info("Autonomous robots cooperate and interact with its citizens, accomplishing tasks such as assisting customers, providing professional services, and supporting during emergency situations.", waitFor, fade);
					break;
				case 'E03':
				case 'E04':
				case 'E07':
				case 'E10':
				case 'E12':
					await Episode(p, waitFor, fade);
					// await RobotMessage(p, waitFor, fade);
					// await Monitor(p, waitFor, fade);
					break;
				default:
					await Static(p, waitFor, fade);
			}				
		}
	}
	
	if ( sa.length == 1 ) {
		slide(sa[0]);
	} else {
		Controller.loop(async function(){
			for(var x in sa){
				var p = sa[x];
				await slide(p);
			}		
		});		
	}
};
Controller.start = async function(){
	
	var url_string = window.location.href;
	var url = new URL(url_string);
	var s = url.searchParams.get("s");
	var wait = url.searchParams.get("w") || 10;
	var fade = url.searchParams.get("f") || 5;
	Controller.waitFor = wait*1000;
	Controller.fade = fade*1000;
	Controller.loop(Status.refresh, 5000);
	Controller.loop(Status.refreshMessages, 3000);
	if(s){
		Controller.sequence(s);
	}else{
		Controller.sequence('logo,info1,info2,teams,E03,robot:E03,monitor:E03/30,E04,robot:E04,monitor:E04/30,E07,robot:E07,monitor:E07/30,E10,robot:E10,monitor:E10/30,E12,robot:E12,monitor:E12/30,partners,sponsors,europe/30000');
	}
}
