<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$collection = $m->$mongo_database->artists;

// find everything in the collection
$cursor = $collection->find()->sort(array("properties.path" => 1));
$count = $cursor->count();

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
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if (!empty($obj['properties']['artist_name'])) {
      if($i > 0) {
       $json .= ',';
      }
      $json .= json_encode(array(
        'value' => $obj['properties']['artist_name'],
        'label' => $obj['properties']['artist_name_display'],
        'path' => $obj['properties']['path'],
      ));

      $i++;
    }
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= ']';

echo $json;

?>