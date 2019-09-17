<?php
$dataDir = dirname(__FILE__) . '/data';
$a = "";
$s= "";
$i= "";
$config = parse_ini_file (dirname(__FILE__) . '/config.ini');
$usr = $config['usr'];
$pwd = $config['pwd'];

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if(!isset($_SERVER['PHP_AUTH_USER'])){
	header('WWW-Authenticate: Basic realm="My Realm"');
	header('HTTP/1.0 401 Unauthorized');
	echo 'Not authorized';
	exit;
}
switch(@$_GET['a']){
	case 'get':
	break;
	case 'set':
	case 'del':
	case 'load':
	default:
		if( ! (@$_SERVER['PHP_AUTH_USER'] == $usr && @$_SERVER['PHP_AUTH_PW'] == $pwd )){
			http_response_code(403);
			print 'Forbidden';
			die();
		}
}
if( @$_GET['a'] == 'set' && @$_GET['i'] && @$_GET['s']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	file_put_contents($file, $_GET['s']);

} else if(@$_GET['a'] == 'get' && @$_GET['i']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	print file_get_contents($file);
	die();
} else if(@$_SERVER['PHP_AUTH_USER'] == 'dh' && @$_GET['a'] == 'del' && @$_GET['i'] ){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	unlink($file);	
} else if(@$_GET['a'] == 'load' && @$_GET['i']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	$a = $_GET['a'];
	$s = file_get_contents($file);
	$i = $_GET['i'];
} else if( @$_GET['a'] || @$_GET['i'] || @$_GET['s'] ){
	http_response_code(400);
	print 'Bad request';
}
?><html>
<head>
</head>
<body style="padding: 1em;">
	<h2>Screen Manager</h2>	
	<form action="#" method="GET">
		<div class="form-group">
		<label for="i">Screen</label>
		<input class="form-control" type="text" name="i" value="<?php print $i; ?>" placeholder="i"/ >
		</div>
		<div class="form-group">
		<label for="s">Sequence</label>
		<textarea class="form-control" name="s" placeholder="s" ><?php print $s; ?></textarea>		
		</div>
		<div class="form-group">
		<input class="btn btn-primary" type="submit" value="load" name="a">
		<input class="btn btn-primary" type="submit" value="get" name="a">
		<input class="btn btn-danger" type="submit" value="set" name="a">
		<input class="btn btn-danger" type="submit" value="del" name="a">
		</div>
	</form>
	<h2>List</h2>
	<ul>
	<?php
	if ($handle = opendir($dataDir)) {
	    while (false !== ($file = readdir($handle)))
	    {
	        if ($file != "." && $file != ".." && strtolower(substr($file, strrpos($file, '.') + 1)) == 'sequence')
	        {
				$f = substr($file, 0, strrpos($file, '.'));
	            $thelist .= '<li><a href="?i=' . $f . '&a=load">'.$file.'</a></li>';
	        }
	    }
	    closedir($handle);
	}		
		
	print $thelist;?>
</ul>
<link rel="stylesheet" href="styles/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
<script src="scripts/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

</body>
</html>