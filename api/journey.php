<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$plays = $m->$mongo_database->plays;
$events = $m->$mongo_database->events;

if(!empty($_GET['id'])){
  $id = $_GET['id'];
  $play_cursor = $plays->findOne(array('id' => $id));
}

if(!empty($_GET['play_title']) && $_GET['play_title'] !== "undefined" ){
  $play_title = $_GET['play_title'];
  $play_cursor = $plays->findOne(array('properties.play_title' => $play_title));
}

if(!empty($_GET['path'])) {
  $path = $_GET['path'];
  $event_cursor = $events->findOne(array('properties.related_play_path' => $path));
  $play_cursor = $plays->findOne(array('id' => $event_cursor["properties"]["related_play_id"]));
}

if(!empty($play_cursor['id'])) {
  $query = array('properties.related_play_id' => (string) $play_cursor['id']);
  $events_cursor = $m->$mongo_database->events->find($query)->sort(array("properties.event_date" => -1));
}


header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");

$json = "";
$json .= '{"name": "play", "id": ' . $play_cursor['id'] . ', "type":"FeatureCollection", "features":[ ' ;

$i = 0;

// iterate through the results
foreach ($events_cursor as $obj) {

  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }
    // Add play metadata to event.
    $obj["properties"] = array_merge($play_cursor["properties"], $obj["properties"]);
    $start_date = date('M j, Y', $obj['properties']['event_date']->sec);
    $end_date = date('M j, Y', $obj['properties']['event_to_date']->sec);
    
    $obj['properties']['event_date'] = $start_date;
    $obj['properties']['event_to_date'] = $end_date;
    $obj["type"] = "Feature";

    $json .= json_encode($obj);

    $i++;
  }
}

$json .= ']}';

echo $json;

?>