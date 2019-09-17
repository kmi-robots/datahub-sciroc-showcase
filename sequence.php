<?php
$dataDir = dirname(__FILE__) . '/data';
$a = "";
$s= "";
$i= "";
	
if(@$_GET['a'] == 'set' && @$_GET['i'] && @$_GET['s']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	file_put_contents($file, $_GET['s']);

} else if(@$_GET['a'] == 'get' && @$_GET['i']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	print file_get_contents($file);
	die();
} else if(@$_GET['a'] == 'del' && @$_GET['i'] ){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	unlink($file);	
} else if(@$_GET['a'] == 'load' && @$_GET['i']){
	$file = $dataDir . '/' . $_GET['i'] . '.sequence';
	$a = $_GET['a'];
	$s = file_get_contents($file);
	$i = $_GET['i'];
}
?><html>
<head>
</head>
<body style="padding: 1em;">
	<h2>Manage</h2>	
	<form action="#" method="GET">
	<p>		<input type="text" name="i" value="<?php print $i; ?>" placeholder="i"/ >
	<p>		<textarea name="s" placeholder="s" ><?php print $s; ?></textarea>		
	<p>		<input type="submit" value="get" name="a">
		<input type="submit" value="set" name="a">
		<input type="submit" value="del" name="a">
		<input type="submit" value="load" name="a">
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
</body>
</html>