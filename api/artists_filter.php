<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$collection = $m->$mongo_database->artists;

$artist_name = (!empty($_GET['artist_name'])) ? $_GET['artist_name'] : null;
$ensemble_collective = (!empty($_GET['ensemble_collective'])) ? $_GET['ensemble_collective'] : null;
$path = (!empty($_GET['path'])) ? $_GET['path'] : null;
$city_state = (!empty($_GET['city_state'])) ? $_GET['city_state'] : null;

if($path !== null) {
  $cursor = $collection->find(array("properties.path" => $path))->sort(array("properties.artist_name" => 1));
}

else if($artist_name !== null) {
  $cursor = $collection->find(array("properties.artist_name" => $artist_name))->sort(array("properties.artist_name" => 1));
}

else if($ensemble_collective === "Ensemble / Collective") {
  $cursor = $collection->find(array("properties.ensemble_collective" => $ensemble_collective))->sort(array("properties.artist_name" => 1));
}

else if($city_state !== null) {
  $cursor = $collection->find(array("properties.city_state" => $city_state))->sort(array("properties.state" => 1));
}

else {
  return;
}


// find everything in the collection

$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '{"name": "artists_filter","type":"FeatureCollection","features":[ ' ;

$i = 0;

// iterate through the results
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