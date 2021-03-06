<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$collection = $m->$mongo_database->events;

// find everything in the collection
$cursor = $collection->find()->sort(array("properties.path" => 1));
$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");

$json = '[ ' ;

$i = 0;

// iterate through the results
$unique_plays = array();
foreach ($cursor as $obj) {
  if(!empty($obj['id']) && !empty($obj['properties']['play_title'])) {
    if (!in_array($obj['properties']['play_title'], $unique_plays)) {
      if($i > 0) {
       $json .= ',';
      }
      $unique_plays[] = $obj['properties']['play_title'];

      $json .= json_encode(array(
        'value' => $obj['properties']['play_title_display'],
        'label' => $obj['properties']['play_title_display'],
        'path' => $obj['properties']['related_play_path'],
      ));

      $i++;
    }

  }
}

/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= ']';

echo $json;

?>