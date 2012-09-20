<?php

/*
 * Helper function: Wrapper for curl request
 *
 * @param string $path Drupal path to the data source view
 *
 * @param string $domain Host name for building request
 *
 * @param string $base_path Base path of drupal install. Used from building request.
 */
function getJsonExport($domain, $base_path, $path, $arguments = NULL) {
  // create a new cURL resource
  $ch = curl_init();

  $host = 'http://' . $domain;
  $base_path = $base_path;
  $arguments_path = ($arguments) ? '/' . $arguments : '';
  
  $absolute_path = $host . $base_path . $path . $arguments_path;
  
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

function loadOrganizations($m, $mongo_database, $domain, $base_path, $id = FALSE, $clear_data = FALSE) {

  $organizations = $m->$mongo_database->organizations;

  if ($clear_data == TRUE) {
    $organizations->drop();
  }
  // $organization_path = '../data/push/orgs-all.json';

  $organization_path = 'data/orgs-all';
  $file_data = getJsonExport($domain, $base_path, $organization_path, $id);

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
          "icon_small" => $node["Small logo"],
          "path" =>  '/' . str_replace($base_path, "", $node["Path"]),
          "organization_id" => $node["Org ID"],
          "name" => $node["Org name"],
          "organization_name_display"  => html_entity_decode($node["Org name"], ENT_QUOTES),
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
          "city_state" => html_entity_decode($city_state, ENT_QUOTES),
 
      )
    );

    // This will completely replace the record.
    $collection->update(array('id' => $node["Org ID"]), array('$set' => $newObj), true);
    $count++;
    // print_r($newObj);
  }
  // print  "</pre>";
  // echo 'organizations<br />';
  // return true;
}






function loadArtists($m, $mongo_database, $domain, $base_path, $id = FALSE, $clear_data = FALSE) {
  
  $artists = $m->$mongo_database->artists;
  $events_collection = $m->$mongo_database->events;

  // find everything in the collection
  $cursor =  $artists->find();
  
  if ($clear_data == TRUE) {
    $artists->drop();
  }

  $artists_path = 'data/artists-all';

  $file_data = getJsonExport($domain, $base_path, $artists_path, $id);
  $collection = $artists;
  /* var_dump($file_data); */
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();
  
  // print "<pre>";

  foreach ($objects as $obj_load) {
    $node = (array) $obj_load->node;
    
    $city_state = (!empty($node["City"]) && !empty($node["State"])) ? $node["City"] . ', ' . $node["State"] : '';

    // Generate list of organizations per artist

    // @TODO: Figure out how to get this data. Views (and put a loaddata callback in drupal)? Elsewhere in mongo and assume the data is already there?
    // All events for this artist
    $artist_path = '/' . str_replace($base_path, "", $node["Path"]);

    $events_cursor = $events_collection->find(array("properties.generative_artist_path" => $artist_path))->sort(array("properties.related_theater" => 1));

    $organizations_by_artist = array();
    $unique_organizations_by_artist = array();
    foreach ($events_cursor as $obj) {
      if(!empty($obj['id']) && !empty($obj['properties']['related_theater'])) {
        if (!in_array($obj['properties']['related_theater'], $unique_organizations_by_artist)) {

          // Add it to an array to check if things are unique
          $unique_organizations_by_artist[] = $obj['properties']['related_theater'];
          $organizations_by_artist[] = array(
            "name" => $obj['properties']['related_theater'],
            "path" => $obj['properties']['related_theater_path'],
          );
        }
      }
    }

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
          "icon_small" => $node["Small photo"],
          "path" =>  '/' . str_replace($base_path, "", $node["Path"]),
          "artist_id" => $node["Artist ID"],
          "content_type" => $node["Content Type"],
          "generative_artist" => $node["Generative artist"],
          "artist_name" => $node["Generative artist"],
          "artist_name_display" => html_entity_decode($node["Generative artist"], ENT_QUOTES),
          "artist_bio" => $node["Bio"],
          "ensemble_collective" => $node["ensemble_collective"],
          // "related_organizations" => $related_organizations_by_artist,
          "related_organizations" => $organizations_by_artist,
          "city" => $node["City"],
          "state" => $node["State"],
          "city_state" => html_entity_decode($city_state, ENT_QUOTES),
      )
    );

    // This will completely replace the record.
    $collection->update(array('id' => $node["Artist ID"]), array('$set' => $newObj), true);
    $count++;
    // print_r($newObj);
  }
  // print "</pre>";
  // echo 'artists<br />';
}






function loadEvents($m, $mongo_database, $domain, $base_path, $id = FALSE, $clear_data = FALSE) {
  
  $events = $m->$mongo_database->events;
  
  if ($clear_data == TRUE) {
    $events->drop();
  }

  $events_path = 'data/events-all';

  $file_data = getJsonExport($domain, $base_path, $events_path, $id);
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
    
    $related_theater_has_location = ($node["Organization coordinates"] != ',') ? TRUE : FALSE;
    $generative_artist_has_location = ($node["Generative artist coordinates"] != ',') ? TRUE : FALSE;
  
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
        "related_theater_path"  => '/' . str_replace($base_path, "", $node["Related theater path"]),
        "related_theater_id"  => $node["Related Theater ID"],
        "related_theater_has_location"  => $related_theater_has_location,
        "artist_id"  => $node["Artist ID"],
        "play_title"  => $node["Play title"],
        "play_title_display"  => html_entity_decode($node["Play title"], ENT_QUOTES),
        "related_play_id"  => $node["Related Play ID"],
        "related_play_path"  => '/' . str_replace($base_path, "", $node["Related play path"]),
        "generative_artist"  => $node["Generative Artist"],
        "generative_artist_has_location"  => $generative_artist_has_location,
        "generative_artist_path"  => '/' . str_replace($base_path, "", $node["Related artist path"]),
        "event_description"  => $node["Event description"],
        "synopsis"  => $node["Synopsis"],
        "path" =>  '/' . str_replace($base_path, "", $node["Path"]),
        "city" => $node["City"],
        "state" => $node["State"],
        "city_state" => html_entity_decode($city_state, ENT_QUOTES),
    )
    );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Event ID"]), array('$set' => $newObj), true);
    $count++;

    // print_r($newObj);
  }

  // print '</pre>';
  // echo 'events<br />';
}



function loadPlays($m, $mongo_database, $domain, $base_path, $id = FALSE, $clear_data = FALSE) {
  
  $plays = $m->$mongo_database->plays;

  if ($clear_data == TRUE) {
    $plays->drop();
  }

  // $plays_path = '../data/push/plays-all.json';
  $plays_path = 'data/plays-all';
  
  $file_data = getJsonExport($domain, $base_path, $plays_path, $id);
  
  $collection = $plays;
  
  $json = json_decode($file_data);
  
  $objects = $json->nodes;
  
  $count = 0;
  $insert = array();

  // print '<pre>';

  foreach ($objects as $obj_load) {

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
  
  $generative_artist_has_location = ($node["Generative artist coordinates"] != ',') ? TRUE : FALSE;
  
  // print_r($node);
  $newObj = array(
    "id" => $node["Play ID"],
    "type" => "Feature",
    "properties" => array(
      "play_id"  => $node["Play ID"],
      "content_type"  => $node["Content Type"],
      "artist_id"  => $node["Artist ID"],
      "play_title"  => $node["Play title"],
      "play_title_display"  => html_entity_decode($node["Play title"], ENT_QUOTES),
      "alternate_titles"  => $alternate_titles_list,
      "generative_artist"  => $node["Generative Artist"],
      "generative_artist_path"  => '/' . str_replace($base_path, "", $node["Related artist path"]),
      "generative_artist_has_location"  => $generative_artist_has_location,
      "synopsis"  => $node["Synopsis"],
      "path" =>  '/' . str_replace($base_path, "", $node["Path"]),
    )
  );
    // This will completely replace the record.
    $collection->update(array('id' => $node["Play ID"]), array('$set' => $newObj), true);
    $count++;
    // print_r($newObj);
  }
    // print '</pre>';
  // echo 'plays<br />';
}