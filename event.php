<?php
$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
$key = $config['log_key'];
$service = $config['log_service'];

// Get last messages for each team / episode.



function getEventMessages( $service, $query, $key, $limit = 1 ){
	
	$service = $service . "" . "?limit=" . $limit;

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

	if(!empty($query)){
		$q = new stdClass();
		$pairs = explode(',',$query);
		foreach($pairs as $pair){
			$p = explode(':',$pair);
			$q->{$p[0]} = $p[1];			
		}
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($q));
	}
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

$action = @$_GET['action'] || 'event';
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
	case 'event':
		// cURL executed successfully
		$status = [];
		$json = getEventMessages( $service , @$_GET['query'] ?  @$_GET['query'] : false, $key, @$_GET['limit'] ? @$_GET['limit']  : '1' );
		if(!is_array($json)){
			// Error
		}else{
			$status = array_merge($status, $json);
		}
			header ( "Content-type: application/json" );
		function cmp($a, $b)
		{
			return intVal($a->_timestamp) > intval($b->_timestamp);
		}
		usort($status, "cmp");
		// $status = array_slice($status, -10);
		print json_encode($status);
		break;
	default:
		throw new Exception("Unknown or missing action: " . $action);
}

