var newPlayMap = newPlayMap || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

newPlayMap.filters.getOrganizationsIndex = function() {
  $.ajax({
    url:  'api/organizations_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setOrganizationsIndex,
    error: newPlayMap.filters.getOrgnanizationsIndexError
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

  $('.typeahead').typeahead(
    {
      source: organizationNames,
      items: 10
    }
  );
}

newPlayMap.filters.getOrgnanizationsIndexError = function(data) {
  console.log('error');

  // @TODO: Maybe remove / gray out the search filter if the index is not available?
}

newPlayMap.filters.organizationName = function(searchString) {
  console.log('searchString');
  console.log(searchString);
  
  // var playIdFromFilter;
  // for (organization in jsonDataSearch.organizationsIndex) {
  //   if (jsonDataSearch.organizationsIndex[organization].name == filterValue) {
  //     newPlayMap.filters.organizationName(jsonDataSearch.organizationsIndex[organization].id);
  //   }
  // }
  
  $.ajax({
    url:  'api/organizations_filter.php',
    dataType: 'json',
    data: {
      organization_name: searchString
    },
    success: newPlayMap.filters.setOrganizationMarkers,
    error: newPlayMap.filters.setOrganizationMarkersError
  });
}

newPlayMap.filters.setOrganizationMarkers = function(data) {
  // Successfully retrieved organizations from search
  // console.log(data);
  newPlayMap.filters.onLoadDataMarkers('vars', data.features);
}

newPlayMap.filters.setOrganizationMarkersError = function() {
  // Failed to retrieve organizations from search
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
        marker.setAttribute("marker_id", id);

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
  newPlayMap.filters.getOrganizationsIndex();
  
  $('#filters form').submit(function(event) {
    event.preventDefault();
    var filterValue = $('#filters input').val();
    
    newPlayMap.filters.organizationName(filterValue);
  });
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
