<?php
require_once(dirname(__FILE__) . '/twitter-api-php-master/TwitterAPIExchange.php');

function get_settings(){
	$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
	$oauth_access_token = $config['tw_token'];
	$oauth_access_token_secret = $config['tw_token_secret'];
	$consumer_key = $config['tw_consumer_key'];
	$consumer_secret = $config['tw_consumer_secret'];

	// $consumer
	/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
	$settings = array(
	    'oauth_access_token' => $oauth_access_token,
	    'oauth_access_token_secret' => $oauth_access_token_secret,
	    'consumer_key' => $consumer_key,
	    'consumer_secret' => $consumer_secret
	);
	return $settings;
}
function update_status($data){
	$settings = get_settings();
	$url = "https://api.twitter.com/1.1/statuses/update.json";
	$requestMethod = "POST";
	$twitter = new TwitterAPIExchange($settings);
	$response = $twitter->setPostfields($data)
	             ->buildOauth($url, $requestMethod)
	             ->performRequest();	
	return $response;
}

function upload_image($path ){
	try{
		$settings = get_settings();
		$url = "https://upload.twitter.com/1.1/media/upload.json";
		$type = pathinfo($path, PATHINFO_EXTENSION);

		if($type = 'jpg'){
			$type= 'jpeg';
		}
		// echo $type;die();
		$image = file_get_contents($path);
		$base64 = base64_encode($image);
		// echo $base64;die();
		// media_data, media_category=tweet_image
		$data = array (
			'media_data'=>$base64,
			'media_category'=>'tweet_image'
		);
		$requestMethod = "POST";
		$twitter = new TwitterAPIExchange($settings);
		$json =  $twitter->setPostfields($data)
		             ->buildOauth($url, $requestMethod)
		             ->performRequest();
		$o = json_decode($json);
		// print $o->media_id;
		return $o->media_id;
	}catch(Exception $e) {
		print $e->getMessage();
		return false;
	}
}

global $EPS,$Teams,$Image, $ReplyTo;
$EPS = array(
	'E03' => 'EPISODE3',
	'E04' => 'EPISODE4',
	'E07' => 'EPISODE7',
	'E10' => 'EPISODE10',
	'E12' => 'EPISODE12'
);
$Teams = array(
	'socrob' => 'SocRob',
	'gentlebots' => 'Gentlebots',
	'hearts' => 'HEARTS',
	'uc3m' => 'UC3M',
	'leedsasr' => 'LASR',
	'bitbots' => 'b-it-bots',
	'bathdrones' => 'TBDr',
	'uweaero' => 'UWE Aero',
	'catie' => 'CATIE',
	'entity' => 'eNTiTy'
);
$Image = array(
	'E03' => 'Tiny',
	'E04' => 'Social',
	'E07' => 'Rover',
	'E10' => 'Arm',
	'E12' => 'Drone'
);
$ReplyTo = array(
	'E03' => '1175061187760967680',
	'E04' => '1175061219495096322',
	'E07' => '1175061569266434048',
	'E10' => '1175061874687336448',
	'E12' => '1175061894522183682'
);

function upload_robot_status($E, $T, $test = false){
	global $EPS,$Teams,$Image, $ReplyTo;
	$team = $T;
	$episode = $EPS[$E];
	$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
	$service = $config['service'];
	$key = $config['key'];
	require dirname(__FILE__) . '/status.php';
	$j = file_get_contents(dirname(__FILE__) . '/data/' . $E . '.json');
	$data = json_decode($j);
	$image = dirname(__FILE__) . '/images/' . $Image[$E] . '.png';
	$tags = '#mkrobots #sciroc2019';

	$o = getStatusMessages( $service, $team, $episode, $key );
	// print_r($o);
	$rstatus = $o[0];
	$tags = '#mkrobots #sciroc2019';
	$message = $Teams[$team] . ' | ' . $data->code . ' | "' . trim($rstatus->message) . '" ' . $tags;
	$media_id = upload_image($image);
	if($media_id){
		$data = array(
			'status' => $message . ' @mkdatahub',
			'lat' => '52.0445736',
			'long' => '-0.7532596',
			'media_ids' => $media_id,
			'in_reply_to_status_id' => $ReplyTo[$E]
		);
		if($test){
			return $data;
		}else{
			print update_status($data);				
		}
	}
}

if (defined('STDIN') && basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"]) ) {

	if( $argv[1] == 'upload'){
		$what = $argv[2];
		print upload_image($what);
	}

	if( $argv[1] == 'itweet'){
		$image = $argv[2];
		$message = $argv[3];
		$media_id = upload_image($image);
		if($media_id){
			$data = array(
				'status' => $message,
				'lat' => '52.0445736',
				'long' => '-0.7532596',
				'media_ids' => $media_id
			);
			print update_status($data);
		}
	}

	if( $argv[1] == 'episode'){
		$j = file_get_contents(dirname(__FILE__) . '/data/' . $argv[2] . '.json');
		$data = json_decode($j);
		$image = dirname(__FILE__) . '/images/' . $argv[2] . '.jpg';
		$tags = '#mkrobots #sciroc2019';
		$message = $data->code . ' // ' . $data->title . ' -- ' . $data->description . ' ' . $tags;
		$media_id = upload_image($image);
		if($media_id){
			$data = array(
				'status' => $message,
				'lat' => '52.0445736',
				'long' => '-0.7532596',
				'media_ids' => $media_id
			);
			print update_status($data);
		}
	}

	if( $argv[1] == 'robot'){
		$E = $argv[2];
		$team = $argv[3];
		upload_robot_status($E, $team);
	}
	
	die();
}

$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
$usr = $config['usr'];
$pwd = $config['pwd'];

if(!isset($_SERVER['PHP_AUTH_USER'])){
	header('WWW-Authenticate: Basic realm="My Realm"');
	header('HTTP/1.0 401 Unauthorized');
	echo 'Not authorized';
	exit;
}
if( ! (@$_SERVER['PHP_AUTH_USER'] == $usr && @$_SERVER['PHP_AUTH_PW'] == $pwd )){
	http_response_code(403);
	print 'Forbidden';
	die();
}

if($_GET['a'] == 'Check'){
	print '<pre>';
	print_r(upload_robot_status($_GET['E'], $_GET['T'], true ));
	print '</pre>';	 
}else
if($_GET['a'] == 'Tweet'){
	print '<pre>';
	print_r(upload_robot_status($_GET['E'], $_GET['T'], false ));
	print '</pre>';	 	
}
?><html>
	<head>
	</head>
	<body style="padding: 1em;">
		<h2>Tweet</h2>	
		<form action="#" method="GET">
			<div class="form-group">
			<label for="T">Team</label>
			<select class="form-control" name="T">
			<?php foreach($Teams as $TT => $TTv):?>
				<option <?php print (@$_GET['T'] == $TT) ?"selected='selected'" : ""; ?>><?php print $TT ; ?>
			<?php endforeach; ?>	
			</select>	
			</div>
			<div class="form-group">
			<label for="E">Episode</label>
			<select class="form-control" name="E">
			<?php foreach($EPS as $EP =>$EPv):?>
				<option <?php print (@$_GET['E'] == $EP) ?"selected='selected'" : ""; ?>><?php print $EP ; ?>
			<?php endforeach; ?>	
			</select>	
			</div>
			<div class="form-group">
			<input class="btn btn-danger" type="submit" value="Tweet" name="a">
			<input class="btn btn-danger" type="submit" value="Check" name="a">			
			</div>
		</form>
	<link rel="stylesheet" href="styles/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
	<script src="scripts/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

	</body>
	</html>
