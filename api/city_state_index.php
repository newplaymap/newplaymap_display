<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$type = (!empty($_GET['type'])) ? $_GET['type'] : null;
$city_state = (!empty($_GET['city_state'])) ? $_GET['city_state'] : null;

// Default to artists
$collection = $m->newplaymap->artists;

switch ($type) {
  case 'artists':
    $collection = $m->newplaymap->artists;
  break;
  
  case 'organizations':
    $collection = $m->newplaymap->organizations;
  break;
  
  case 'events':
    $collection = $m->newplaymap->events;
  break;
}

if($type !== null) {
  // Find all
  $cursor = get_city_states($collection);
}
else {
  // Return an object with all three
  $all_collections  = array('artists', 'organizations', 'events');
  $all_cursors = array();
  foreach($all_collections as $collection_name) {
    $all_cursors[$collection_name] = get_city_states($m->newplaymap->$collection_name);
  }
}

function get_city_states($collection) {
  $cursor = $collection->find(array('properties.city' => array('$ne' => ''), 'properties.state' => array('$ne' => '')))->sort(array("properties.state" => 1));
  return $cursor;
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
$json = '{ ' ;

$cursor_index = 0;
// iterate through the results
foreach ($all_cursors as $cursor) {
  $all_keys = array_keys($all_cursors);
  $json .= $all_keys[$cursor_index] . ': [';
  $city_state_list = array();
  $i = 0;
  foreach ($cursor as $obj) {
    if (!in_array($obj['properties']['city_state'], $city_state_list) && $obj['properties']['city_state'] != null) {
      if($i > 0) {
       $json .= ',';
      }
      $json .= json_encode($obj['properties']['city_state']);
      $i++;

      $city_state_list[] = $obj['properties']['city_state'];
    }
  }
  
  $json .= ']';
  if($cursor_index < count($all_cursors) - 1) {
   $json .= ', ';
  }
  
  $cursor_index++;
}

$json .= '}';

echo $json;

?>