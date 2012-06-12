<?php
include('../../../authentication/newplaymap_authentication.php');
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
      loadArtists($m, $domain, $drupal_base_path, $id);
    break;
    case 'event':
      loadEvents($m, $domain, $drupal_base_path, $id);
    break;
    case 'organization':
      loadOrganizations($m, $domain, $drupal_base_path, $id);
    break;
    case 'play':
      loadPlays($m, $domain, $drupal_base_path, $id);
    break;
  }
} else {
  // Run everything
  loadOrganizations($m, $domain, $drupal_base_path);
  loadArtists($m, $domain, $drupal_base_path);
  loadEvents($m, $domain, $drupal_base_path);
  loadPlays($m, $domain, $drupal_base_path);
}

/* echo $json; */
echo "done<br />";
?>