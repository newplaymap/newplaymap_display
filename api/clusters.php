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


header('Access-Control-Allow-Origin: *.newplaymap.org | localhost | *.chachaville.com');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
header("Cache-Control: no-cache, must-revalidate"); 
header("Pragma: no-cache");
header("Content-type: application/json");

$json = '{"name": "clusters","type":"FeatureCollection","features":[ ' ;

$i = 0;



$collection = $m->newplaymap->events;
$cursor = $collection->find()->skip($page * $page_items)->limit($page_items)->sort(array("properties.event_date" => 1));

// iterate through the results
foreach ($cursor as $obj) {
  if(!empty($obj['id'])) {
    if($i > 0) {
     $json .= ',';
    }
    if(!empty($obj['properties']['event_date'])) {
      $start_date = date('M j, Y', $obj['properties']['event_date']->sec);
      $obj['properties']['event_date'] = $start_date;
    }
    if(!empty($obj['properties']['event_to_date'])) {
      $end_date = date('M j, Y', $obj['properties']['event_to_date']->sec);
      $obj['properties']['event_to_date'] = $end_date;
    }



    $obj['geometry']['coordinates'][0] =   (float)  $obj['geometry']['coordinates'][0];
    $obj['geometry']['coordinates'][1] =   (float)  $obj['geometry']['coordinates'][1];
    $obj['properties']['latitude'] =   (float)  $obj['properties']['latitude'];
    $obj['properties']['longitude'] =   (float)  $obj['properties']['longitude'];
    
    $json .= json_encode($obj);
  
    $i++;
  }
}



$collection = $m->newplaymap->organizations;
$cursor = $collection->find()->skip($page * $page_items)->limit($page_items)->sort(array("properties.name" => 1));

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

$collection = $m->newplaymap->artists;
$cursor = $collection->find()->skip($page * $page_items)->limit($page_items)->sort(array("name" => 1));

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

$json .= ']}';

echo $json;

?>