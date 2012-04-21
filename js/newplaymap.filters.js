var newPlayMap = newPlayMap || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

/*
 * Event type
 */
newPlayMap.filters.eventType = function(searchString) {
 $.ajax({
   url:  'api/event_type_filter.php',
   dataType: 'json',
   data: {
     event_type: searchString
   },
   success: newPlayMap.filters.setEventTypeMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setEventTypeMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' events loaded', data);
}

/*
 * Event date range
 */
newPlayMap.filters.eventDates = function(startDate, endDate) {
 $.ajax({
   url:  'api/event_date_filter.php',
   dataType: 'json',
   data: {
     start_date: startDate,
     end_date: endDate
   },
   success: newPlayMap.filters.setEventDatesMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setEventDatesMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' events loaded', data);
}

/*
 * Organizations
 */
newPlayMap.filters.getOrganizationsIndex = function() {
  $.ajax({
    url:  'api/organizations_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setOrganizationsIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setOrganizationsIndex = function(data) {
  jsonDataSearch.organizationsIndex = data;
  
  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.organizationsIndex) {
  //   organizationNames.push(jsonDataSearch.organizationsIndex[organization].name);
  // }
  
  // If we are returning just the names, then the raw data is fine
  var organizationNames = data;

  $('#organizations-filter').typeahead(
    {
      source: organizationNames,
      items: 10
    }
  );
}

/*
 * Function to find organization feature from the name.
 * Used when submitting the filter form
 */
newPlayMap.filters.organizationName = function(searchString) {
  newPlayMap.loadAPICall({
    data: {organization_name: searchString},
    zoomLevel: 10,
    clearLayer: true,
    clearLayers: true,
    template: "organization",
    layer: "layer-organization-filter",
    class: "active",
    path: 'api/organizations_filter.php',
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organization_filter",
    dataPath: "api/organizations_filter.php",
    icon: "icons/organization.png",
    grouping_field: "organization_id",
    callback: newPlayMap.loadOrganizationFilter 
  });
}


/*
 * Organization type
 */
newPlayMap.filters.organizationType = function(searchString) {
 $.ajax({
   url:  'api/organization_type_filter.php',
   dataType: 'json',
   data: {
     organization_type: searchString
   },
   success: newPlayMap.filters.setOrganizationTypeMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setOrganizationTypeMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' organizations loaded', data);
  var searchString = 'Pork!';
  
  newPlayMap.loadAPICall({
    data: {organization_name: searchString},
    zoomLevel: 10,
    template: "organization",
    layer: "layer-organization-filter",
    class: "active",
    path: 'api/organization_type_filter.php',
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organization_path_filter",
    dataPath: "api/organization_path_filter.php",
    icon: "icons/organization.png",
    grouping_field: "organization_id",
    callback: newPlayMap.loadOrganizationFilter 
  });
}

/*
 * Organizations by Special Interest
 */
newPlayMap.filters.organizationSpecialInterests = function(searchString) {
 $.ajax({
   url:  'api/organization_special_interests_filter.php',
   dataType: 'json',
   data: {
     special_interests: searchString
   },
   success: newPlayMap.filters.setOrganizationSpecialInterestsMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setOrganizationSpecialInterestsMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' organizations loaded', data);
}

/*
 * Organizations by National Network
 */
newPlayMap.filters.organizationNationalNetworks = function(searchString) {
 $.ajax({
   url:  'api/organization_national_networks_filter.php',
   dataType: 'json',
   data: {
     national_networks: searchString
   },
   success: newPlayMap.filters.setOrganizationNationalNetworksMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setOrganizationNationalNetworksMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' organizations loaded', data);
}

/*
 * Ensembles and collective
 * Return both organizations and artists
 */
newPlayMap.filters.ensemble = function(searchString) {

 $.ajax({
   url:  'api/ensemble_collective_filter.php',
   dataType: 'json',
   data: {
     ensemble_collective: searchString
   },
   success: newPlayMap.filters.setEnsembleMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setEnsembleMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' artists and organizations loaded', data);
}

/*
 * Artists
 */
newPlayMap.filters.getArtistsIndex = function() {
  $.ajax({
    url:  'api/artists_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setArtistsIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setArtistsIndex = function(data) {
  jsonDataSearch.artistsIndex = data;
  
  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.ArtistsIndex) {
  //   organizationNames.push(jsonDataSearch.artistsIndex[organization].name);
  // }
  
  // If we are returning just the names, then the raw data is fine
  var artistsNames = data;

  $('#artists-filter').typeahead(
    {
      source: artistsNames,
      items: 10
    }
  );
}

newPlayMap.filters.artists = function(searchString) {
 $.ajax({
   url:  'api/artists_filter.php',
   dataType: 'json',
   data: {
     artist_name: searchString
   },
   success: newPlayMap.filters.setArtistMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setArtistMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' artists loaded', data);
}

/*
 * Plays
 */
newPlayMap.filters.getPlaysIndex = function() {
  $.ajax({
    url:  'api/plays_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setPlaysIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setPlaysIndex = function(data) {
  jsonDataSearch.playsIndex = data;
  
  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.PlaysIndex) {
  //   organizationNames.push(jsonDataSearch.PlaysIndex[organization].name);
  // }
  
  // If we are returning just the names, then the raw data is fine
  var playNames = data;

  $('#plays-filter').typeahead(
    {
      source: playNames,
      items: 10
    }
  );
}


newPlayMap.filters.plays = function(searchString) {
 $.ajax({
   url:  'api/plays_filter.php',
   dataType: 'json',
   data: {
     play_title: searchString
   },
   success: newPlayMap.filters.setPlayMarkers,
   error: newPlayMap.filters.error
 });
}

newPlayMap.filters.setPlayMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' play(s) loaded', data);
}


/*
 * Utility function shared by multiple ajax calls
 */
newPlayMap.filters.error = function(data) {
  console.log('error');

  // @TODO: Maybe remove / gray out the search filter if the index is not available?
}

newPlayMap.filters.feedback = function(message, data) {
  // Can either use an alert or console. Made this to more easily demostrate things to folks without console
  alert(message);
  console.log(data);
}

newPlayMap.filters.reset = function(exception) {
  var exception = exception || '';
  $('#filters form').children('input').not('.submit-filters').not($(exception)).each(function() {
    $(this).val('').attr('checked', false);
  });

  $('#filters form').children('select').not(exception).each(function() {
    $(this).children().eq(0).attr('selected', 'selected');
  });
  
  if (exception !== '.event-date-field') {
    $('#filters .event-date-filter-complete').fadeOut();
  }
}



/* 
 * Pulled from newplaymap.data.js almost in it's entirety. 
 * Whatever chach does to that should probably be done here too
*/
newPlayMap.filters.onLoadDataMarkers = function(vars, features) {
    var vars = vars;
    var features = features;
  
    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var len = features.length,
        locations = [];  
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            // id = feature.properties[vars.id],
            marker = document.createElement("div");

        marker.feature = feature;
        markers.addMarker(marker, feature);

        // Unique hash marker id for link
/*         marker.id = "marker-" + vars.type + "-" + id; */
        // marker.setAttribute("id", "marker-" + vars.type + "-" + id);
        // marker.setAttribute("dataName", vars.dataName);
        marker.setAttribute("class", "marker");
        // marker.setAttribute("href", vars.dataPath);
        // marker.setAttribute("type", vars.type);

        // Specially set value for loading data.
        // marker.setAttribute("marker_id", id);

        // @TODO add popup tooltip here
        // give it a title
        marker.setAttribute("title", [
          // feature.properties[vars.title]
        ]);

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
        // img.setAttribute("src", vars.icon);
 

        // Determine placement of highlighting by geocoordinates.
        // if(vars.grouping_field !== undefined) {
        // 
          // marker.setAttribute("grouping_field", vars.grouping_field);
          // marker.setAttribute("grouping_value", feature.properties[vars.grouping_field]);
        
          // if (feature.properties[vars.grouping_field] in locationsByID) {
            // locationsByID[feature.properties[vars.grouping_field]].push(marker.location);
          // } else {
            // locationsByID[feature.properties[vars.grouping_field]] = [marker.location];
          // }
        // }
        // else {
          // Add all of the locations to the array. making them unique for all layers
          // if (feature.properties[vars.id] in locationsByID) {
            // locationsByID[feature.properties[vars.id]].push(marker.location);
          // } else {
            // locationsByID[feature.properties[vars.id]] = [marker.location];
          // }
        // }

        // add the marker's location to the extent list
        locations.push(marker.location);

        // Listen for mouseover & mouseout events.
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // Tell the map to fit all of the locations in the available space
    
    // @TODO this will run on the last loaded item, which may make behavior strange.
    // Actually no it is probably fine so long as locations is global.
    // map.setExtent(locations);

    // Set that each marker layer was loaded.
    // newPlayMap.status.markersLoaded[vars.type] = true;
};


$(document).ready(function() {
  // @TODO: Don't load the index on page load, do it when the filters are shown
  newPlayMap.filters.getOrganizationsIndex();
  newPlayMap.filters.getArtistsIndex();
  newPlayMap.filters.getPlaysIndex();
  
  /*
   * Trigger api calls on the form elements
   */
  $('#plays-filter').change(function() {
    newPlayMap.filters.plays($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#event-type-filter').change(function() {
    newPlayMap.filters.eventType($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#organization-type-filter').change(function() {
    newPlayMap.filters.organizationType($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#organizations-filter').change(function() {
    newPlayMap.filters.organizationName($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#organization-national-networks-filter').change(function() {
    newPlayMap.filters.organizationNationalNetworks($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });

  $('#organization-special-interests-filter').change(function() {
    newPlayMap.filters.organizationSpecialInterests($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });

  $('#artists-filter').change(function() {
    newPlayMap.filters.artists($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#ensemble-collective-filter').change(function() {
    newPlayMap.filters.ensemble('Ensemble / Collective');
    newPlayMap.filters.reset(this);
  });
  
  $('.event-date-field').focus(function() {
    $('#filters .event-date-filter-complete').fadeIn('slow');
    newPlayMap.filters.reset('.event-date-field');
  });
  $('#filters .event-date-filter-complete').hide().click(function(event) {
    event.preventDefault();
    
    newPlayMap.filters.eventDates($('#event-date-filter').val(),$('#event-to-date-filter').val());
  });
  
  // $('#filters form').submit(function(event) {
  //   event.preventDefault();
  //   var organizationsFilterValue = $('#organizations-filter').val();
  //   
  //   newPlayMap.filters.organizationName(organizationsFilterValue);
  // });
});

// 
// 
// var filters={};
// filters.data = {};
// filters.data.organizations = {};
// 
// filters.organizations = function() {
// 
//     var features = data.organizationData.features,
//         len = features.length,
//         locations = [];
// 
// filters.data.organizations.names = {};
// 
//     for (var i = 0; i < len; i++) {
//             var feature = features[i],
//             id = feature.properties["organization_id"];
//       
//       filters.data.organizations.titles += {feature.title: id};    
//       filters.data.organizations.titles += {feature.properties.name: id};
// 
// 
//     }
// 
// 
// 
// };
