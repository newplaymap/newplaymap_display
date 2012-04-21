<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

if(!empty($_GET['id'])){
 $id = $_GET['id'];
}

  $plays = $m->newplaymap->plays;

  // find everything in the collection
  $play_cursor = $plays->findOne(array('id' => $id));

      if(!empty($play_cursor['id'])) {

        $query = array('properties.related_play_id' => (string) $play_cursor['id']);
        $events_cursor = $m->newplaymap->events->find($query)->sort(array("properties.event_date.sec" => -1));

    }

/* $collection = $m->newplaymap->journeys; */

// find everything in the collection
/* $cursor = $collection->find(array("id" => $id))->limit(1); */
$count = $events_cursor->count();

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


/* $json .= '{"name": "play"; */
    $json .= json_encode($obj);

    $i++;
  }
}

    $json .= '], "count" : ' . $count . '}';

/* $json .= "," . json_encode(array('count' => $collection->count())); */

// @TODO this is probably wrong.



  


echo $json;

?>