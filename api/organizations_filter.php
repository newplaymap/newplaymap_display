<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$collection = $m->newplaymap->organizations;

$organization_name = (!empty($_GET['organization_name'])) ? $_GET['organization_name'] : null;
$organization_type = (!empty($_GET['organization_type'])) ? $_GET['organization_type'] : null;
$national_networks = (!empty($_GET['national_networks'])) ? $_GET['national_networks'] : null;
$special_interests = (!empty($_GET['special_interests'])) ? $_GET['special_interests'] : null;
$path = (!empty($_GET['path'])) ? $_GET['path'] : null;

if($organization_name !== null) {
  $cursor = $collection->find(array("properties.name" => $organization_name))->sort(array("properties.name" => 1));
}
else if($path !== null) {
  $cursor = $collection->find(array("properties.path" => $path))->sort(array("properties.name" => 1));
}
else if($organization_type !== null) {
  $cursor = $collection->find(array("properties.organization_type.type" => $organization_type))->sort(array("properties.name" => 1));
}
else if($national_networks !== null) {
  $cursor = $collection->find(array("properties.national_networks.network" => $national_networks))->sort(array("properties.name" => 1));

}
else if($special_interests !== null) {
  $cursor = $collection->find(array("properties.special_interests.interest" => $special_interests))->sort(array("properties.name" => 1));
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
    
    $obj['properties']['organization_type_display'] = '';
    $i = 0;
    $l = count($obj['properties']['organization_type']);
    foreach ($obj['properties']['organization_type'] as $type) {
      $obj['properties']['organization_type_display'] .= $type['type'];
      
      if ($i < $l - 1) {
        $obj['properties']['organization_type_display'] .= ', ';
      }
      
      $i++;
    }

    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>