<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

if(!empty($_GET['id'])){
 $id = $_GET['id'];
}

$collection = $m->newplaymap->journeys;

// find everything in the collection
$cursor = $collection->find(array("id" => $id))->limit(1);
$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");


$json = "";
/* $json = '{"name": "journeys", "items": [ '; */


$i = 0;

// iterate through the results
foreach ($cursor as $obj) {

  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $json .= '{"name": "play", "id": ' . $obj['id'] . ', "type":"FeatureCollection", "features":[ ' ;

    $json .= json_encode($obj);

    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

// @TODO this is probably wrong.
$json .= '], "count" : ' . $count . '}';


  


echo $json;

?>