<?php
$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
$service = null;
switch($_GET['action']){
	case 'status':
		$service = "https://api.pp.mksmart.org/sciroc-competition/" . $_GET['team'] . "/sciroc-robot-status";
		break;
	default:
		throw new Exception("Unknown or missing action: " . $_GET['action']);
}
$key = $config['key'];

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
    echo 'cURL error: ' . curl_error($curl); 
} 
else 
{ 
    // cURL executed successfully
	header("Content-type: application/json");
    echo $html; 
}

// close cURL resource to free up system resources
curl_close($curl);
