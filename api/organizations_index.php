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

$collection = $m->newplaymap->organizations;

// find everything in the collection
$cursor = $collection->find()->sort(array("properties.name" => 1));
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
    if($i > 0) {
     $json .= ',';
    }

    $json .= json_encode($obj['properties']['name']);
    
    // $json .= json_encode(array(
    //   'id' => $obj['id'],
    //   'name' => $obj['properties']['name'],
    // ));
    
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= ']';

echo $json;

?>