<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$type = (!empty($_GET['type'])) ? $_GET['type'] : null;
$city_state = (!empty($_GET['city_state'])) ? $_GET['city_state'] : null;

// Default to artists
$collection = $m->$mongo_database->artists;

switch ($type) {
  case 'artists':
    $collection = $m->$mongo_database->artists;
  break;
  
  case 'organizations':
    $collection = $m->$mongo_database->organizations;
  break;
  
  case 'events':
    $collection = $m->$mongo_database->events;
  break;
}

if($type !== null) {
  // Find all
  $cursor = $collection->find(array('properties.city' => array('$ne' => ''), 'properties.state' => array('$ne' => '')))->sort(array("properties.state" => 1));
}
else {
  return;
}


// find everything in the collection
// $cursor = $collection->find()->sort(array("properties.generative_artists" => 1));
// $count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '[ ' ;

$i = 0;

// iterate through the results
$city_state_list = array();
foreach ($cursor as $obj) {
  if (!in_array($obj['properties']['city_state'], $city_state_list) && $obj['properties']['city_state'] != null) {
    if($i > 0) {
     $json .= ',';
    }
    $json .= json_encode($obj['properties']['city_state']);
    $i++;
    
    $city_state_list[] = $obj['properties']['city_state'];
  }
  
  
  // $json .= json_encode(array(
  //   'id' => $obj['id'],
  //   'name' => $obj['properties']['name'],
  // ));
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= ']';

echo $json;

?>