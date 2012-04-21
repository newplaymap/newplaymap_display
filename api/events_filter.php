<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$limit = 150;
$collection = $m->newplaymap->events;

if(!empty($_GET['event_type'])){
  $event_type = $_GET['event_type'];
  // find everything in the collection
  $query = array("properties.event_type" => $event_type);
  $cursor = $collection->find($query)->limit($limit)->sort(array("properties.event_date" => 1));

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

    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>