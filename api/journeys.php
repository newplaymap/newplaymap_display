<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

if(!empty($_GET['page'])){
 $page = $_GET['page'];
}
else{
  $page = 0;
}
$page_items = 150;

$collection = $m->newplaymap->events;

// find everything in the collection
$cursor = $collection->find()->skip($page * $page_items)->limit($page_items)->sort(array("name" => 1));
$count = $cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;

$json = '{"name": "journeys", "items": [ ';


$i = 0;

// iterate through the results
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }


$json .= '{"name": "journey", "id": ' . $obj['id'] . ', "type":"FeatureCollection", "features":[ ' ;

    $json .= json_encode($obj);

    $json .= ']}';  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

// @TODO this is probably wrong.
$json .= '], "count" : ' . $count . '}';


  


echo $json;

?>