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
  $events_collection = $m->$mongo_database->events;

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
    
    // Add Related Play info to Orgs (in order to build the orgs per play list)
    // AND Add Related Organization info to Orgs (in order to build the orgs per org list)
    // AND Add Related Artist info to Orgs (in order to build the orgs per artist list)
    // -- It's the same loop, building different sets of data
    $organization_path = '/' . str_replace($base_path, "", $node["Path"]);
    $events_cursor = $events_collection->find(
      array('$or' => array(
        array("properties.related_theater_path" => $organization_path),
        array("properties.partner_organizations.path" => $organization_path),
      ))
    )->sort(array("properties.related_theater" => 1));

    $plays_by_organization = array();
    $unique_plays_by_organization = array();
    $organizations_by_organization = array();
    $unique_organizations_by_organization = array();
    $artists_by_organization = array();
    $unique_artists_by_organization = array();
    foreach ($events_cursor as $obj) {
      if(!empty($obj['id']) && !empty($obj['properties']['play_title'])) {
        if (!in_array($obj['properties']['related_play_path'], $unique_plays_by_organization)) {

          // Add it to an array to check if things are unique
          $unique_plays_by_organization[] = $obj['properties']['related_play_path'];
          $plays_by_organization[] = array(
            "name" => $obj['properties']['play_title_display'],
            "path" => $obj['properties']['related_play_path'],
          );
        }
      }

      if (!empty($obj['properties']['partner_organizations'][0]['path'])) {
        foreach ($obj['properties']['partner_organizations'] as $partner_organization) {
          if (
            !in_array($partner_organization['path'], $unique_plays_by_organization)
            // && $organization_path != $partner_organization['path']
          ) {

            // Add it to an array to check if things are unique
            $unique_plays_by_organization[] = $partner_organization['path'];
            $plays_by_organization[] = array(
              "name" => $partner_organization['name'],
              "path" => $partner_organization['path'],
              "has_location" => $partner_organization['has_location'],
            );
          }
        }
      }

      // Add all the main related theaters to the lsit
      if(!empty($obj['id']) && !empty($obj['properties']['related_theater_path'])) {
        if (
          !in_array($obj['properties']['related_theater_path'], $unique_organizations_by_organization)
          // && $organization_path != $obj['properties']['related_theater_path']
        ) {

          // Add it to an array to check if things are unique
          $unique_organizations_by_organization[] = $obj['properties']['related_theater_path'];
          $organizations_by_organization[] = array(
            "name" => $obj['properties']['related_theater'],
            "path" => $obj['properties']['related_theater_path'],
            "has_location" => $obj['properties']['related_theater_has_location'],
          );
        }

        if (!empty($obj['properties']['partner_organizations'][0]['path'])) {
          foreach ($obj['properties']['partner_organizations'] as $partner_organization) {
            if (
              !in_array($partner_organization['path'], $unique_organizations_by_organization)
              // && $organization_path != $partner_organization['path']
            ) {

              // Add it to an array to check if things are unique
              $unique_organizations_by_organization[] = $partner_organization['path'];
              $organizations_by_organization[] = array(
                "name" => $partner_organization['name'],
                "path" => $partner_organization['path'],
                "has_location" => $partner_organization['has_location'],
              );
            }
          }
        }
      }
      
      if(!empty($obj['id']) && !empty($obj['properties']['generative_artist'])) {
        if (!in_array($obj['properties']['generative_artist'], $unique_artists_by_organization)) {
    
          // Add it to an array to check if things are unique
          $unique_artists_by_organization[] = $obj['properties']['generative_artist'];
          $artists_by_organization[] = array(
            "name" => $obj['properties']['generative_artist'],
            "path" => $obj['properties']['generative_artist_path'],
          );
        }
      }
    }
    
    // Order the related organizations by name (http://www.php.net/manual/en/function.array-multisort.php)
    // Obtain a list of columns
    $organizations_by_organization_name = array();
    foreach ($organizations_by_organization as $key => $row) {
        $organizations_by_organization_name[$key]  = $row['name'];
    }
    // Sort the organizations with name ascending
    // Add $organizations_by_organization as the last parameter, to sort by the common key
    array_multisort($organizations_by_organization_name, SORT_ASC, $organizations_by_organization);

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
          "organization_type" => $org_list,
          "special_interests" => $special_interests_list,
          "national_networks" => $national_networks_list,
          "related_plays" => $plays_by_organization,
          "related_artists" => $artists_by_organization,
          "related_organizations" => $organizations_by_organization,
          "founding_date" => $node["Founding date"],
          "website" => preg_replace('/https*:\/\/w*\.*/', '', $node["Website"]),
          "budget" => str_replace(')', '', preg_replace('/Group [0-9] \(/', '', $node["Budget"])),
          "street" => $node["Street"],
          "postal_code" => $node["Postal Code"],
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

    //Generate list of organizations per artist
    $artist_path = '/' . str_replace($base_path, "", $node["Path"]);
    $events_cursor = $events_collection->find(array("properties.generative_artist_path" => $artist_path))->sort(array("properties.related_theater" => 1));

    $organizations_by_artist = array();
    $unique_organizations_by_artist = array();
    foreach ($events_cursor as $obj) {
      if(!empty($obj['id']) && !empty($obj['properties']['related_theater'])) {
        if (!in_array($obj['properties']['related_theater_path'], $unique_organizations_by_artist)) {

          // Add it to an array to check if things are unique
          $unique_organizations_by_artist[] = $obj['properties']['related_theater_path'];
          $organizations_by_artist[] = array(
            "name" => $obj['properties']['related_theater'],
            "path" => $obj['properties']['related_theater_path'],
          );
        }
      }

      if (!empty($obj['properties']['partner_organizations'][0]['path'])) {
        foreach ($obj['properties']['partner_organizations'] as $partner_organization) {
          if (!in_array($partner_organization['path'], $unique_organizations_by_artist)) {

            // Add it to an array to check if things are unique
            $unique_organizations_by_artist[] = $partner_organization['path'];
            $organizations_by_artist[] = array(
              "name" => $partner_organization['name'],
              "path" => $partner_organization['path'],
              "has_location" => $partner_organization['has_location'],
            );
          }
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
          "website" => preg_replace('/https*:\/\/w*\.*/', '', $node["Website"]),
          "facebook" => preg_replace('/https*:\/\/w*\.*/', '', $node["Facebook"]),
          "twitter" => preg_replace('/https*:\/\/w*\.*/', '', $node["Twitter"]),
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
    
    // Process Partner Orgs
    $partner_organizations = json_decode($node['Partner Organizations Data']);
    // $dsm(json_decode($node['Partner Organizations Data']));
    // $partner_organizations = str_replace('"', "", $node['Partner Organizations Data']);
  
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
        "partner_organizations" => $partner_organizations,
        
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
  $events_collection = $m->$mongo_database->events;

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
    
    //Generate list of organizations per play
    $play_path = '/' . str_replace($base_path, "", $node["Path"]);
    $events_cursor = $events_collection->find(array("properties.related_play_path" => $play_path))->sort(array("properties.related_theater" => 1));

    $organizations_by_play = array();
    $unique_organizations_by_play = array();
    foreach ($events_cursor as $obj) {
      if(!empty($obj['id']) && !empty($obj['properties']['related_theater'])) {
        if (!in_array($obj['properties']['related_theater'], $unique_organizations_by_play)) {

          // Add it to an array to check if things are unique
          $unique_organizations_by_play[] = $obj['properties']['related_theater'];
          $organizations_by_play[] = array(
            "name" => $obj['properties']['related_theater'],
            "path" => $obj['properties']['related_theater_path'],
          );
        }
      }
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
        "play_title_display"  => html_entity_decode($node["Play title"], ENT_QUOTES),
        "alternate_titles"  => $alternate_titles_list,
        "generative_artist"  => $node["Generative Artist"],
        "generative_artist_path"  => '/' . str_replace($base_path, "", $node["Related artist path"]),
        "generative_artist_has_location"  => $generative_artist_has_location,
        "related_organizations" => $organizations_by_play,
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