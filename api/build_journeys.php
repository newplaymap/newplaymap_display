<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(true);


$output = "";
$output = buildJourneys($m, $output);

function buildJourneys($m, $output) {
  $m->newplaymap->journeys->drop();
  $collection = $m->newplaymap->journeys;

  $plays = $m->newplaymap->plays;

  // find everything in the collection
  $cursor = $plays->find();

  // iterate through the results
  foreach ($cursor as $playObj) {

      if(!empty($playObj['id'])) {

        $query = array('properties.related_play_id' => (string) $playObj['id']);
        $events_cursor = $m->newplaymap->events->find($query)->sort(array("properties.event_date.sec" => -1));

        $events = array();

        foreach ($events_cursor as $eventObj) {
          $event = array();
          // Combine arrays. Make sure this doesn't overwrite id or anything like that. It should be OK.
          $geometry = $eventObj["geometry"];
          $properties = array_merge($playObj["properties"], $eventObj["properties"]);
          $properties["type"] = "journey";
          // $event = array("geometry" => $geometry, "properties" => $properties, "id" => $playObj['id']);


          $collection->update(array('id' => $playObj['id']), array('$push' => array(
            "properties" => $properties, 
            "geometry" =>  $geometry
                     
            )), true);

/*           array_push($events, $event); */
        }        
       //   $collection->update(array('id' => $playObj['id']), array('$set' => $events), true);


      }
    }
  return $output;
}

$cursor = $m->newplaymap->journeys->find()->limit(10);



// Print data
/*
header('Access-Control-Allow-Origin: *.newplaymap.org | *.chachaville.com | localhost');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
*/

$json = '{"records": [' ;

$i = 0;

// iterate through the results

foreach ($cursor as $obj) {
/*
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }
*/

    $json .= json_encode($obj);
  
/*
    $i++;
  }
*/
}

$json .= ']}';

echo $json;
/* echo $output; */
echo "done";
?>