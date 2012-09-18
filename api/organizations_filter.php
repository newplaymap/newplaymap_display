<?php
include('../../authentication/newplaymap_authentication.php');
connectMongo(false);

$limit = 150;
$collection = $m->$mongo_database->organizations;

$organization_name = (!empty($_GET['organization_name'])) ? $_GET['organization_name'] : null;
$organization_type = (!empty($_GET['organization_type'])) ? $_GET['organization_type'] : null;
$national_networks = (!empty($_GET['national_networks'])) ? $_GET['national_networks'] : null;
$special_interests = (!empty($_GET['special_interests'])) ? $_GET['special_interests'] : null;
$path = (!empty($_GET['path'])) ? $_GET['path'] : null;
$city_state = (!empty($_GET['city_state'])) ? $_GET['city_state'] : null;

if($organization_name !== null) {
  $cursor = $collection->find(array("properties.name" => $organization_name))->limit($limit)->sort(array("properties.name" => 1));
}

else if($path !== null) {
  $cursor = $collection->find(array("properties.path" => $path))->limit($limit)->sort(array("properties.name" => 1));
}

else if($organization_type !== null) {
  $cursor = $collection->find(array("properties.organization_type.type" => $organization_type))->limit($limit)->sort(array("properties.name" => 1));
}

else if($national_networks !== null) {
  $cursor = $collection->find(array("properties.national_networks.network" => $national_networks))->limit($limit)->sort(array("properties.name" => 1));

}

else if($special_interests !== null) {
  $cursor = $collection->find(array("properties.special_interests.interest" => $special_interests))->limit($limit)->sort(array("properties.name" => 1));
}

else if($city_state !== null) {
  $cursor = $collection->find(array("properties.city_state" => $city_state))->limit($limit)->sort(array("properties.state" => 1));
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
    
    /* Set up display version of Organization Type */
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
    
    /* Set up display version of Special Interests */
    $obj['properties']['special_interests_display'] = '';
    $i = 0;
    $l = count($obj['properties']['special_interests']);
    foreach ($obj['properties']['special_interests'] as $type) {
      $obj['properties']['special_interests_display'] .= $type['interest'];
      
      if ($i < $l - 1) {
        $obj['properties']['special_interests_display'] .= ', ';
      }
      
      $i++;
    }
    
    /* Set up display version of National Networks */
    $obj['properties']['national_networks_display'] = '';
    $i = 0;
    $l = count($obj['properties']['national_networks']);
    foreach ($obj['properties']['national_networks'] as $type) {
      $obj['properties']['national_networks_display'] .= $type['network'];
      
      if ($i < $l - 1) {
        $obj['properties']['national_networks_display'] .= ', ';
      }
      
      $i++;
    }
    
    $obj['properties']['content_type'] = 'Organization';

    $json .= json_encode($obj);
  
    $i++;
  }
}
/* $json .= "," . json_encode(array('count' => $collection->count())); */

$json .= '], "count" : ' . $count . '}';

echo $json;

?>