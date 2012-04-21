<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$collection = $m->newplaymap->organizations;

$organization_name = (!empty($_GET['organization_name'])) ? $_GET['organization_name'] : null;
$organization_type = (!empty($_GET['organization_type'])) ? $_GET['organization_type'] : null;
$national_networks = (!empty($_GET['national_networks'])) ? $_GET['national_networks'] : null;


if($organization_name !== null) {
  // find everything in the collection
  $cursor = $collection->find(array("properties.name" => $organization_name))->sort(array("properties.name" => 1));

}
else if($organization_type !== null) {
  // find everything in the collection
  $cursor = $collection->find(array("properties.organization_type.type" => $organization_type))->sort(array("properties.name" => 1));

}
else if($national_networks !== null) {
  $national_networks = (!empty($_GET['national_networks'])) ? $_GET['national_networks'] : null;

  // find everything in the collection
  $cursor = $collection->find(array("properties.national_networks.network" => $national_networks))->sort(array("properties.name" => 1));

}
else {
  return;
}

  $count = $cursor->count();
header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '{"name": "organizations_filter","type":"FeatureCollection","features":[ ' ;

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