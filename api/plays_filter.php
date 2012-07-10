<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$play_title = (!empty($_GET['play_title'])) ? $_GET['play_title'] : null;
$path = (!empty($_GET['path'])) ? $_GET['path'] : null;

$collection = $m->newplaymap->plays;

if ($play_title !== null) {
  $cursor = $collection->find(array("properties.play_title" => $play_title))->sort(array("properties.play_title" => 1));
}
else if($path !== null) {
  $cursor = $collection->find(array("properties.path" => $path))->sort(array("properties.play_title" => 1));
}
else {
  return;
}


$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '{"name": "plays_filter","type":"FeatureCollection","features":[  ' ;

$i = 0;

// iterate through the results
$unique_plays = array();
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $json .= json_encode($obj);
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>