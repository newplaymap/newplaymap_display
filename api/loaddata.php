<?php
include('../../../authentication/newplaymap_authentication.php');
connectMongo(true);

// print "I think you're looking for the npm_datasource module.";

loadOrganizations($m);
loadArtists($m);
loadEvents($m);
loadPlays($m);

function getJsonExport($path) {
  $server = $_SERVER['HTTP_HOST'];
  $drupal_base_path = str_replace('api/loaddata.php', 'participate/', $_SERVER['REQUEST_URI']);
  
  // create a new cURL resource
  $ch = curl_init();

  $host = 'http://' . $server;
  $base_path = $drupal_base_path;
  
  $absolute_path = $host . $base_path . $path;
  
  // set URL and other appropriate options
  curl_setopt($ch, CURLOPT_URL, $absolute_path);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  // grab URL and pass it to the browser
  $json = curl_exec($ch);

  // close cURL resource, and free up system resources
  curl_close($ch);
  
  return $json;
}

function loadOrganizations($m) {

  $organizations = $m->newplaymap->organizations;
  // find everything in the collection
  $organizations->drop();
  // $organization_path = '../data/push/orgs-all.json';

  $organization_path = 'data/orgs-all';
  $file_data = getJsonExport($organization_path);

  // $file_data = file_get_contents($organization_path);
  
  $collection = $organizations;
  /* var_dump($file_data); */
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  // print "<pre>";
  foreach ($objects as $obj_load) {
    $node = (array) $obj_load->node;
    // print_r($node);
  
    // Set up proper keys for Org type
    $org_list = array();
    if (is_object($node["Organization type"])) {
      foreach ($node["Organization type"] as $type) {
        $org_list[] = array('type' => $type);
      }
    } else {
      $org_list[] = array('type' => $node["Organization type"]);
    }
    
    // Set up proper array for Special Interests
    if (!empty($node['Special interests'])) {
     $special_interests = explode(', ', $node['Special interests']); 
    } else {
     $special_interests = ''; 
    }
    
    $special_interests_list = array();
    if (is_array($special_interests)) {
      foreach ($special_interests as $interest) {
        $special_interests_list[] = array('interest' => $interest);
      }
    } else {
      $special_interests_list = '';
    }
    
    // Set up proper array for National Networks
    if (!empty($node['National networks'])) {
     $national_networks = explode(', ', $node['National networks']); 
    } else {
     $national_networks = ''; 
    }
    
    $national_networks_list = array();
    if (is_array($national_networks)) {
      foreach ($national_networks as $interest) {
        $national_networks_list[] = array('network' => $interest);
      }
    } else {
      $national_networks_list = '';
    }
    
    $city_state = (!empty($node["City"]) && !empty($node["State"])) ? $node["City"] . ', ' . $node["State"] : '';

    $newObj = array(
      "id" => $node["Org ID"],
      "type" => "Feature",
      "geometry" => array( 
        "type" => "Point",
        "coordinates"=> array($node["Longitude"], $node["Latitude"])
        ),
      "properties" => array(
          "logo" => $node["Logo"],
          "path" =>  str_replace("/newplay/newplaymap_private/www", "", $node["Path"]),
          "organization_id" => $node["Org ID"],
          "name" => $node["Org name"],
          "latitude" => $node["Latitude"],
          "longitude" => $node["Longitude"],
          "mission_statement" => $node["Mission statement"],
          "ensemble_collective" => $node["Ensemble collective"],
  /*         "founding_date" => $node["Founding date"] == $node["Founding date"] ? "", */
          // "organization_type" => implode(',', get_object_vars($node["Organization type"])),
          "organization_type" => $org_list,
          "special_interests" => $special_interests_list,
          "national_networks" => $national_networks_list,
          "city" => $node["City"],
          "state" => $node["State"],
          "city_state" => $city_state,
 
      )
    );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Org ID"]), array('$set' => $newObj), true);
    $count++;
    // print_r($newObj);
  }
  // print  "</pre>";
  return true;
}






function loadArtists($m) {
  
  $artists = $m->newplaymap->artists;

  // find everything in the collection
  $cursor =  $artists->find();
  $artists->drop();
  $artists_path = 'data/artists-all';

  $file_data = getJsonExport($artists_path);
  $collection = $artists;
  /* var_dump($file_data); */
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();

  foreach ($objects as $obj_load) {
    $node = (array) $obj_load->node;
    
    $city_state = (!empty($node["City"]) && !empty($node["State"])) ? $node["City"] . ', ' . $node["State"] : '';

    $newObj = array(
      "id" => $node["Artist ID"],
      "type" => "Feature",
      "geometry" => array( 
        "type" => "Point",
        "coordinates"=> array($node["Longitude"], $node["Latitude"])
        ),
      "properties" => array(
          "latitude" => $node["Latitude"],
          "longitude" => $node["Longitude"],
          "artist_photo" => $node["Photo"],
          "path" => str_replace("/newplay/newplaymap_private/www", "", $node["Path"]),
          "artist_id" => $node["Artist ID"],
          "content_type" => $node["Content Type"],
          "generative_artist" => $node["Generative artist"],
          "artist_name" => $node["Generative artist"],
          "mission_statement" => $node["Mission statement"],
          "ensemble_collective" => $node["ensemble_collective"],
          "city" => $node["City"],
          "state" => $node["State"],
          "city_state" => $city_state,
      )
    );

    // This will completely replace the record.
    $collection->update(array('id' => $node["Artist ID"]), array('$set' => $newObj), true);
    $count++;
  }

}






function loadEvents($m) {
  
  $events = $m->newplaymap->events;
  $events->drop();
  $events_path = 'data/events-all';

  $file_data = getJsonExport($events_path);
  $collection = $events;
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  // print "<pre>";
  foreach ($objects as $obj_load) {
    $node = (array) $obj_load->node;
  
    // Process date values
    $start_date = new MongoDate(strtotime($node["Date"]));
    $end_date = new MongoDate(strtotime($node["To Date"]));
    
    $city_state = (!empty($node["City"]) && !empty($node["State"])) ? $node["City"] . ', ' . $node["State"] : '';
  
    // @TODO: See if the string replace on path can be removed
    $newObj = array(
      "id" => $node["Event ID"],
      "type" => "Feature",
      "geometry" => array( 
        "type" => "Point",
        "coordinates"=> array($node["Longitude"], $node["Latitude"])
        ),
      "properties" => array(
        "longitude"  => $node["Longitude"],
        "latitude"  => $node["Latitude"],
        "event_id"  => $node["Event ID"],
        "event_type"  => $node["Event type"],
        "event_to_date"  => $end_date,
        "event_date"  => $start_date,
        "content_type"  => $node["Content Type"],
        "related_theater"  => $node["Related Theater"],
        "related_theater_id"  => $node["Related Theater ID"],
        "artist_id"  => $node["Artist ID"],
        "play_title"  => $node["Play title"],
        "related_play_id"  => $node["Related Play ID"],
        "generative_artist"  => $node["Generative Artist"],
        "event_description"  => $node["Event description"],
        "synopsis"  => $node["Synopsis"],
        "path" => str_replace("/newplay/newplaymap_private/www", "", $node["Path"]),
        "city" => $node["City"],
        "state" => $node["State"],
        "city_state" => $city_state,
    )
    );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Event ID"]), array('$set' => $newObj), true);
    // print_r($newObj);
    $count++;
  }
  // print '</pre>';
}



function loadPlays($m) {
  
  $plays = $m->newplaymap->plays;
  $plays->drop();
  // $plays_path = '../data/push/plays-all.json';
  $plays_path = 'data/plays-all';
  
  $file_data = getJsonExport($plays_path);
  
  $collection = $plays;
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  // print '<pre>';
  foreach ($objects as $obj_load) {
  // print "<pre>";
  $node = (array) $obj_load->node;
  
  // Set up proper array for Alternate play titles
  $alternate_titles_list = array();

  if (is_object($node["Alternate titles"])) {
    foreach ($node["Alternate titles"] as $alt_title) {
      $alternate_titles_list[] = array('title' => $alt_title);
    }
  } else {
    $alternate_titles_list[] = array('title' => $node["Alternate titles"]);
  }
  
  // print_r($node);
  $newObj = array(
    "id" => $node["Play ID"],
    "type" => "Feature",
    "properties" => array(
      "play_id"  => $node["Play ID"],
      "content_type"  => $node["Content Type"],
      "artist_id"  => $node["Artist ID"],
      "play_title"  => $node["Play title"],
      "alternate_titles"  => $alternate_titles_list,
      "generative_artist"  => $node["Generative Artist"],
      "synopsis"  => $node["Synopsis"],
      "path" => str_replace("/newplay/newplaymap_private/www", "", $node["Path"])
    )
  );
    // This will completely replace the record.
    // print_r($newObj);
    $collection->update(array('id' => $node["Play ID"]), array('$set' => $newObj), true);
    $count++;
  }
    // print '</pre>';
}




/*


$events = $m->newplaymap->events;
$plays = $m->newplaymap->plays;

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
// echo "done";
?>