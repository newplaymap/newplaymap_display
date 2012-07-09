<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

if(!empty($_GET['page'])){
 $page = $_GET['page'];
}
else{
  $page = 0;
}

if(!empty($_GET['page_items'])){
 $page_items = $_GET['page_items'];
}
else{
  $page_items = 150;
}


$collection = $m->newplaymap->artists;

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
$json = '{"name": "artists","type":"FeatureCollection","features":[ ' ;

$i = 0;

// iterate through the results
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $obj['geometry']['coordinates'][0] =   (float)  $obj['geometry']['coordinates'][0];
    $obj['geometry']['coordinates'][1] =   (float)  $obj['geometry']['coordinates'][1];
    $obj['properties']['latitude'] =   (float)  $obj['properties']['latitude'];
    $obj['properties']['longitude'] =   (float)  $obj['properties']['longitude'];

    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>