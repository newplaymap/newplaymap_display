<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(true);
loadOrganizations($m);

function loadOrganizations($m) {
  
  $organizations = $m->newplaymap->organizations;
  // find everything in the collection
  $cursor = $organizations->find();
  $organization_path = '../data/push/orgs-all.json';
  
  $file_data = file_get_contents($organization_path);
  $collection = $organizations;
  /* var_dump($file_data); */
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  foreach ($objects as $obj_load) {
  //print "<pre>";
  $node = (array) $obj_load->node;
  
  $newObj = array(
    "id" => $node["Org ID"],
    "type" => "Feature",
    "geometry" => array( 
      "type" => "Point",
      "coordinates"=> array($node["Longitude"], $node["Latitude"])
      ),
    "properties" => array(
        "logo" => $node["Logo"],
        "path" => $node["Path"],
        "organization_id" => $node["Org ID"],
        "name" => $node["Org name"],
        "latitude" => $node["Latitude"],
        "longitude" => $node["Longitude"],
        "mission_statement" => $node["Mission statement"],
        "ensemble_collective" => $node["Ensemble collective"],
/*         "founding_date" => $node["Founding date"] == $node["Founding date"] ? "", */
        "organization_type" => $node["Organization type"] /*
 ,
        "organization_type_2" => $node["Organization type - 2"],
        "organization_type_1" => $node["Organization type - 1"],
        "organization_type_3" => $node["Organization type - 3"],
        "organization_type_4" => $node["Organization type - 4"],
        "organization_type_5" => $node["Organization type - 5"]
*/
 
  )
  );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Org ID"]), array('$set' => $newObj), true);
    $count++;
  }

}

/*

$artists = $m->newplaymap->artists;
$events = $m->newplaymap->events;
$plays = $m->newplaymap->plays;


$artists_path = '../data/push/artists-all.json';
$events_path = '../data/push/events-all.json';
*/
/*

$cursor = $m->newplaymap->organizations->find()->limit(10);

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
*/

/* echo $json; */
echo "done";
?>