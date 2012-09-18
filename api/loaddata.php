<?php
include('../../authentication/newplaymap_authentication.php');
include('loaddata_functions.inc');
connectMongo(true);

$type = (!empty($_GET['type'])) ? $_GET['type'] : NULL;
$id = (!empty($_GET['id'])) ? $_GET['id'] : NULL;

$domain = $_SERVER['HTTP_HOST'];
$server_array = explode('?', $_SERVER['REQUEST_URI']);
$drupal_base_path = str_replace('api/loaddata.php', 'participate/', $server_array[0]);

if ($id && $type) {
  // Update a specific piece of content
  switch ($type) {
    case 'artist':
      loadArtists($m, $mongo_database, $domain, $drupal_base_path, $id);
    break;
    case 'event':
      loadEvents($m, $mongo_database, $domain, $drupal_base_path, $id);
    break;
    case 'organization':
      loadOrganizations($m, $mongo_database, $domain, $drupal_base_path, $id);
    break;
    case 'play':
      loadPlays($m, $mongo_database, $domain, $drupal_base_path, $id);
    break;
  }
} else {
  // Run everything
  loadOrganizations($m, $mongo_database, $domain, $drupal_base_path, FALSE, TRUE);
  loadArtists($m, $mongo_database, $domain, $drupal_base_path, FALSE, TRUE);
  loadEvents($m, $mongo_database, $domain, $drupal_base_path, FALSE, TRUE);
  loadPlays($m, $mongo_database, $domain, $drupal_base_path, FALSE, TRUE);
}

/* echo $json; */
echo "done<br />";
?>