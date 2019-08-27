;;
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
//
var Teams = [
	{id: "uc3m", robot: "uc3m"},
	{id: "socrob", robot: "socrob"},
	{id: "gentlebots", robot: "gentlebots"},
	{id: "matrix", robot: "matrix"},
	{id: "hearts", robot: "hearts"},
	{id: "entity", robot: "entity"},
	{id: "leedsasr", robot: "leedsasr" },
	{id: "bitbots", robot: "bitbots"},
	{id: "catie", robot: "catie"},
	{id: "homer", robot: "homer"},
	{id: "a3t", robot: "a3t"},
	{id: "bathdrones", robot: "bathdrones"},
	{id: "spqr", robot: "spqr"},
	{id: "uweaero", robot: "uweaero"}
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
	}
};
//
//
var Status={};
Status.messages={
	"E03": {last: 0, items: [], limit: 10},
	"E04": {last: 0, items: [], limit: 10},
	"E07": {last: 0, items: [], limit: 10},
	"E10": {last: 0, items: [], limit: 10},
	"E12": {last: 0, items: [], limit: 10}
};
Status.update=function(team){
	
	var jqxhr = $.getJSON( "hub.php?action=status&team=" + team, function() {
		
	})
	.done(function(_data) {

		for ( ix in _data ){
			// console.log(ix, _data[ix]);
			var m = _data[ix];
			var ep = Episodes.keyOf(m["episode"]);

			if(!ep) continue;
			var _timestamp = parseInt(m["_timestamp"]);
			// If it is a new message
			var _last = Status.messages[ep].last;
			// console.log(team, {timestamp:_timestamp,last:_last, message: m});
			m.moment = moment.unix(_timestamp).fromNow();
			if ( _timestamp > _last) {
				Status.messages[ep].last = _timestamp;
				Status.messages[ep].items.unshift(m);
			} else if (Status.messages[ep].items.length < Status.messages[ep].limit ){
				Status.messages[ep].items.push(m);
			}
			while ( Status.messages[ep].items.length > Status.messages[ep].limit ){
				// remove older elements
				Status.messages[ep].items.pop();
			}
		}
	})
	.fail(function() {
		// throw "Cannot get data for " + team ;
	});
};
Status.refresh = function(interval = 1000){
	for ( t in Teams ){
		Status.update ( Teams[t].id );
		sleep ( interval );
	}
};

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
	//
	if(typeof data === "string"){
		// attempt to get the json file
		var jqxhr = $.getJSON( "data/" + data + ".json", function() {
		})
		.done(function(_data) {
			Showcase.present(template, target, _data, speed);
		})
		.fail(function() {
			throw "Cannot get data for " + data ;
		})
		.always(function() {
		//
		});
		return this;
	}
	
	// console.log("data", data);
	//
	$("body").fadeOut(speed,function(){
		// If data is already an Object
		var output = Mustache.render($("#"+template).html(), data);
		$("#"+target).html(output);
		$("body").fadeIn(speed);
	});
	//
	return this;
}

//
//
//
var Banner = async function(keep, fade){
	await Showcase.present("banner-tmpl","slide", {}, fade);
	await sleep(keep);
}
var Episode = async function(episode, keep, fade){
	await Showcase.present("episode-tmpl", "slide", episode, fade);
	await sleep(keep);	
}
var Scoreboard = async function(keep, fade){
	await Showcase.present("scoreboard-tmpl", "slide", "", fade);	
	await sleep(keep);	
}
//
//
//
var Controller={};
Controller.showcase = async function(){
	var waitFor = 10000;
	while(true){
		await Banner(waitFor, 2500);
		await Episode("E03", waitFor, 2500);
		await Showcase.present("monitor-tmpl", "slide", Status.messages["E03"], 2500);
		await sleep(waitFor);
		await Episode("E04", waitFor, 2500);
		await Episode("E07", waitFor, 2500);
		await Episode("E10", waitFor, 2500);
		await Episode("E12", waitFor, 2500);
	}
};
Controller.start = async function(){
	await Status.refresh();

	while(true){
		// console.log(Status.messages["E12"]);
		await Showcase.present("monitor-tmpl", "slide", Status.messages["E12"], 2500);
		await sleep(5000);
	}
}
