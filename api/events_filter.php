<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$limit = 150;
$collection = $m->$mongo_database->events;

// Grab arguments
$search_start = (!empty($_GET['start_date'])) ? new MongoDate(strtotime($_GET['start_date'])) : null;
$search_end = (!empty($_GET['end_date'])) ? new MongoDate(strtotime($_GET['end_date'])) : null;
$path = (!empty($_GET['path'])) ? $_GET['path'] : null;
$city_state = (!empty($_GET['city_state'])) ? $_GET['city_state'] : null;
$artist_name = (!empty($_GET['artist_name'])) ? $_GET['artist_name'] : null;
$artist_path = (!empty($_GET['artist_path'])) ? $_GET['artist_path'] : null;
$event_organization_path = (!empty($_GET['event_organization_path'])) ? $_GET['event_organization_path'] : null;

// Find Events by Type
if(!empty($_GET['event_type'])){
  $event_type = $_GET['event_type'];
  // find everything in the collection
  $query = array("properties.event_type" => $event_type);
  $cursor = $collection->find($query)->limit($limit)->sort(array("properties.event_date" => -1));

}

// Find Events by Date
else if ($search_start !== null) {

  // $event_start < $search_end && $event_end > $search_start
  // $search_end > $event_start && $search_start < $event_end
  $cursor = $collection->find(
    array(
      "properties.event_date" => array('$lte' => $search_end),
      "properties.event_to_date" => array('$gte' => $search_start), 
    )
  )->limit($limit)->sort(array("properties.event_date" => -1));

}

// Find Events by Organization
else if ($event_organization_path !== null) {
  $cursor = $collection->find(array("properties.related_theater_path" => $event_organization_path))->sort(array("properties.event_date" => -1));
}

// Find Events by Artist
else if($artist_path !== null) {
  $cursor = $collection->find(array("properties.generative_artist_path" => $artist_path))->sort(array("properties.event_date" => -1));
}

// Find Events by path
else if($path !== null) {
  $cursor = $collection->find(array("properties.path" => $path))->sort(array("properties.event_date" => -1));
}

// Find Events by City, State
else if ($city_state !== null) {
  $cursor = $collection->find(array("properties.city_state" => $city_state))->sort(array("properties.state" => 1));
}

// Find Events by Artists
else if ($artist_name !== null) {
  $cursor = $collection->find(array("properties.generative_artist" => $artist_name))->sort(array("properties.generative_artist" => 1));
}

// Find All Events (limited by max number)
else {
  $cursor = $collection->find()->limit($limit)->sort(array("properties.event_date" => -1));
}

$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '{"name": "events_filter","type":"FeatureCollection","features":[ ' ;

$i = 0;

// iterate through the results
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $start_date = date('M j, Y', $obj['properties']['event_date']->sec);
    $end_date = date('M j, Y', $obj['properties']['event_to_date']->sec);
    
    if ($start_date == $end_date) {
      $end_date = '';
    }
    
    $obj['properties']['event_date'] = $start_date;
    $obj['properties']['event_to_date'] = $end_date;
    
    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>