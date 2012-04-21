var newPlayMap = newPlayMap || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

/*
 * Function to find organization feature from the name.
 * Used when submitting the filter form
 */
newPlayMap.filters.organizations = function(data) {
  var pathQuery = "";
  
  if (data.organization_name !== undefined) {
    pathQuery = "&organization_name=" +  data.organization_name;
  }

  if (data.organization_name !== undefined) {
    pathQuery = "&organization_type=" +  data.organization_type;
  }

  if (data.national_networks !== undefined) {
    pathQuery = "&national_networks=" +  data.national_networks;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    template: "organization",
    layer: "layer-organization-filter",
    class: "active",
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organizations_filter",
    path: 'api/organizations_filter.php?' + pathQuery,
    dataPath: "api/organizations_filter.php?" + pathQuery,
    icon: "icons/organization.png",
/*     grouping_field: data.grouping_field, */
    callback: newPlayMap.loadOrganizationFilter 
  });
}

// Load plays
newPlayMap.filters.plays = function(data) {
  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-plays-filter",
    class: "active",
    label: "play_title",
    id: "event_id",
    title: "play_title",
    template: "play",
    type: "play",
    dataName: "play",
    path: "api/journey.php?play_title=" +  data.play_title,
    dataPath: "api/journey.php?play_title=" +  data.play_title,
    icon: "icons/play.png",
    grouping_field: "related_play_id",
    callback: newPlayMap.loadJourney 
  });
};


// Load plays
newPlayMap.filters.events = function(data) {
  var pathQuery = "";
  
  if (data.event_type !== undefined) {
    pathQuery = "&event_type=" +  data.event_type;
  }

  if (data.event_date !== undefined) {
    pathQuery = "&event_date=" +  data.event_date;
  }

  if (data.event_to_date !== undefined) {
    pathQuery = "&event_to_date=" +  data.event_to_date;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-events-filter",
    class: "active",
    id: "event_id",
    label: "related_theater", // field which will be used in label
    title: "play_title",
    template: "play",
    type: "play",
    dataName: "events_filter",
    path: "api/events_filter.php?" + pathQuery,
    dataPath: "api/events_filter.php?" + pathQuery,
    icon: "icons/event.png",
    grouping_field: "event_id",
    related_play_id: "related_play_id",
    callback: newPlayMap.loadEvent 
  });
};


newPlayMap.filters.setupFilters = function() {

  /*
   * Trigger api calls on the form elements
   */
  $('#plays-filter').change(function() {
    newPlayMap.filters.plays({play_title: $(this).attr('value')});
    newPlayMap.filters.reset(this);
    return false;
  });

  $('#event-type-filter').change(function() {
    newPlayMap.filters.events({event_type: $(this).attr('value')});
    newPlayMap.filters.reset(this);
    return false;
  });

  
  $('.event-date-field').focus(function() {
    $('#filters .event-date-filter-complete').fadeIn('slow');
    newPlayMap.filters.reset('.event-date-field');
  });

  $('#filters .event-date-filter-complete').hide().click(function(event) {
    event.preventDefault();
    
    newPlayMap.filters.events({event_date: $('#event-date-filter').val(), event_to_date: $('#event-to-date-filter').val() });
    return false;
  });


  $('#organizations-filter').change(function() {
    newPlayMap.filters.organizations({organization_name: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });
  


  $('#organization-type-filter').change(function() {
    newPlayMap.filters.organizations({organization_type: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });

  $('#organization-national-networks-filter').change(function() {
    newPlayMap.filters.organizations({national_networks: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });
  /*
  $('#organization-special-interests-filter').change(function() {
    newPlayMap.filters.organizationSpecialInterests($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
*/




  // @TODO: Don't load the index on page load, do it when the filters are shown
  newPlayMap.filters.getOrganizationsIndex();
  newPlayMap.filters.getArtistsIndex();
  newPlayMap.filters.getPlaysIndex();
  


  


  $('#artists-filter').change(function() {
    newPlayMap.filters.artists($(this).attr('value'));
    newPlayMap.filters.reset(this);
  });
  
  $('#ensemble-collective-filter').change(function() {
    newPlayMap.filters.ensemble('Ensemble / Collective');
    newPlayMap.filters.reset(this);
  });



};

  
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



/***/

newPlayMap.filters.setEventTypeMarkers = function(data) {
  // Success
  newPlayMap.filters.feedback(data.count + ' events loaded', data);
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
    path: 'api/organization_type_filter.php?',
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organization_path_filter",
    dataPath: "api/organization_path_filter.php?",
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

