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
  $cursor = $plays->find()->limit(30);

  // iterate through the results
  foreach ($cursor as $playObj) {

      if(!empty($playObj['id'])) {

        $query = array('properties.related_play_id' => (string) $playObj['id']);
        $events_cursor = $m->newplaymap->events->find($query);

        foreach ($events_cursor as $eventObj) {
          // Combine arrays. Make sure this doesn't overwrite id or anything like that. It should be OK.
          $journey = array_merge($playObj["properties"], $eventObj["properties"]);
          $collection->update(array('id' => $playObj['id']), array('$set' => $journey), true);
        }

      }
    }
  return $output;
}





/*


function loadEvents($m, $output) {
  
  $events = $m->newplaymap->events;
  $events->drop();
  $events_path = '../data/push/events-all.json';
  
  $file_data = file_get_contents($events_path);
  $collection = $events;
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  // print "<pre>";
  foreach ($objects as $obj_load) {
    $node = (array) $obj_load->node;
  
    // Process date values
    $start_date = new MongoDate(strtotime($node["Date"]));
    $end_date = new MongoDate(strtotime($node["To Date"]));
  
    $newObj = array(
      "id" => $node["Event ID"],
      "type" => "Feature",
      "geometry" => array( 
        "type" => "Point",
        "coordinates"=> array($node["Longitude"], $node["Latitude"])
        ),
      "properties" => array(
        "longitude"  => $node["Longitude"],
        "latitude"  => $node["Latitude"],
        "event_id"  => $node["Event ID"],
        "event_type"  => $node["Event type"],
        "event_to_date"  => $end_date,
        "event_date"  => $start_date,
        "content_type"  => $node["Content Type"],
        "related_theater"  => $node["Related Theater"],
        "related_theater_id"  => $node["Related Theater ID"],
        "artist_id"  => $node["Artist ID"],
        "play_title"  => $node["Play title"],
        "related_play_id"  => $node["Related Play ID"],
        "generative_artist"  => $node["Generative Artist"],
        "event_description"  => $node["Event description"],
        "synopsis"  => $node["Synopsis"],
        "path" => str_replace("/newplay/newplaymap_private/www", "", $node["Path"])
    )
    );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Event ID"]), array('$set' => $newObj), true);
    // print_r($newObj);
    $count++;
  }
  // print '</pre>';
  $output .= "<p>Loaded " + $count + " Events</p>";
}


*/


/*


function loadPlays($m, $output) {
  
  $plays = $m->newplaymap->plays;
  $plays->drop();
  $plays_path = '../data/push/plays-all.json';
  
  $file_data = file_get_contents($plays_path);
  $collection = $plays;
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  foreach ($objects as $obj_load) {
  //print "<pre>";
  $node = (array) $obj_load->node;
  
  $newObj = array(
    "id" => $node["Event ID"],
    "type" => "Feature",
    "geometry" => array( 
      "type" => "Point",
      "coordinates"=> array($node["Longitude"], $node["Latitude"])
      ),
    "properties" => array(
      "longitude"  => $node["Longitude"],
      "latitude"  => $node["Latitude"],
      "event_id"  => $node["Event ID"],
      "event_type"  => $node["Event type"],
      "event_to_date"  => $node["To Date"],
      "event_date"  => $node["Date"],
      "content_type"  => $node["Content Type"],
      "related_theater"  => $node["Related Theater"],
      "related_theater_id"  => $node["Related Theater ID"],
      "artist_id"  => $node["Artist ID"],
      "play_title"  => $node["Play title"],
      "related_play_id"  => $node["Related Play ID"],
      "generative_artist"  => $node["Generative Artist"],
      "event_description"  => $node["Event description"],
      "synopsis"  => $node["Synopsis"],
      "path" => str_replace("/newplay/newplaymap_private/www", "", $node["Path"])
  )
  );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Event ID"]), array('$set' => $newObj), true);
    $count++;
  }
  $output .= "<p>Loaded " + $count + " Plays</p>";
}

*/



/*


$events = $m->newplaymap->events;
$plays = $m->newplaymap->plays;

$events_path = '../data/push/events-all.json';
*/


$cursor = $m->newplaymap->journeys->find()->limit(10);



// Print data
header('Access-Control-Allow-Origin: *.newplaymap.org | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");

$json = '{"records": [' ;

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

$json .= ']}';

echo $json;
/* echo $output; */
echo "done";
?>