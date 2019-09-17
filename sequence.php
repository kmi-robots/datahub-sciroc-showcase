<?php
$dataDir = dirname(__FILE__) . '/data';

if(@$_GET['a'] == 'set' && @$_GET['i'] && @$_GET['s']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	file_put_contents($file, $_GET['s']);
}else if(@$_GET['a'] == 'get' && @$_GET['i']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	print file_get_contents($file);
}else{
	throw new Exception('Bad request');
}