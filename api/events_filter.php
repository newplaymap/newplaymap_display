<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$limit = 150;
$collection = $m->newplaymap->events;

$search_start = (!empty($_GET['start_date'])) ? new MongoDate(strtotime($_GET['start_date'])) : null;
$search_end = (!empty($_GET['end_date'])) ? new MongoDate(strtotime($_GET['end_date'])) : null;


if(!empty($_GET['event_type'])){
  $event_type = $_GET['event_type'];
  // find everything in the collection
  $query = array("properties.event_type" => $event_type);
  $cursor = $collection->find($query)->limit($limit)->sort(array("properties.event_date" => 1));

}
else if ($search_start !== null) {



// Testing
// $search_start = new MongoDate(strtotime('April 1, 2005'));
// $search_end = new MongoDate(strtotime('May 1, 2005'));


// $event_start < $search_end && $event_end > $search_start
// $search_end > $event_start && $search_start < $event_end
$cursor = $collection->find(
  array(
    "properties.event_date" => array('$lte' => $search_end),
    "properties.event_to_date" => array('$gte' => $search_start), 
  )
)->sort(array("properties.event_date" => 1));

}
else {
  $cursor = $collection->find()->limit($limit)->sort(array("properties.event_date" => 1));
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