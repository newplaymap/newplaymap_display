<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(false);

$organizations_collection = $m->newplaymap->organizations;
$artists_collection = $m->newplaymap->artists;

$ensemble = ($_GET['ensemble_collective'] == 'Ensemble / Collective') ? 'Ensemble / Collective' : null;

if ($ensemble == null) {
  return;
}

// Find all ensembles within organizations
$organizations_cursor = $organizations_collection->find(array("properties.ensemble_collective" => $ensemble))->sort(array("properties.name" => 1));

$artists_cursor = $artists_collection->find(array("properties.ensemble_collective" => $ensemble))->sort(array("properties.artist_name" => 1));

$organizations_count = $organizations_cursor->count();
$artsits_count = $artists_cursor->count();

header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");
 $page;
$json = '{"name": "ensemble_collective_filter","type":"FeatureCollection","features":[ ' ;

$i = 0;

// iterate through the results
foreach ($organizations_cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $json .= json_encode($obj);
  
    $i++;
  }
}

foreach ($artists_cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }

    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . ($organizations_count + $artists_count) . '}';

echo $json;

?>