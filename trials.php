<?php
$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
$key = $config['key'];
$service = $config['trials_service'];

// Get last messages for each team / episode.



function getTrials( $service, $key){
	
	// Create a new cURL resource
	$curl = curl_init(); 

	if (!$curl) {
	    die("Couldn't initialize a cURL handle"); 
	}

	// Set the file URL to fetch through cURL
	curl_setopt($curl, CURLOPT_URL, $service);
	// Set a different user agent string (SciRoc Showcase)
	curl_setopt($curl, CURLOPT_USERAGENT, 'SciRoc Showcase'); 
	curl_setopt($curl, CURLOPT_USERPWD, $key . ":" . $key);  
	// Follow redirects, if any
	curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); 
	// Fail the cURL request if response code = 400 (like 404 errors) 
	curl_setopt($curl, CURLOPT_FAILONERROR, true); 
	// Return the actual result of the curl result instead of success code
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	// Wait for 10 seconds to connect, set 0 to wait indefinitely
	curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
	// Execute the cURL request for a maximum of 50 seconds
	curl_setopt($curl, CURLOPT_TIMEOUT, 50);
	// Do not check the SSL certificates
	// curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	// Fetch the URL and save the content in $html variable
	$html = curl_exec($curl); 

	// Check if any error has occurred 
	if (curl_errno($curl)) 
	{
	    $html = '{"error": "cURL error: ' . curl_error($curl) . '", "service": "' . $service . '"}'; 
	} 
	else 
	{
	}

	// close cURL resource to free up system resources
	curl_close($curl);
	return json_decode($html);
}

$action = @$_GET['action'] || 'trials';
$teams = [
	"uc3m",
	"socrob",
	"gentlebots",
	// "matrix",
	"hearts",
	"entity",
	"leedsasr",
	"bitbots",
	"catie",
	"homer",
	"a3t",
	"bathdrones",
	"spqr",
	"uweaero"
];
switch($action){
	case 'trials':
		// cURL executed successfully
		$episode = @$_GET['episode'];
		$status = [];
		$json = getTrials( $service, $key );
		if(!is_array($json)){
			// Error
		}else{
			foreach($json as $trial){
				$arr = [];
				if(  ( empty($episode) || ($trial->episode == $episode) )
				&& preg_match('/trial[0-9]/', $trial->_id, $arr) == 1){
					array_push($status,$trial);
				}
			}
			// $status = array_merge($status, $json);
		}
		header ( "Content-type: application/json" );
		function cmp($a, $b)
		{
			return intVal($a->score) < intval($b->score);
		}
		usort($status, "cmp");
		// $status = array_slice($status, -10);
		print json_encode($status);
		break;
	default:
		throw new Exception("Unknown or missing action: " . $action);
}

