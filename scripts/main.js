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
	},
	"keys": function(){
		return ["E03", "E04", "E07", "E10", "E12"];
	}
};
//
//
var Status={};
Status.messages={
	"E03": {last: 0, items: [], limit: 10, episode: "EPISODE3"},
	"E04": {last: 0, items: [], limit: 10, episode: "EPISODE4"},
	"E07": {last: 0, items: [], limit: 10, episode: "EPISODE7"},
	"E10": {last: 0, items: [], limit: 10, episode: "EPISODE10"},
	"E12": {last: 0, items: [], limit: 10, episode: "EPISODE12"}
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
	
	// console.log("data", data);
	//
	$("body").fadeOut(speed,function(){
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
//
var Banner = async function(keep, fade){
	await Showcase.present("banner-tmpl","slide", {}, fade);
	await sleep(keep);
}
var Episode = async function(episode, keep, fade){
	// console.log("episode",episode);
	$.getJSON( "data/" + episode + ".json")
		.done(function(_data) {
			Showcase.present("episode-tmpl", "slide", _data, fade);
		})
		.fail(function() {
			throw "Cannot get data for " + episode ;
		});
	await sleep(keep);
}
var Monitor = async function(episode, keep, fade){
	// console.log("monitor",episode);
	$.getJSON( "data/" + episode + ".json")
		.done(function(_data) {
			var o = Status.messages[episode];
			_data.messages = o;
			Showcase.present("monitor-tmpl", "slide", _data, fade);
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
Controller.showcase = async function(){
	var waitFor = 10000;
	while(true){
		await Banner(waitFor, 2500);
		// Episodes
		await Status.refresh();
		var keys = Episodes.keys();
		// console.log(keys);
		for (var x in keys ) {
			// console.log("x", x);
			await Episode(keys[x], waitFor, 2500);
			await Monitor(keys[x], waitFor, 2500);
		}
	}
};
Controller.start = async function(){
	Controller.showcase ();
}
