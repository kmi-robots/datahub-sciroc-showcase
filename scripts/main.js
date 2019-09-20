;;
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
//
var Teams = {
	"uc3m": {id: "uc3m", robot: "uc3m", color: "EE7633", label: "UC3M", flag: "es", description: "Robotics Lab UC3, Universidad Carlos III de Madrid (Spain)"},
	"socrob": {id: "socrob", robot: "socrob" , color: "FBCEAE", label: "SocRob", flag: "pt", description: "Instituto Superior Técnico (Portugal)"},
	"gentlebots": {id: "gentlebots", robot: "gentlebots", color: "55AAAA", label: "Gentlebots", flag: "es", description: "Rey Juan Carlos University and University of León (Spain)"},
	// {id: "matrix", robot: "matrix", color: "09545F", episodes: ["E03", "E12"]},
	"hearts": {id: "hearts", robot: "hearts", color: "DBEEF1", label: "HEARTS", flag: "gb", description: "Bristol Robotics Laboratory (UK)"},
	"entity": {id: "entity", robot: "entity", color: "77AB39", label: "eNTiTy", flag: "es", description: "Everbots – NTT Inc. (Spain)"},
	"leedsasr": {id: "leedsasr", robot: "leedsasr", color: "7BCDD7", label: "LASR", flag: "gb", description: "Leeds Autonomous Service Robots – University of Leeds (UK)"},
	"bitbots": {id: "bitbots", robot: "bitbots", color: "2C5B62", label: "b-it-bots", flag: "de", description: "Hochschule Bonn-Rhein-Sieg (Germany)"},
	"catie": {id: "catie", robot: "catie", color: "84BFCB", label: "CATIE", flag: "fr", description: "CATIE Robotics (France)"},
	// {id: "homer", robot: "homer", color: "029EB1", label: "Homer"},
	// {id: "a3t", robot: "a3t", color: "003F49", label: "A3T"},
	"bathdrones": {id: "bathdrones", robot: "bathdrones", color: "", label: "TBDr", flag: "gb", description: "TeamBathDrones research – University of Bath (UK)"},
	// {id: "spqr", robot: "spqr", color: "17A09B", episodes: ["E03", "E12"]},
	"uweaero": {id: "uweaero", robot: "uweaero", color: "E1EFF2", label: "UWE Aero", flag: "gb", description: "University of the West of England (UK)"}
};
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
	"E03": {last: 0, items: [], limit: 10, episode: "EPISODE3", robot: "Tiny", color: "#77AB39"},
	"E04": {last: 0, items: [], limit: 10, episode: "EPISODE4", robot: "Social", color: "#77AB39"},
	"E07": {last: 0, items: [], limit: 10, episode: "EPISODE7", robot: "Rover", color: "#EE7633"},
	"E10": {last: 0, items: [], limit: 10, episode: "EPISODE10", robot: "Arm", color: "#EE7633"},
	"E12": {last: 0, items: [], limit: 10, episode: "EPISODE12", robot: "Drone", color: "#029EB1"}
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
			
			for (var x in Teams){
				if (Teams[x].id == m.team){
					m.team = Teams[x].label;
					break;
				}
			}
			
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
	// Hide everything
	var template = arguments[0];
	var target = arguments[1];
	var data = arguments[2] || {};
	var speed = arguments[3] || 0;
	var callback = arguments[4] || function(){};
	
	await Showcase.control();
	//
	await $("body").fadeOut(speed/2, async function(){
		// await sleep(1000);
		var output = Mustache.render($( "#" + template).html(), data);
		$("#" + target).html(output);
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
			// console.log("_data",_data);
			_data.robot = Status.messages[episode].robot;
			Showcase.present("episode-tmpl", "slide", _data, fade);
		})
		.fail(function() {
			throw "Cannot get data for " + episode ;
		});
	await sleep(keep);
}
var Info = async function(text, keep, fade){
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
	// o.message.team = o.message.team.toUpperCase();
	o.episode = episode;
	o.image = Status.messages[episode].robot;
	await Showcase.present('robot-tmpl',"slide", o, fade);
	await sleep(keep);
}
var EventMessage = async function( keep, fade){
	while(!Status.ready){
		await sleep(500);
	}
	// Get the last message
	var jqxhr = $.getJSON( "event.php", function() {
		
	})
	.done(async function(_data) {
		var o = {};
		if(!_data[0]){
			return;
		}
		o = _data[0];
		var episode = Episodes.keyOf(o.episode);
		o.message = {};
		o.message.episode = episode;
		var _timestamp = parseInt(o["_timestamp"]);
		for (var x in Teams){
			if (Teams[x].id == o.team){
				o.message.team = Teams[x].label;
				break;
			}
		}
		// if it is a new message
		o.message.moment = moment.unix(_timestamp).fromNow();
		o.message.message = o["@type"] + ' received ';
		switch (o.type) {
			case 'Menu':
			case 'Table':
			case 'Product':
			case 'Order':
			case 'Shop':
			case 'InventoryItem':
			case 'InventoryOrder':
			case 'InventoryItemOrder':
			case 'Patient':
			case 'ImageReport':	
			case 'Team':
			case 'Episode':
			case 'Event':
			case 'Trial':
			case 'Judgement':
			case 'RobotStatus':
			case 'RobotLocation':
			default:
				o.image = Status.messages[episode].robot; // Episode Icon			
		}
		// console.log(o);
		await Showcase.present('event-tmpl',"slide", o, fade);
		await sleep(keep);
	})
	.always(function() {
		// Status.busy = false;
	});
	
}
var EventGrid = async function(keep,fade){
	// console.log('eventgrid');	
	var stop = false;
	var getItemElement = function (_data) {
		// console.log('building', _data);
		var o = {};
		o.message = {};
		o.message.message = _data.message;
		// o.message.team = o.message.team.toUpperCase();
		o.episode = Episodes.keyOf(_data.episode);
		o.image = Status.messages[o.episode].robot;
		o.message.team = Teams[_data.team].label;
		o.message.moment = moment.unix(_data._timestamp).fromNow();
		var output = Mustache.render($( "#robot-tmpl").html(), o);
		var elem = document.createElement('div');
		elem.innerHTML = output;
		var widthClass = 'grid-item--width2' ;
		var heightClass = 'grid-item--height2' ;
		elem.className = 'grid-item ' + widthClass + ' ' + heightClass;
		return elem;
	}
	
	var getImageElement = function(epi){
		var elem = document.createElement('div');
		var img = false;
		if(typeof Episodes.keys()[epi] !== 'undefined'){
			img = epi + '.jpg';
		}else{
			img = epi;
		}
		elem.innerHTML = '<img class="img-' + epi.replace(/\./,'-') + '" src="images/' + img + '"/>';
		var widthClass = 'grid-item--width2' ;
		var heightClass = 'grid-item--height2' ;
		elem.className = 'grid-item ' + widthClass + ' ' + heightClass;
		return elem;
	}

	var limit = 10;
	var queries = {
		'sciroc-logo.png': false,
		'E03': '@type:RobotStatus,episode:EPISODE3',
		'E04': '@type:RobotStatus,episode:EPISODE4',
		'E07': '@type:RobotStatus,episode:EPISODE7',
		'E10': '@type:RobotStatus,episode:EPISODE10',
		'E12': '@type:RobotStatus,episode:EPISODE12'
	}
	var rotate = [
		'sciroc-logo.png',
		'E03',
		'E04',
		'E07',
		'E10',
		'E12'
	]
	var blocks = 5;
	var qidx = 0;
	var isQuery = false;
	await Showcase.present('eventgrid-tmpl', "slide", {}, fade, async function(){
		// console.log("qidx", qidx);
		var $grid = $('#grid').masonry({
		  itemSelector: '.grid-item'
		});		
		while(!stop){

			if(!isQuery){
				// console.log("qidx", qidx);
				var elem = {};
				if(qidx >= rotate.length){
					elem = getImageElement(rotate[0]);
					qidx = 0;
				}else{
					elem = getImageElement(rotate[qidx]);
				}
				
				var $elem = $( elem );
				var elements = $('#grid .grid-item');
			
				while($('#grid .grid-item').length >= blocks){
					// console.log("elements", elements.length);
					$grid.masonry('remove', elements.first());
					elements = $('#grid .grid-item');
					await sleep(1000);
				}
				$grid.append( $elem ).masonry( 'appended', $elem ).masonry('layout');
				await sleep(2000);
				
				isQuery = true;
				continue;
			}
			
			isQuery = false;
			var query = '';
			if(qidx >= rotate.length){
				query = queries[rotate[0]];
			}else {
				query = queries[rotate[qidx]];
			}
			qidx++;

			// Build new Element
			// Get the last message
			if(query){
				await $.getJSON( "event.php?query=" + query, function() {
				})
				.done(async function(_data) {
					// console.log('_data',_data);
					if(typeof _data[0] === 'undefined'){
						return;
					}
					var elem = getItemElement(_data[0]);
					var $elem = $( elem );
					var elements = $('#grid .grid-item');
			
					while($('#grid .grid-item').length >= blocks){
						// console.log("elements", elements.length);
						$grid.masonry('remove', elements.first());
						elements = $('#grid .grid-item');
						await sleep(1000);
					}
					$grid.append( $elem ).masonry( 'appended', $elem ).masonry('layout');
					await sleep(2000);
				});
			}
			await sleep(2000);
		}
	});
	await sleep(keep);
	stop = true;
}
var Trials = async function( episode, keep, fade){
	// console.log("trials");
	// while(!Status.ready){
	// 	await sleep(500);
	// }
	var epi = Episodes[episode];
	// Get the last message
	var ts = Math.round((new Date()).getTime() / 1000);
	var jqxhr = $.getJSON( "trials.php?episode=" + epi + "&nocache=" + ts, function() {
		
	})
	.done(async function(_data) {
		var o = {};
		if(!_data){
			return;
		}
		// console.log("leaderboard",_data);
		o.trials = [];
		o.code = episode;
		o.title = 'Trials';
		o.robot = Status.messages[episode].robot;
		// console.log(o);
		// console.log("o",o);
		var pos = 0;
		for(var z in _data){
			var t = _data[z];
			t.team = Teams[t.team];
			if(t.duration > 0){
				pos++;
				t.position = pos;
				// .format('MMMM Do YYYY, h:mm:ss a');
				var start = moment(t['start-time']);
				var end = moment(t['end-time']);
				t.dow = start.format('dddd');
				t.stime = start.format('h:mm a');
				t.etime = end.format('h:mm a');
				o.trials.push(t);
			}
		}
		// console.log("o",o);
		await Showcase.present('trials-tmpl',"slide", o, fade);
		// await sleep(keep);
	})
	.always(function() {
		// Status.busy = false;
	});
	await sleep(keep);	
}
var InfoTeams = async function(keep, fade){
	// 
	var o = {};
	o.teams = [];
	for (var t in Teams){
		o.teams.push(Teams[t]);
	}
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
			_data.hostname = (window.location.hostname == 'localhost' ? 'api.pp.mksmart.org' : window.location.hostname );
			// console.log('---->',Episodes[episode]);
			_data.robot = Status.messages[episode].robot;
			_data.slider = (episode == "E12") ? true : false;
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
				var maptimeout = Controller.maptimeout;
				src = src + "?timeout=" + maptimeout + "&iconSize=" + Controller.size + "&episode=" + _data.episode + '&width=' + width + '&height=' + height;
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
Controller.waitFor = 15000;
Controller.fade = 5000;
Controller.size = 'large';
Controller.maptimeout = 60;
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
		} else if ( p.startsWith('trials') && p.indexOf(':') > -1){
			var ep = p.split(':')[1];
			if(['E03','E04','E07','E10','E12'].indexOf(ep) > -1){
				await Trials(ep, waitFor, fade);
			}
		} else if ( p.startsWith('monitor') && p.indexOf(':') > -1){
			var ep = p.split(':')[1];
			if(['E03','E04','E07','E10','E12'].indexOf(ep) > -1){
				await Monitor(ep, waitFor, fade);
			}
		} else {
			switch (p){
				case 'help':
					await Showcase.present('help-tmpl',"slide", Controller.sequences, fade);
					await sleep(waitFor);
					break;
				case 'event':
					await EventMessage(waitFor, fade);
					break;
				case 'grid':
					await EventGrid(waitFor, fade);
					break;
				case 'teams':
					await InfoTeams(waitFor, fade);
					break;
				case 'advert':
					await Showcase.present('advert-tmpl',"slide", {}, fade);
					await sleep(waitFor);
					break;
				case 'tasks':
					await Showcase.present('info2-tmpl',"slide", {}, fade);
					await sleep(waitFor);
					break;
				case 'info1':
				case 'info':
					// "SciRco"
					await Info("SciRoc is a EU-H2020 funded project \nbringing robot tournaments to city contexts", waitFor, fade);
					break;
				case 'info2':
					await Info("Autonomous robots compete in five tasks: \ntaking an elevator, deliverying medications, \nopening doors, serving customers in a coffee shop, \nand picking and packing items in a grocery store", waitFor, fade);
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
				// console.log('slide', p);
				await slide(p);
			}
			// If reload=true, reload the page at the end of any loop
			if(Controller.reload == true){
				window.location.reload();
			}	
		});		
	}
};
Controller.start = async function(){
	
	var url_string = window.location.href;
	var url = new URL(url_string);
	var s = url.searchParams.get("s");
	var i = url.searchParams.get("i");
	var wait = url.searchParams.get("w") || 20;
	var fade = url.searchParams.get("f") || 5;
	var size = url.searchParams.get("z") || 'large';
	var reload = url.searchParams.get("r")? true : false;
	var to = url.searchParams.get("m") || 60;
	
	Controller.waitFor = wait*1000;
	Controller.fade = fade*1000;
	Controller.size = size;
	Controller.loop(Status.refresh, 5000);
	Controller.loop(Status.refreshMessages, 3000);
	Controller.reload = false;
	Controller.maptimeout = to;

	if(s == 'screen'){
		Controller.reload = true;
		var ts = Math.round((new Date()).getTime() / 1000);
		$.get( "data/" + i + ".sequence?nocache=" + ts)
		.done(async function(_data) {
			Controller.sequence(_data);
		});
	}else if(s){
		Controller.sequence(s);
	}else{
		Controller.sequence('help');
	}
/* TODO
	- Info2 slide bulletpoints and 
	- Costa logo on E03
	- Ocado logo on E07
	- Teams slide with city and flags

Sciroc challenge advert
Sciroc description
Episode-specific slide
EU Flag
Consortium partners
Sponsors
SCiroc Logo
	*/
}
